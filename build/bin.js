'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _read = require('read');

var _read2 = _interopRequireDefault(_read);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _cert = require('./cert/cert.js');

var cert = _interopRequireWildcard(_cert);

var _configProps = require('./config/configProps');

var _configProps2 = _interopRequireDefault(_configProps);

var _tools = require('./tools');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('uncaughtException', _tools.error);
// 将字段变成list
var numReg = /^([0-9]){2,}$/;
var list = function list(val) {
	val = val.split(',');
	val = val.filter(function (current) {
		return numReg.test(current);
	});
	return val.length ? val : undefined;
};
var convertToInt = function convertToInt(num) {
	var val = parseInt(num);
	return isNaN(val) ? undefined : val;
};

function promptCert(prompt, callback) {
	if (!callback) {
		return;
	}
	(0, _read2.default)({ prompt: prompt }, function (error, answer) {
		if (error) {
			_log2.default.error(error);
			return process.exit(1);
		}
		if (answer === '是' || answer === 'yes' || answer === 'y') {
			callback();
			process.exit(0);
		} else if (answer === '否' || answer === 'n' || answer === 'n') {
			process.exit(0);
		} else {
			promptCert(_colors2.default.green('请输入y或者n?'), callback);
		}
	});
}

// 说明，注意不要改空格，否则输出到 控制台会变样
var out = '\n  *****\u8BF4\u660E******\uFF1A\n\t\'-v\' \u8868\u793A\u7248\u672C\u53F7\u7801\n  \'-t http\' \u5F00\u542Fhttp\u670D\u52A1\u5668, \u6B64\u65F6 \'-p 80\' \u8868\u793Ahttp\u670D\u52A1\u5668\u7AEF\u53E3  \n\n  \'-t https\' \u5F00\u542Fhttps\u670D\u52A1\u5668, \u6B64\u65F6 \'-p 443\' \u8868\u793Ahttps\u670D\u52A1\u5668\u7AEF\u53E3\n    \n  \'-t all\' \u540C\u65F6\u5F00\u542F https\u548Chttp\u670D\u52A1\u5668, \u6B64\u65F6i \'-p 80,443\' \u8868\u793A http,https\u7684\u7AEF\u53E3\n\n  \'-u\' \u8868\u793A\u56FE\u5F62\u64CD\u4F5C\u754C\u9762\u7AEF\u53E3\n\n  \'-c\' \u8868\u793A\u751F\u6210\u6839\u8BC1\u4E66\uFF0C\u6839\u8BC1\u4E66\u5728https\u7684\u60C5\u51B5\u4E0B\u6709\u7528\uFF0C\u4E0D\u751F\u6210\u65E0\u6CD5\u62E6\u622A\u8BF7\u6C42\n\n  \'-b\' \u8868\u793A\u7834\u89E3http true\u8868\u793A\u7834\u89E3\uFF0Cfalse\u8868\u793A\u4E0D\u7834\u89E3(\u6CE8\u610F\u4E0D\u7834\u89E3\u7684\u8BDD\u5C31\u4E0D\u8D70proxy\uFF0C\u4F1A\u76F4\u63A5\u7A7F\u8D8A\u5230\u5728\u7EBF\u6216\u8005\u672C\u673Ahost\u914D\u7F6E\u7684\u90A3\u4E2A\u5730\u5740)\uFF0C\u9ED8\u8BA4true, \u4E5F\u53EF\u4EE5\u914D\u7F6E host\uFF0C\u4E0D\u540C\u7684host\u7528,\u5206\u5272 \u5982\uFF1A baidu.com,uc.com,test.com, \u8868\u793A\u8FD9\u4E9Bhost\u9700\u8981\u7834\u89E3\n\t\'-e\' \u5728\u8BBE\u7F6E\u62E6\u622Ahttps\u7684\u60C5\u51B5\u4E0B\uFF0C\u662F\u5426\u9700\u8981\u6392\u9664\u67D0\u4E9Bhost, \u4E0D\u7834\u89E3\uFF0C\u591A\u4E2Ahost\u8BF7\u4EE5\uFF0C\u5206\u5272, \u53EF\u4EE5\u4F7F\u7528\u6B63\u5219, \'\' \u91CD\u7F6E\u6240\u6709\u5217\u8868\u4E3A\u9ED8\u8BA4\uFF0C -e\u4F18\u5148\u7EA7\u9AD8\u4E8E -b\n\t\'-s\' sni \u8BBE\u7F6E\uFF0C\u8BE5\u53C2\u6570\u5728\u5C06\u670D\u52A1\u5668\u5F53\u505A\u4EE3\u7406\u4F7F\u7528\u65F6\u6709\u6548\uFF0C  1\u8868\u793A\u91C7\u7528nodejs\u7684 snicallback\u65B9\u5F0F\uFF08\u67D0\u4E9B\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\uFF0C\u6BD4\u5982ie6\uFF0C\u4F4E\u7248\u672Candroi, \u9ED8\u8BA4\uFF092 \u8868\u793A\u91C7\u7528\u591A\u53F0\u670D\u52A1\u5668\u53BB\u4EE3\u7406\uFF08\u5168\u652F\u6301\uFF0C\u4F46\u662F\u6027\u80FD\u4F4E\uFF09\n\t\'--autoOpen\' \u8BBE\u7F6E\u662F\u5426\u5728\u542F\u52A8\u65F6\u81EA\u52A8\u6253\u5F00\u6D4F\u89C8\u5668\u754C\u9762\n\t\'--weinrePort\' \u8868\u793Aweinre\u542F\u52A8\u7684\u7AEF\u53E3\uFF0C\u9ED8\u8BA4 8002\n';
var opt = {};
_commander2.default.version(_package2.default.version).option('-v, --version', '版本号码').option('-t, --type [value]', 'http或者https服务器类型, 同时开启2种服务器用all表示', /^(http|https|all)$/i).option('-p, --port [list]', '代理端口 默认  http: 80, https: 443, 多个端口用，分割第一个表示http，第二个表示https', list).option('-u, --uiPort [port]', '界面端口 8001, 0表示没有后台管理界面', convertToInt).option('--autoOpen [ui]', '自动打开图形界面', /^(true|false)$/).option('--weinrePort [ui]', 'weinre端口', convertToInt).option('-c, --cert', '生成根证书').option('-b, --breakHttps [value]', '是否破解https,破解https前请先安装证书， 可以是host，多个host以 , 分割').option('-e, --excludeHttps [value]', "在设置拦截https的情况下，是否需要排除某些host，多个host请以，分割, 可以使用正则, '' 重置所有列表为默认， -e优先级高于 -b").option('-s, --sni [value]', 'sni 设置，该参数在将服务器当做代理使用时有效，  1表示采用nodejs的 snicallback方式（某些浏览器不支持，比如ie6，低版本androi, 默认）2 表示采用多台服务器去代理（全支持，但是性能低）', /^(1|2)$/i).on('--help', function () {
	return console.log(_colors2.default.green(out));
}).option('-l, --log [item]', '设置日志级别error, warn, info, verbose, debug, silly', /^(error|warn|info|verbose|debug|silly)$/i).parse(process.argv);
// 生成证书
if (_commander2.default.cert) {
	if (cert.isRootCertExits()) {
		promptCert(_colors2.default.green('已经存在根证书，是否覆盖?'), function () {
			cert.setRootCert();
		});
	} else {
		cert.setRootCert();
		process.exit(0);
	}
} else {
	_configProps2.default.forEach(function (current) {
		if (_commander2.default[current] === true && current !== 'breakHttps' && current !== 'autoOpen') {
			_commander2.default[current] = undefined;
		}
		// 已经输入变量转成小写 转换string成boolean
		if (typeof _commander2.default[current] === 'string') {
			_commander2.default[current] = _commander2.default[current].toLowerCase();
			if (_commander2.default[current] === 'true') {
				_commander2.default[current] = true;
			}
			if (_commander2.default[current] === 'false') {
				_commander2.default[current] = false;
			}
		}

		if (_commander2.default[current] !== undefined) {
			if (current === 'port') {
				if (_commander2.default[current] && _commander2.default[current].length) {
					opt.port = _commander2.default[current][0];
					if (_commander2.default[current][1]) {
						opt.httpsPort = _commander2.default[current][1];
					}
				}
			} else if (current === 'weinrePort') {
				opt.weinrePort = _commander2.default[current];
			} else if (current === 'uiPort') {
				opt.uiPort = _commander2.default[current];
			} else if (current === 'breakHttps') {
				if (typeof _commander2.default[current] === 'string') {
					opt[current] = _commander2.default[current].split(',');
				} else {
					opt[current] = !!_commander2.default[current];
				}
			} else if (current === 'excludeHttps') {
				if (typeof _commander2.default[current] === 'string') {
					if (_commander2.default[current] === '') {
						opt[current] = '';
					} else {
						opt[current] = _commander2.default[current].split(',');
					}
				}
			} else if (current === 'sni') {
				opt[current] = +_commander2.default[current];
			} else {
				opt[current] = _commander2.default[current];
			}
		}
	});
	// catproxy main file
	var catProxy = new _app2.default(opt);
	// 初始化代理服务器
	catProxy.init();

	// catProxy.onPipeRequest(function(result) {
	// 	return new Promise(function(resolve, reject) {
	// 		setTimeout(function() {
	// 			console.log(1, result.host);
	// 			resolve(result);
	// 		}, 300);
	// 	});
	// }, function(result) {
	// 	// window.test = 3;
	// 	console.log(result.protocol);
	// }, function(result) {
	// 	return new Promise(function(resolve, reject) {
	// 		setTimeout(function() {
	// 			console.log(2, result.host);
	// 			resolve(result);
	// 		}, 300);
	// 	});
	// });
}