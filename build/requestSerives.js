'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.requestUpgradeHandler = exports.requestConnectHandler = exports.requestHandler = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _buffer = require('buffer');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _serverManager = require('./serverManager');

var _serverManager2 = _interopRequireDefault(_serverManager);

var _defCfg = require('./config/defCfg');

var _config = require('./config/config');

var config = _interopRequireWildcard(_config);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _changeHost = require('./changeHost');

var _changeHost2 = _interopRequireDefault(_changeHost);

var _cert = require('./cert/cert.js');

var _responseService = require('./responseService');

var _responseService2 = _interopRequireDefault(_responseService);

var _evt = require('./evt');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var headerWsTest = /upgrade\s*:\s*websocket\s*\n/i;

var rep = /^\/|\/$/g;
// 升级到 ws wss
var upgradeToWebSocket = function upgradeToWebSocket(req, cltSocket, head) {
	var com = this;
	// 不是upgrade websocket请求 直接放弃
	if (req.headers.upgrade.toLowerCase() !== 'websocket') {
		cltSocket.destroy();
		return;
	}
	// 禁止超时
	cltSocket.setTimeout(0);
	// 禁止纳格（Nagle）算法。默认情况下TCP连接使用纳格算法，这些连接在发送数据之前对数据进行缓冲处理。 将noDelay设成true会在每次socket.write()被调用时立刻发送数据。noDelay默认为true。
	cltSocket.setNoDelay(true);
	// 启用长连接
	cltSocket.setKeepAlive(true, 0);
	var isSecure = req.connection.encrypted || req.connection.pai;
	var url = req.url;
	var hostname = req.headers.host.split(':');
	var port = hostname[1] ? hostname[1] : isSecure ? 443 : 80;
	hostname = hostname[0];
	var options = {
		port: port,
		path: url,
		method: req.method,
		headers: req.headers
	};
	if (isSecure) {
		var _getCert = (0, _cert.getCert)(hostname),
		    key = _getCert.privateKey,
		    cert = _getCert.cert;

		options.key = key;
		options.cert = cert;
		options.rejectUnauthorized = false;
	}

	var _config$get = config.get(),
	    p = _config$get.port,
	    hp = _config$get.httpsPort;

	var isServerPort = +port === +p;
	if (isSecure) {
		isServerPort = +hp === +port;
	}
	(0, _changeHost2.default)(hostname, isServerPort).then(function (ip) {
		options.hostname = ip;
		var proxyReq = (isSecure ? _https2.default : _http2.default).request(options, function (proxyRes) {
			if (!proxyRes.upgrade) {
				proxyRes.end && proxyRes.end();
			}
		});
		proxyReq.on('upgrade', function (proxyRes, proxySocket, proxyHead) {
			var result = {};
			Object.defineProperties(result, {
				host: {
					value: req.headers.host,
					enumerable: true
				},
				port: {
					value: port,
					enumerable: true
				},
				headers: req.headers,
				protocol: {
					value: isSecure ? 'wss' : 'ws',
					enumerable: true
				}
			});
			_evt.pipeRequest.call(com, result);
			proxySocket.on('error', function (err) {
				return _log2.default.error(err);
			});
			proxySocket.on('end', function () {
				cltSocket.end();
			});
			proxySocket.setTimeout(0);
			proxySocket.setNoDelay(true);
			proxySocket.setKeepAlive(true, 0);
			cltSocket.on('error', function (err) {
				proxySocket.end();
				_log2.default.error(err);
			});
			if (proxyHead && proxyHead.length) {
				proxySocket.unshift(proxyHead);
			}
			var headers = Object.keys(proxyRes.headers).reduce(function (head, key) {
				var value = proxyRes.headers[key];
				if (!Array.isArray(value)) {
					head.push(key + ': ' + value);
					return head;
				}
				for (var i = 0; i < value.length; i++) {
					head.push(key + ': ' + value[i]);
				}
				return head;
			}, ['HTTP/1.1 101 Switching Protocols']).join('\r\n') + '\r\n\r\n';
			// 写入头文件
			cltSocket.write(headers);
			proxySocket.pipe(cltSocket).pipe(proxySocket);
		});
		proxyReq.on('error', function (err) {
			_log2.default.error(err);
			cltSocket.end();
		});
		req.pipe(proxyReq);
	}, function (error) {
		_log2.default.error(error);
		cltSocket.end();
	});
};

// 请求到后的解析
var requestHandler = exports.requestHandler = function requestHandler(req, res) {
	var com = this;
	var isSecure = req.connection.encrypted || req.connection.pai,
	    headers = req.headers,
	    method = req.method,
	    host = headers.host,
	    protocol = !!isSecure ? 'https' : 'http',
	    fullUrl = /^http.*/.test(req.url) ? req.url : protocol + '://' + host + req.url,
	    urlObject = _url2.default.parse(fullUrl),
	    port = urlObject.port || (protocol === 'http' ? '80' : '443'),
	    pathStr = urlObject.path,
	    pathname = urlObject.pathname,
	    visitUrl = protocol + '://' + host + pathname;
	_log2.default.verbose('request url: ' + fullUrl);
	// 请求信息
	var reqInfo = {
		headers: headers,
		host: host,
		method: method,
		protocol: protocol,
		port: port,
		path: pathStr
	};
	Object.defineProperties(reqInfo, {
		req: {
			writable: false,
			value: req,
			enumerable: true
		},
		originalFullUrl: {
			writable: false,
			value: fullUrl,
			enumerable: true
		},
		originalUrl: {
			writable: false,
			value: visitUrl,
			enumerable: true
		},
		startTime: {
			writable: false,
			value: new Date().getTime(),
			enumerable: true
		}
	});
	// 响应信息
	var resInfo = { headers: {} };
	Object.defineProperties(resInfo, {
		res: {
			writable: false,
			value: res,
			enumerable: true
		},
		originalFullUrl: {
			writable: false,
			value: fullUrl,
			enumerable: true
		},
		originalUrl: {
			writable: false,
			value: visitUrl,
			enumerable: true
		}
	});
	// 调用相应模块
	_responseService2.default.call(com, reqInfo, resInfo);
	var reqBodyData = [];
	var l = 0;
	var end = function end() {
		req.emit('reqBodyDataReady', null, _buffer.Buffer.concat(reqBodyData));
	};
	var data = function data(buffer) {
		l = l + buffer.length;
		reqBodyData.push(buffer);
		// 超过长度了
		if (l > _defCfg.LIMIT_SIZE) {
			req.pause();
			req.removeListener('data', data);
			req.removeListener('end', end);
			req.emit('reqBodyDataReady', {
				message: '请求数据头过大，无法显示',
				status: _defCfg.STATUS.LIMIT_ERROR
			}, _buffer.Buffer.concat(reqBodyData));
		}
	};
	req.on('data', data).on('end', end).on('error', function (err) {
		_log2.default.error('error req', err);
	});
};

/**
 * connect转发请求处理
 * @param req
 * @param cltSocket
 * @param head
 */
var requestConnectHandler = exports.requestConnectHandler = function requestConnectHandler(req, cltSocket, head) {
	var com = this;
	return new _promise2.default(function (resolve, reject) {
		if (!head || head.length === 0) {
			cltSocket.once('data', function (chunk) {
				resolve(chunk);
			});
		} else {
			resolve(head);
		}
		cltSocket.write('HTTP/' + req.httpVersion + ' 200 Connection Established\r\n' + 'Proxy-agent: Node-CatProxy\r\n');
		// if (req.headers['proxy-connection'] === 'keep-alive') {
		// 	cltSocket.write('Proxy-Connection: keep-alive\r\n');
		// 	cltSocket.write('Connection: keep-alive\r\n');
		// }
		cltSocket.write('\r\n');
	}).then(function (first) {
		cltSocket.pause();
		// log.debug("first data", first[0]);
		var opt = config.get();
		var reqUrl = 'http://' + req.url;
		var srvUrl = _url2.default.parse(reqUrl);
		var crackHttps = void 0;
		if (typeof opt.breakHttps === 'boolean') {
			crackHttps = opt.breakHttps;
		} else if ((0, _typeof3.default)(opt.breakHttps) === 'object' && opt.breakHttps.length) {
			crackHttps = opt.breakHttps.some(function (current) {
				return new RegExp(current.replace(rep, '')).test(srvUrl.hostname);
			});
		}
		// 如果当前状态是 破解状态  并且有排除列表
		if (crackHttps && (0, _typeof3.default)(opt.excludeHttps) === 'object' && opt.excludeHttps) {
			crackHttps = !opt.excludeHttps.some(function (current) {
				return new RegExp(current.replace(rep, '')).test(srvUrl.hostname);
			});
		}
		// * - an incoming connection using SSLv3/TLSv1 records should start with 0x16
		// * - an incoming connection using SSLv2 records should start with the record size
		// *   and as the first record should not be very big we can expect 0x80 or 0x00 (the MSB is a flag)
		// 如果需要捕获https的请求
		// 访问地址直接是ip，跳过不代理
		if (crackHttps && (first[0] == 0x16 || first[0] == 0x80 || first[0] == 0x00)) {
			_log2.default.verbose('crack https ' + reqUrl);
			(0, _serverManager2.default)(opt.sni === 1 ? '' : srvUrl.hostname).then(function (_ref) {
				var port = _ref.port,
				    server = _ref.server;

				// 与服务器绑定
				server.catProxy = com.catProxy;
				var srvSocket = _net2.default.connect(port, 'localhost', function () {
					srvSocket.pipe(cltSocket).pipe(srvSocket);
					cltSocket.emit('data', first);
					cltSocket.resume();
				});
				srvSocket.on('error', function (err) {
					cltSocket.end();
					_log2.default.error('crack https-srv:' + reqUrl + '\u8BF7\u6C42\u51FA\u73B0\u9519\u8BEF: ' + err + err.stack);
				});
				cltSocket.on('error', function (err) {
					_log2.default.error('crack https-clt:' + reqUrl + '\u8BF7\u6C42\u51FA\u73B0\u9519\u8BEF: ' + err + err.stack);
					srvSocket.end();
				});
			});
		} else {
			// 不认识的协议或者 不破解的https直接连接对应的服务器
			_log2.default.verbose('pipe request ' + reqUrl);
			var result = {};
			Object.defineProperties(result, {
				host: {
					value: srvUrl.host,
					enumerable: true
				},
				headers: req.headers,
				port: {
					value: srvUrl.port,
					enumerable: true
				},
				protocol: {
					value: headerWsTest.test(first.toString()) ? 'ws' : 'http',
					enumerable: true
				}
			});
			_evt.pipeRequest.call(com, result);
			var srvSocket = _net2.default.connect(srvUrl.port, srvUrl.hostname, function () {
				srvSocket.pipe(cltSocket).pipe(srvSocket);
				cltSocket.emit('data', first);
				cltSocket.resume();
			});
			cltSocket.on('error', function (err) {
				_log2.default.error('\u8F6C\u53D1\u8BF7\u6C42\u51FA\u73B0\u9519\u8BEF: ' + err);
				srvSocket.end();
			});
			srvSocket.on('error', function (err) {
				cltSocket.end();
				_log2.default.error('\u8F6C\u53D1\u8BF7\u6C42\u51FA\u73B0\u9519\u8BEF: ' + err);
			});
		}
	}).then(null, function (err) {
		return _log2.default.error(err);
	});
};
/**
 * upgrade ws转发请求处理
 * @param req
 * @param socket
 */
var requestUpgradeHandler = exports.requestUpgradeHandler = function requestUpgradeHandler(req, cltSocket, head) {
	// 不是get 取不到 upgrade就放弃
	if (req.method === 'GET' && req.headers.upgrade) {
		upgradeToWebSocket.call(this, req, cltSocket, head);
	} else {
		cltSocket.destroy();
	}
};

exports.default = {
	requestHandler: requestHandler,
	requestConnectHandler: requestConnectHandler,
	requestUpgradeHandler: requestUpgradeHandler
};