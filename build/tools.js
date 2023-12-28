'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.weinreId = exports.getMonitorId = exports.getPort = exports.sendErr = exports.openCmd = exports.error = exports.writeErr = exports.getUrl = exports.hostReg = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hostReg = exports.hostReg = /:(\/\/([^\/]+))/;
var getUrl = exports.getUrl = function getUrl(_ref) {
	var port = _ref.port,
	    pathname = _ref.path,
	    protocol = _ref.protocol,
	    hostname = _ref.hostname,
	    host = _ref.host;

	if (protocol && (hostname || host)) {
		hostname = hostname || host;
		hostname = hostname.split(':')[0];
		protocol === 'https' ? 'http' : 'https';
		if (+port === 80 && protocol === 'http') {
			port = '';
		}
		if (+port === 443 && protocol === 'https') {
			port = '';
		}
		if (port) {
			port = ':' + port;
		}
		pathname = pathname || '';
		return protocol + '://' + hostname + port + pathname;
	}
};

var writeErr = exports.writeErr = function writeErr(err) {
	err = err || '系统内部错误';
	if (err.stack && err.message) {
		err = err.message + '<br>' + err.stack;
	}
	return err;
};

var portReg = /EADDRINUSE\s*[^0-9]*([0-9]+)/i;

var error = exports.error = function error(err) {
	if (err.code === 'EACCES' || err.message && err.message.indexOf('EACCES') > -1) {
		_log2.default.error('请用sudo管理员权限打开');
		process.exit(1);
	} else if (err.code === 'EADDRINUSE' || err.message.indexOf('EADDRINUSE') > -1) {
		var port = err.port || (err.message.match(portReg) || ['', ''])[1];
		_log2.default.error('\u7AEF\u53E3' + port + '\u88AB\u5360\u7528\uFF0C\u8BF7\u68C0\u67E5\u7AEF\u53E3\u5360\u7528\u60C5\u51B5');
		process.exit(1);
	} else {
		process.exit(1);
		_log2.default.error('出现错误：' + (err && err.stack ? err.stack : err));
	}
};

var openCmd = exports.openCmd = function openCmd(uri) {
	var cmd;
	if (process.platform === 'win32') {
		cmd = 'start';
	} else if (process.platform === 'linux') {
		cmd = 'xdg-open';
	} else if (process.platform === 'darwin') {
		cmd = 'open';
	}
	_child_process2.default.exec([cmd, uri].join(' '));
};

var sendErr = exports.sendErr = function sendErr(res, err, uri) {
	if (!res) {
		return;
	}
	err = err || '';

	if (res.finished) {
		return;
	}
	var message = '';
	var t = typeof err === 'undefined' ? 'undefined' : (0, _typeof3.default)(err);
	if (t === 'string') {
		message = err;
	} else if (t === 'object') {
		message = (err.message || '') + (err.msg || '') + (err.stack || '');
	}
	res.headers = res.headers || {};
	if (!res.headers['content-type'] || !res.headers['Content-Type']) {
		res.headers['Content-Type'] = 'text/html; charset=utf-8';
	}
	if (res.headers['content-length']) {
		delete res.headers['content-length'];
	}
	if (res.headers['content-encoding']) {
		delete res.headers['content-encoding'];
	}
	var statusCode = '500';
	if (message.indexOf('ETIMEDOUT') > -1) {
		statusCode = '408';
	} else if (message.indexOf('ENOTFOUND') > -1) {
		statusCode = '504';
	}
	if (statusCode === '500') {
		_log2.default.error('url:' + (uri || ''));
		_log2.default.error('' + message);
	}
	res.writeHead(statusCode, res.headers);
	res.end(message);
};

var getPort = exports.getPort = function getPort() {
	return new _promise2.default(function (resolve, reject) {
		var server = _net2.default.createServer();
		server.unref();
		server.on('error', reject);
		server.listen(0, function () {
			var port = server.address().port;
			server.close(function () {
				resolve(port);
			});
		});
	});
};

var getGuids = function getGuids(start) {
	start = +start || 1;
	return function () {
		return start++;
	};
};
// 监控要用的id
var getMonitorId = exports.getMonitorId = getGuids(+new Date());

// weinre要用得id
var weinreId = exports.weinreId = _nodeUuid2.default.v4();