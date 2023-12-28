'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.localIps = undefined;
exports.default = getIps;

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getIps() {
	var interfaces = _os2.default.networkInterfaces();
	var all = Object.keys(interfaces).map(function (nic) {
		var addresses = interfaces[nic].filter(function (details) {
			details.family = details.family.toLowerCase();
			if (details.family !== 'ipv4' || _ip2.default.isLoopback(details.address)) {
				return false;
			}
			return true;
		});
		return addresses.length ? addresses[0].address : undefined;
	}).filter(Boolean);
	return !all.length ? [] : all;
}

var localIps = exports.localIps = getIps();
localIps.push(_ip2.default.loopback('ipv4'));