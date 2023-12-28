'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.parseRule = exports.getRules = exports.saveRules = undefined;

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _dns = require('dns');

var _dns2 = _interopRequireDefault(_dns);

var _tools = require('../tools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var parseOneRule = void 0,
    parseBranch = void 0,
    parseOneBranch = void 0,
    _execParse = void 0,
    standardUrl = void 0; /**
                           * 规则管理入口
                           */

var isStringReg = /^\/.+\/$/;
var isStartHttp = /^http(s)?:\/\//;
var isStartSlash = /^\//;
var escapeReg = /(\*|\.|\?|\+|\$|\^|\[|\]|\(|\)|\{|\}|\||\\|\/)/g;

/**
 * 保存规则
 * @param  {[type]} rules 规则数据
 */
var saveRules = exports.saveRules = function saveRules(rules) {
	// 覆盖旧的rule
	config.set('hosts', rules);
	// 存入文件中
	config.save('hosts');
};

/**
 * 获取规则
 * @return {[Array]} 获取到得规则对象
 */
var getRules = exports.getRules = function getRules() {
	return config.get('hosts') || [];
};

/**
 *   messageInfo 包含的信息
 *  {
 *    headers: "请求头"
 *		host: "请求地址"
 *		method: "请求方法"
 *		protocol: "请求协议"
 *		originalFullUrl: "原始请求地址，包括参数"
 *		req: "请求对象，请勿删除"
 *		port: "请求端口"
 *		startTime: "请求开始时间"
 *		path: "请求路径，包括参数"
 *		originalUrl: "原始的请求地址,不包括参数,请不要修改"
 *	}
 */
var parseRule = exports.parseRule = function parseRule(messageInfo) {
	var rules = getRules();
	if (!rules || !rules.length) {
		return _promise2.default.resolve(messageInfo);
	}
	// 多个信息以|| 分割
	messageInfo.ruleInfo = [];
	return _execParse(rules.map(function (current) {
		return {
			fun: parseOneRule,
			param: [current, messageInfo]
		};
	})).then(function (result) {
		if (result) {
			delete result.__match;
			messageInfo.ruleInfo = messageInfo.ruleInfo.join('||');
			if (!messageInfo.ruleInfo) {
				delete messageInfo.ruleInfo;
			}
			return result;
		}
		return messageInfo;
	});
};

parseOneRule = function parseOneRule(group, messageInfo) {
	var branches = void 0;
	branches = group.branch;
	// 如果禁用这个分组直接跳出,不存在分支
	if (group.disable || !branches || !branches.length || messageInfo.__match) {
		return;
	}
	return _execParse(branches.map(function (current) {
		return {
			fun: parseBranch,
			param: [current, messageInfo, group.name]
		};
	}));
};

parseBranch = function parseBranch(branch, messageInfo, name) {
	var rules = branch.rules;
	if (branch.disable || !rules || !rules.length || messageInfo.__match) {
		return;
	}
	return _execParse(rules.map(function (current) {
		return {
			fun: parseOneBranch,
			param: [current, messageInfo, name, branch.name]
		};
	}));
};

parseOneBranch = function parseOneBranch(rule, messageInfo, groupName, branchName) {
	var test = rule.test,
	    exec = rule.exec,
	    type = rule.type,
	    _rule$virtualPath = rule.virtualPath,
	    virtualPath = _rule$virtualPath === undefined ? '' : _rule$virtualPath;

	if (isStringReg.test(test)) {
		test = test.slice(1, test.length - 1);
	} else {
		test = isStartHttp.test(test) ? test : messageInfo.protocol === 'https' ? 'https://' + test : 'http://' + test;
		test = test.replace(escapeReg, '\\$1');
		test = '^' + test;
	}
	// 将test转换成正则
	test = new RegExp(test);
	// 如果url被替换过，则使用replaceUrl
	var currentUrl = messageInfo.replaceUrl || messageInfo.originalFullUrl;
	// 测试没有通过
	if (!test.test(currentUrl) || rule.disable) {
		return;
	}
	// 设置了 weinre
	if (type === 'weinre') {
		messageInfo.weinre = true;
		return;
	}
	// 正则替换，即用正则替换url
	// 替换后还可以执行下一个规则
	// 使用exec替换test
	if (type === 'regReplace') {
		var newUrl = currentUrl.replace(test, exec);
		_log2.default.debug('replace url:' + newUrl);
		var execObj = standardUrl(newUrl, messageInfo.protocol);
		messageInfo.host = execObj.host;
		messageInfo.protocol = execObj.protocol.split(':')[0];
		messageInfo.port = execObj.port ? execObj.port : messageInfo.protocol === 'https' ? 443 : 80;
		messageInfo.path = type === 'host' ? messageInfo.path : execObj.path;
		messageInfo.replaceUrl = execObj.href;
		messageInfo.ruleInfo.push('\u6B63\u5219\u66FF\u6362url\uFF1A' + newUrl);
		return;
	}
	// 已经匹配了
	if (messageInfo.__match) {
		return;
	}
	messageInfo.__match = true;
	_log2.default.debug('\u89E3\u6790\u89C4\u5219,\u5F53\u524Durl:' + currentUrl + ', \u89C4\u5219\u7C7B\u578B:' + type + ',\u89C4\u5219\u6B63\u5219' + test + ',\u89C4\u5219\u6267\u884C' + exec);
	switch (type) {
		// host模式下只能修改 host protocol port
		case 'host':
		// 远程文件替换整个url路径包括参数
		case 'remoteFile':
			if (exec) {
				// 转换成一个url的对象
				var _execObj = standardUrl(exec, messageInfo.protocol);
				messageInfo.host = _execObj.host;
				messageInfo.protocol = _execObj.protocol.split(':')[0];
				messageInfo.port = _execObj.port ? _execObj.port : messageInfo.protocol === 'https' ? 443 : 80;
				messageInfo.path = type === 'host' ? messageInfo.path : _execObj.path;
				// log.debug('', messageInfo.protocol, messageInfo.port, exec);
				messageInfo.ruleInfo.push('\u5206\u7EC4:' + groupName + '-\u5206\u652F:' + branchName + '-\u89C4\u5219\u7C7B\u578B:' + type + '-\u89C4\u5219\u6B63\u5219:' + test + '-\u89C4\u5219\u6267\u884C:' + exec);
			} else {
				// 没有配置exec如果是 host就访问线上，如果是 remoteFile就跳过
				if (type === 'host') {
					return new _promise2.default(function (resolve, reject) {
						_dns2.default.resolve(messageInfo.host.split(':')[0], function (err, addresses) {
							if (err || !addresses || !addresses.length) {
								_log2.default.error('\u89C4\u5219\u89E3\u6790\u4E2D, dns\u89E3\u6790\u51FA\u73B0\u9519\u8BEF\uFF0C\u89C4\u5219\u7C7B\u578B:' + type + ',\u89C4\u5219\u6B63\u5219' + test);
								reject(messageInfo);
							} else {
								messageInfo.host = addresses[0];
								resolve(messageInfo);
							}
						});
					});
				}
			}
			break;
		case 'redirect':
			if (exec) {
				messageInfo.redirect = isStartHttp.test(exec) ? exec : messageInfo.protocol + '://' + exec;
				messageInfo.ruleInfo.push('\u5206\u7EC4:' + groupName + '-\u5206\u652F:' + branchName + '-\u89C4\u5219\u7C7B\u578B:' + type + '-\u89C4\u5219\u6B63\u5219:' + test + '-\u89C4\u5219\u6267\u884C:' + exec);
			}
			break;
		case 'localFile':
			if (exec) {
				messageInfo.sendToFile = exec;
				messageInfo.ruleInfo.push('\u5206\u7EC4:' + groupName + '-\u5206\u652F:' + branchName + '-\u89C4\u5219\u7C7B\u578B:' + type + '-\u89C4\u5219\u6B63\u5219:' + test + '-\u89C4\u5219\u6267\u884C:' + exec);
			}
			break;
		case 'localDir':
			if (exec) {
				// 去掉hash和param
				var p = messageInfo.path.split('?')[0];
				p = messageInfo.path.split('#')[0];
				if (!isStartSlash.test(virtualPath)) {
					virtualPath = '/' + virtualPath;
				}
				p = p.replace(new RegExp('^' + virtualPath), '');
				messageInfo.sendToFile = _path2.default.join(exec, p);
				messageInfo.ruleInfo.push('\u5206\u7EC4:' + groupName + '-\u5206\u652F:' + branchName + '-\u89C4\u5219\u7C7B\u578B:' + type + '-\u89C4\u5219\u6B63\u5219:' + test + '-\u89C4\u5219\u6267\u884C:' + exec);
			}
			break;
		default:
	}
	return messageInfo;
};
// 转换url为一个标准对象
standardUrl = function standardUrl(originalUrl, protocol) {
	originalUrl = isStartHttp.test(originalUrl) ? originalUrl : protocol + '://' + originalUrl;
	return _url2.default.parse(originalUrl);
};

/**
 * 按tasks的顺序执行promise
 *
 * @param  {[array]} tasks  [任务列表]
 * [{
 * 	fun: fun,
 * 	param: [param]
 * }]
 * index 从第几个开始执行
 * 每个函数会得到多个参数，参数的最后一个是 前一个 任务得执行结果
 * @return {[promise]}        [promise]
 */
_execParse = function execParse(tasks, index, preResult) {
	if (!tasks || !tasks.length) {
		return _promise2.default.resolve();
	}
	if (!index) {
		index = 0;
	}
	var current = tasks[index];
	var next = tasks[index + 1];
	var result = null;
	if (typeof current === 'function') {
		if (preResult) {
			result = current.apply(null, [preResult]);
		} else {
			result = current.apply(null, []);
		}
	} else {
		var param = current.param || [];
		if (preResult) {
			param.push(preResult);
		}
		result = current.fun.apply(null, param);
	}
	result = _promise2.default.resolve(result);
	return result.then(function (res) {
		return next ? _execParse(tasks, index + 1, res) : res;
	});
};
// test===========

// let messageInfo = {
// 	headers: {},
// 	host: "g.caipiao.163.com",
// 	protocol: "http",
// 	port: 80,
// 	path: "/caipiao/test/mm/bb.html",
// 	originalFullUrl: "http://g.caipiao.163.com/caipiao/test/mm/bb.html"
// };
// parseRule(messageInfo)
// .then((result) => {
// 	log.debug(result);
// });

// parseOneBranch({
// 	type: "host",
// 	test: '/zhuhu.com/test/',
// 	exec: "http://192.168.199.100/test?aaa"
// }, messageInfo);

// parseOneBranch({
// 	type: "remoteFile",
// 	test: '/zhuhu.com/test/',
// 	exec: "http://192.168.199.100/test?aaa"
// }, messageInfo);
//

// parseOneBranch({
// 	type: "localFile",
// 	test: '/zhuhu.com/test/',
// 	exec: "D:/test/1111/1222"
// }, messageInfo);

// parseOneBranch({
// 	type: "localDir",
// 	test: '/zhuhu.com/test/',
// 	exec: "D:/test/1111/cjx",
// 	virtualPath: "/test/"
// }, messageInfo);

// console.log(standardUrl("test:8080?a=1"));