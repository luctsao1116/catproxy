'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.default = function (cfg) {
	var data = {};
	if (cfg) {
		// 只能是指定的字段，字段不能是undefined
		_configProps2.default.forEach(function (cur) {
			var status = false;
			if (cfg[cur] !== undefined) {
				if (cur === 'hosts') {
					status = !!checkHosts(cfg[cur]);
				} else if (cur === 'port' || cur === 'httpsPort' || cur === 'uiPort' || cur === 'weinrePort') {
					cfg[cur] = +cfg[cur];
					status = !isNaN(cfg[cur]);
				} else if (cur === 'type' || cur === 'log' || cur === 'sni') {
					status = !!valCheck[cur][cfg[cur]];
				} else if (cur === 'disCache' || cur === 'autoOpen' || cur === 'cacheFlush') {
					status = typeof cfg[cur] === 'boolean';
				} else if (cur === 'breakHttps') {
					var list = cfg[cur];
					if (Array.isArray(list)) {
						var result = list.reduce(function (all, current) {
							if (typeof current === 'string' || Object.prototype.toString.call(current) === '[object RegExp]') {
								all.push(current.toString().replace(/^\/|\/$/g, ''));
								return all;
							}
						}, []);
						if (result && result.length) {
							cfg[cur] = result;
							status = true;
						}
					} else if (typeof list === 'boolean') {
						status = true;
					}
				} else if (cur === 'excludeHttps') {
					var _list = cfg[cur];
					if (Array.isArray(_list)) {
						var _result = _list.reduce(function (all, current) {
							if (typeof current === 'string' || Object.prototype.toString.call(current) === '[object RegExp]') {
								all.push(current.toString().replace(/^\/|\/$/g, ''));
								return all;
							}
						}, []);
						if (_result && _result.length) {
							cfg[cur] = _result;
							status = true;
						}
					} else if (_list === '') {
						status = true;
					}
				} else if (cur === 'remoteRuleUrl') {
					if (cfg[cur] && isUrl.test(cfg[cur])) {
						status = true;
					}
				} else if (cur === 'monitor') {
					// 检测监控数据
					status = checkMonitor(cfg[cur]);
				}
				if (status) {
					data[cur] = cfg[cur];
				} else {
					_log2.default.warn('\u8BBE\u7F6E\u6570\u636E\u88AB\u5FFD\u7565\uFF0C\u6570\u636E\u952E:' + cur + ',\u6570\u636E\u503C:' + cfg[cur]);
				}
			}
		});
	}
	return data;
};

var _configProps = require('./configProps');

var _configProps2 = _interopRequireDefault(_configProps);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isUrl = /^https?:\/\/.+/;
var ruleType = {
	host: 'host',
	localFile: 'localFile',
	localDir: 'localDir',
	remoteFile: 'remoteFile',
	redirect: 'redirect',
	weinre: 'weinre',
	regReplace: 'regReplace'
};
var checkRules = function checkRules(branch) {
	var rules = branch.rules;
	if (rules && rules.length >= 0 && (typeof rules === 'undefined' ? 'undefined' : (0, _typeof3.default)(rules)) === 'object') {
		// 空数组是合法的
		if (rules.length === 0) {
			return true;
		}
		var newRule = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var rule = _step.value;

				if (rule.type && ruleType[rule.type] && rule.test) {
					rule.type = rule.type.trim();
					rule.exec = rule.exec.trim();
					rule.test = rule.test.trim();
					newRule.push(rule);
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		branch.rules = newRule;
		return true;
	}
};

var checkBranch = function checkBranch(branchs) {
	if (branchs && branchs.length >= 0 && (typeof branchs === 'undefined' ? 'undefined' : (0, _typeof3.default)(branchs)) === 'object') {
		// 空数组是合法的
		if (branchs.length === 0) {
			return true;
		}
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = branchs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var branch = _step2.value;

				// 名字是必须得字段
				if (branch && branch.name !== undefined) {
					// 没定义这个字段
					if (branch.rules === undefined || branch.rules === null) {
						// 定义一个空得
						branch.rules = [];
					}
					if (!checkRules(branch)) {
						return false;
					}
				} else {
					return false;
				}
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		return true;
	}
};

/**
 * 检测传进来的规则是否是是符合规范的规则
 * @param  {[type]} rules 规则
 *[{
 *	name: "caipiao",
 *	isOpen: true,
 *	branch: [{
 *		name: "test1",
 *		rules: [{
 *			type: "host",
 *			test: "test",
 *			exec: "192.168.199.100"
 *		}]
 *	}],
 * }, {
 *	name: "guobao",
 *	disable: true,
 *	branch: [],
 *}]
 * @return {[type]}       如果是就返回true，其他都不是
 */
var checkHosts = function checkHosts(hosts) {
	if (hosts && hosts.length >= 0 && (typeof hosts === 'undefined' ? 'undefined' : (0, _typeof3.default)(hosts)) === 'object') {
		// 空数组是合法的
		if (hosts.length === 0) {
			return true;
		}
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = hosts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var host = _step3.value;

				if (host && host.name !== undefined) {
					// 没定义这个字段
					if (host.branch === undefined || host.branch === null) {
						// 定义一个空得
						host.branch = [];
					}
					if (!checkBranch(host.branch)) {
						return false;
					}
				} else {
					return false;
				}
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		return true;
	}
};

var valCheck = {
	sni: {
		1: true,
		2: true
	},
	type: {
		all: true,
		http: true,
		https: true
	},
	log: {
		error: true,
		warn: true,
		info: true,
		verbose: true,
		debug: true,
		silly: true
	}
};
var checkMonitor = function checkMonitor(monitor) {
	var keys = {
		monitorStatus: true,
		monitorFilterStatus: true,
		monitorFilterType: true,
		hiddenDataUrl: true
	};
	if ((typeof monitor === 'undefined' ? 'undefined' : (0, _typeof3.default)(monitor)) === 'object') {
		for (var m in monitor) {
			if (!keys[m]) {
				delete monitor[m];
			}
			if (m == 'monitorFilterType') {
				if (!_configProps.monitorType.some(function (c) {
					return c === monitor[m];
				})) {
					delete monitor[m];
				}
			}
		}
		return true;
	}
	return false;
};

// 检测配置字段是否合法