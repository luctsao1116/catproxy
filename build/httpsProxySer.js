'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SNICallback = undefined;

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _cert = require('./cert/cert.js');

var _tools = require('./tools');

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _tls = require('tls');

var _tls2 = _interopRequireDefault(_tls);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _constants = require('constants');

var _constants2 = _interopRequireDefault(_constants);

var _requestSerives = require('./requestSerives');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SNICallback = function SNICallback(servername, callback) {
	try {
		var _getCert = (0, _cert.getCert)(servername),
		    key = _getCert.privateKey,
		    cert = _getCert.cert;

		var ctx = _tls2.default.createSecureContext({ key: key, cert: cert });
		callback(null, ctx);
	} catch (e) {
		_log2.default.error(e);
		callback(e);
	}
}; // 创建一个https的代理服务器
exports.SNICallback = SNICallback;

exports.default = function (host, port) {
	if (!host) {
		throw new Error('host is must');
	}
	return _promise2.default.resolve(port).then(function (p) {
		if (p) {
			return p;
		} else {
			return (0, _tools.getPort)();
		}
	})
	// 不支持sni的请求可能点了就没反应,SNICallback在客户端不支持的情况下，不会报错，会直接返回
	.then(function (port) {
		var _getCert2 = (0, _cert.getCert)(host),
		    key = _getCert2.privateKey,
		    cert = _getCert2.cert;

		var server = _https2.default.createServer({
			secureOptions: _constants2.default.SSL_OP_NO_SSLv3 || _constants2.default.SSL_OP_NO_TLSv1,
			key: key,
			cert: cert,
			SNICallback: SNICallback,
			rejectUnauthorized: false
		}, function (req, res) {
			if (req.headers.upgrade) {
				return;
			}
			_requestSerives.requestHandler.call(this, req, res);
		});

		server.on('upgrade', _requestSerives.requestUpgradeHandler);

		server.on('clientError', function (err, con) {
			_log2.default.error('clientError', err);
		});

		server.listen(port);
		server.on('error', function (err) {
			return _log2.default.error(err + 'inner https prxoy server err:' + err);
		});
		return { server: server, port: port };
	}).then(null, function (err) {
		return _log2.default.error('create https proxy server error:' + err);
	});
};