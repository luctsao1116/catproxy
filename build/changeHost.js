'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _dns = require('dns');

var _dns2 = _interopRequireDefault(_dns);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _getLocalIps = require('./getLocalIps');

var _dnscache = require('dnscache');

var _dnscache2 = _interopRequireDefault(_dnscache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 增加dns缓存
// 针对访问如果是 访问的本机，死循环，则切换host如果切换失败就返回失败
(0, _dnscache2.default)({ enable: true, ttl: 300, cachesize: 1000 });

exports.default = function (hostname, isServerPort) {
	if (_net2.default.isIP(hostname)) {
		return _promise2.default.resolve(hostname);
	}
	// 取当前启动的port
	return new _promise2.default(function (resolve, reject) {
		_dns2.default.lookup(hostname, function (err, address) {
			if (err || !address) {
				reject(err || '为找到合适的ip');
			} else {
				resolve(address);
			}
		});
	}).then(function (visitIp) {
		return new _promise2.default(function (resolve, reject) {
			// 是一个本地的ip
			if (_ip2.default.isPrivate(visitIp)) {
				// 如果解析的ip和当前服务器开的ip一样
				if (_getLocalIps.localIps.some(function (current) {
					return _ip2.default.isEqual(current, visitIp);
				}) && isServerPort) {
					_dns2.default.resolve(hostname, function (err, addresses) {
						if (err || !addresses || !addresses.length) {
							reject(err.code || ' 为找到合适的ip');
						} else {
							resolve(addresses[0]);
						}
					});
				} else {
					resolve(visitIp);
				}
			} else {
				resolve(visitIp);
			}
		});
	});
};