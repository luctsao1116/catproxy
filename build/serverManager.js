'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _httpsProxySer = require('./httpsProxySer');

var _httpsProxySer2 = _interopRequireDefault(_httpsProxySer);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var servers = { length: 0 };
var serversPromise = {};

exports.default = function (serverName) {
	// 不传递servername则用sni
	if (!serverName) {
		serverName = 'localhost';
	}
	if (servers[serverName]) {
		return _promise2.default.resolve(servers[serverName]);
	} else {
		serversPromise[serverName] = serversPromise[serverName] || (0, _httpsProxySer2.default)(serverName).then(function (info) {
			servers[serverName] = info;
			servers['length'] += 1;
			_log2.default.debug('当前代理服务器数据：' + servers.length);
			delete serversPromise[serverName];
			return info;
		});
		return serversPromise[serverName];
	}
};