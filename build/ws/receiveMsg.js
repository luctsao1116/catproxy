'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.remoteUpdateRule = exports.saveConfig = exports.getConDetail = exports.fetchConfig = exports.success = exports.error = undefined;

var _status = require('./status');

var status = _interopRequireWildcard(_status);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _config = require('../config/config');

var config = _interopRequireWildcard(_config);

var _rule = require('../config/rule');

var rule = _interopRequireWildcard(_rule);

var _sendType = require('./sendType');

var sendType = _interopRequireWildcard(_sendType);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _buffer = require('buffer');

var _sendMsg = require('./sendMsg');

var _cacheFile = require('../monitor/cacheFile');

var _dataHelper = require('../dataHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/*
 *
 *  所有接受到得消息是一个Object
 *
 * data:{
 * 	path: "数据访问路径，相同type下的不同逻辑处理可以用不同的path",
 * 	param: "相同type下相同的path，不同的参数可以通过这个处理"
 * }
 *
 *
 * 所有发出的消息是一个Object
 *
 * data:{
 * 	//当前请求的状态，如果不是100表示出现错误了
 * 	status: 100,
 * 	result: {'当前返回的数据'}
 * }
 *
 */
var error = exports.error = function error(msg) {
	msg = msg || '出现系统异常，请稍后再试';
	var data = {
		status: status.ERROR,
		result: msg
	};
	_log2.default.error(msg);
	return data;
};

var success = exports.success = function success(msg) {
	msg = msg || '成功';
	var data = {
		status: status.SUCC,
		result: msg
	};
	return data;
};

/**
 * 请求数据，返回所有的数据
 * @return {[object]} [请求到得 config数据]
 */
var fetchConfig = exports.fetchConfig = function fetchConfig() {
	var data = {
		status: status.SUCC
	};
	try {
		data.result = config.get();
		if (data.result.cacheFlush === 'undefined') {
			data.result.cacheFlush = false;
		}
		if (data.result.disCache === 'undefined') {
			data.result.disCache = true;
		}
		if (!data.result.hosts) {
			data.result.hosts = [];
		}
		return data;
	} catch (e) {
		return error();
	}
};

var updateRule = function updateRule(rules, ws) {
	try {
		rule.saveRules(rules);
		return success('更新规则成功');
	} catch (e) {
		_log2.default.error(e);
		return error('更新规则失败');
	}
};
var disCache = function disCache(status, ws) {
	try {
		config.set('disCache', status);
		config.save('disCache');
		return success('更新配置成功');
	} catch (e) {
		_log2.default.error(e);
		return error('更新配置失败');
	}
};
var cacheFlush = function cacheFlush(status, ws) {
	try {
		config.set('cacheFlush', status);
		config.save('cacheFlush');
		return success('更新配置成功');
	} catch (e) {
		_log2.default.error(e);
		return error('更新配置失败');
	}
};
var monitor = function monitor(_monitor, ws) {
	try {
		config.setRecursive('monitor', _monitor);
		config.save('monitor');
		return success('更新配置成功');
	} catch (e) {
		_log2.default.error(e);
		return error('更新配置失败');
	}
};

var getConDetail = exports.getConDetail = function getConDetail() {
	var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { param: {} };
	var ws = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var _msg$param = msg.param,
	    id = _msg$param.id,
	    ext = _msg$param.ext,
	    contentType = _msg$param.contentType,
	    charset = _msg$param.charset,
	    formatCode = _msg$param.formatCode;

	if (id) {
		(0, _cacheFile.getCacheFile)(id).then(function (data) {
			// 不是2进制数据就解码数据
			return (0, _dataHelper.isBinary)(data) ? data : (0, _dataHelper.decodeData)(data, charset);
		}).then(function (data) {
			if (typeof data === 'string' && data) {
				ext = (0, _dataHelper.updateExt)(ext, contentType, data);
			}
			return data;
		}).then(function (data) {
			if (typeof data === 'string' && formatCode) {
				return (0, _dataHelper.betuifyCode)(data, ext);
			}
			data = data || '';
			return data;
		}).then(function (data) {
			data = data || '';
			(0, _sendMsg.sendConnDetail)({
				id: id,
				data: data,
				ext: ext
			});
		}, function (data) {
			data = data || '';
			(0, _sendMsg.sendConnDetail)({
				id: id,
				data: data,
				ext: ext
			});
		});
	}
};

var saveConfig = exports.saveConfig = function saveConfig() {
	var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var ws = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var path = msg.path,
	    param = msg.param;

	if (path) {
		switch (msg.path) {
			case 'rule':
				if (param && param.rules) {
					return updateRule(param.rules, ws);
				} else {
					return error('更新规则必须有rules属性');
				}
			case 'disCache':
				return disCache(!!param.status, ws);
			case 'cacheFlush':
				return cacheFlush(!!param.status, ws);
			case 'monitor':
				return monitor(param, ws);
			default:
				return error('未知的保存数据');
		}
	} else {
		return error('未知的保存数据');
	}
};

// 通过远程地址更新文档
var remoteUpdateRule = exports.remoteUpdateRule = function remoteUpdateRule() {
	var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var ws = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var visUrl = msg.param.url;

	return new _promise2.default(function (resolve, reject) {
		config.set('remoteRuleUrl', visUrl);
		visUrl = _url2.default.parse(visUrl);
		var req = (visUrl.protocol === 'http:' ? _http2.default : _https2.default).request({
			hostname: visUrl.hostname,
			port: visUrl.port ? visUrl.port : visUrl.protocol === 'http:' ? 80 : 443,
			path: visUrl.path,
			method: 'GET',
			headers: {}
		}, function (res) {
			if (+res.statusCode !== 200) {
				return reject(error('服务器获取数据错误'));
			}
			res.setEncoding('utf8');
			var data = [];

			res.on('data', function (chunk) {
				data.push(chunk);
			});
			res.on('end', function () {
				var isBuffer = _buffer.Buffer.isBuffer(data[0]);
				var result = isBuffer ? _buffer.Buffer.concat(data) : data.join('');
				try {
					result = JSON.parse(result);
					config.set('hosts', result);
					config.save(['hosts', 'remoteRuleUrl']);
					return resolve(success({
						data: result,
						msg: '更新数据成功'
					}));
				} catch (e) {
					_log2.default.error(e.message);
					return reject(error('数据格式错误'));
				}
			});
		});
		req.on('error', function (e) {
			_log2.default.error(e.message);
			reject(error(e.message));
		});
		req.end();
	});
};