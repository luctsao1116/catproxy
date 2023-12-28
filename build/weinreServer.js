'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.insertWeinreScript = exports.weinreServer = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _weinre = require('weinre');

var _weinre2 = _interopRequireDefault(_weinre);

var _getLocalIps = require('./getLocalIps');

var _buffer = require('buffer');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('./config/config');

var config = _interopRequireWildcard(_config);

var _iconvLite = require('iconv-lite');

var _iconvLite2 = _interopRequireDefault(_iconvLite);

var _tools = require('./tools');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// weinre下这个方法有问题，重写成系统默认的
Error.prepareStackTrace = undefined;

var server;
var headReg = /<head>|<head\s[^<]*>/gi;
var createServer = function createServer(port) {
	port = +port;
	return new Promise(function (resolve, reject) {
		var weinreServer = _weinre2.default.run({
			httpPort: port,
			boundHost: '-all-',
			verbose: false,
			debug: false,
			readTimeout: 5,
			deathTimeout: 15
		});
		weinreServer.___port = port;
		server = weinreServer;
		weinreServer.on('listening', function () {
			resolve(weinreServer);
		});
	});
};
// 创建werinre 服务器
var weinreServer = exports.weinreServer = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						if (!server) {
							_context.next = 4;
							break;
						}

						return _context.abrupt('return', server);

					case 4:
						return _context.abrupt('return', createServer(config.get('weinrePort')));

					case 5:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function weinreServer() {
		return _ref.apply(this, arguments);
	};
}();

/**
 * 管道调用
 */
var getScriptStr = function getScriptStr(baseUrl) {
	return function (match) {
		var port = (server || {}).___port || '';
		var ip = _getLocalIps.localIps[0];
		return match + ('\n\t\t<script>window.WeinreServerURL="' + baseUrl + '/' + _tools.weinreId + '/"</script>\n\t\t<script src="' + baseUrl + '/' + _tools.weinreId + '/target/target-script-min.js#anonymous"></script>\n\t\t');
	};
};
/**
 * 插入weinre代码
 */
var insertWeinreScript = exports.insertWeinreScript = function () {
	var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
		var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
		var charset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'UTF-8';
		var baseUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

		var strData, _server;

		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						strData = _iconvLite2.default.decode(data, charset);

						if (!headReg.test(strData)) {
							_context2.next = 7;
							break;
						}

						if (server) {
							_context2.next = 6;
							break;
						}

						_context2.next = 5;
						return weinreServer();

					case 5:
						_server = _context2.sent;

					case 6:
						return _context2.abrupt('return', _iconvLite2.default.encode(strData.replace(headReg, getScriptStr(baseUrl)), charset));

					case 7:
						return _context2.abrupt('return', data);

					case 8:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this);
	}));

	return function insertWeinreScript() {
		return _ref2.apply(this, arguments);
	};
}();