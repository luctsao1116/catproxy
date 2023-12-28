'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.middleWare = exports.unuse = exports.use = undefined;

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _tools = require('./tools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestHandlers = [];
// 最终掉用
// 一个中间件类
var finalReq = function finalReq(finalCallback) {
	return function (err, req, res) {
		var com = this;
		if (err) {
			(0, _tools.sendErr)(res, err, req.url);
		} else {
			if (_util2.default.isFunction(finalCallback)) {
				finalCallback.call(com, req, res);
			}
		}
	};
};

// request请求调用
var requestFun = function requestFun(finalCallback) {
	return function (req, res) {
		var com = this;
		requestHandlers.reduceRight(function (next, current) {
			return function my(err) {
				// 参数为4个，如果当前有错就调用，没有错误，就跳过
				if (current.length === 4) {
					if (err) {
						try {
							current.call(com, err, req, res, next);
						} catch (e) {
							next(e);
						}
					} else {
						next(err);
					}
				} else {
					if (err) {
						next(err);
					} else {
						try {
							current.call(com, req, res, next);
						} catch (e) {
							next(e);
						}
					}
				}
			};
		}, function (err) {
			finalReq(finalCallback).call(com, err, req, res);
		})();
	};
};

// 添加一个中间件
var use = exports.use = function use(handle) {
	if (_util2.default.isFunction(handle)) {
		requestHandlers.push(handle);
	}
};

// 删除或者清空某个中间件
var unuse = exports.unuse = function unuse(handle) {
	if (_util2.default.isFunction(handle)) {
		var current = null;
		var is = requestHandlers.some(function (cur, index) {
			current = index;
			return cur === handle;
		});
		if (is) {
			requestHandlers.splice(current, 1);
		}
	} else if (handle === undefined) {
		requestHandlers = [];
	}
};
// 中间件入口
var middleWare = exports.middleWare = requestFun;