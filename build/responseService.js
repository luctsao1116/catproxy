'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (reqInfo, resInfo) {
	// /******不要尝试取修改 resInfo的引用，会导致 isBinary取不到***************/
	var self = this;
	var res = resInfo.res;
	var req = reqInfo.req;
	var id = (0, _tools.getMonitorId)();
	Object.defineProperty(reqInfo, 'id', {
		value: id,
		enumerable: true
	});
	Object.defineProperty(resInfo, 'id', {
		value: id,
		enumerable: true
	});
	// 当bodyData缓存处理完毕就触发事件告诉用户数据
	res.on('resBodyDataReady', function (err, bodyData) {
		var headers = res.headers || {};
		var result = {};
		if (reqInfo.sendToFile) {
			Object.defineProperty(result, 'sendToFile', {
				writable: false,
				value: reqInfo.sendToFile,
				enumerable: true
			});
		}
		// 响应回来后所有的字段都是只读的
		Object.defineProperties(result, {
			headers: {
				writable: false,
				value: headers,
				enumerable: true
			},
			statusCode: {
				writable: false,
				value: res.statusCode,
				enumerable: true
			},
			host: {
				writable: false,
				value: reqInfo.host,
				enumerable: true
			},
			method: {
				writable: false,
				value: reqInfo.method,
				enumerable: true
			},
			protocol: {
				writable: false,
				value: reqInfo.protocol,
				enumerable: true
			},
			originalFullUrl: {
				writable: false,
				value: reqInfo.originalFullUrl,
				enumerable: true
			},
			port: {
				writable: false,
				value: reqInfo.port,
				enumerable: true
			},
			path: {
				writable: false,
				value: reqInfo.path,
				enumerable: true
			},
			originalUrl: {
				writable: false,
				value: reqInfo.originalUrl,
				enumerable: true
			},
			endTime: {
				writable: false,
				value: new Date().getTime(),
				enumerable: true
			},
			bodyData: {
				writable: false,
				value: bodyData,
				enumerable: true
			},
			bodyDataErr: {
				writable: false,
				value: err && err.message ? err.message : err,
				enumerable: true
			},
			id: {
				writable: false,
				value: id,
				enumerable: true
			},
			isBinary: {
				writable: false,
				value: resInfo.isBinary,
				enumerable: true
			}
		});
		if (resInfo.charset) {
			Object.defineProperty(result, 'charset', {
				writable: false,
				value: resInfo.charset
			});
		}
		return _evt.afterRes.call(self, result);
	});
	req.on('reqBodyDataReady', function (err, reqBodyData) {
		reqInfo.bodyData = reqBodyData || [];
		reqInfo.bodyDataErr = err;
		// 请求前拦截一次--所有的拦截都在evt.js中处理
		_promise2.default.resolve(_evt.beforeReq.call(self, reqInfo)).then(function (result) {
			// 引用发生变化
			if (result !== reqInfo) {
				reqInfo = (0, _merge2.default)(result, reqInfo);
			}
			Object.defineProperties(resInfo, {
				host: {
					writable: false,
					value: reqInfo.host,
					enumerable: true
				},
				method: {
					writable: false,
					value: reqInfo.method,
					enumerable: true
				},
				protocol: {
					writable: false,
					value: reqInfo.protocol,
					enumerable: true
				},
				port: {
					writable: false,
					value: reqInfo.port,
					enumerable: true
				},
				path: {
					writable: false,
					value: reqInfo.path,
					enumerable: true
				}
			});
			// 将是否设置weinre传递到 resInfo
			if (typeof reqInfo.weinre === 'boolean') {
				resInfo.weinre = reqInfo.weinre;
				delete reqInfo.weinre;
			}
			return { reqInfo: reqInfo, resInfo: resInfo };
		}).then(function (_ref3) {
			var reqInfo = _ref3.reqInfo,
			    resInfo = _ref3.resInfo;

			// 如果在事件里面已经结束了请求，那就结束了
			if (res.finished) {
				// 用户做了转发处理，这个时候不知道内容是什么
				res.emit('resBodyDataReady', null, null);
			} else if (reqInfo.redirect) {
				resInfo.headers = {
					Location: reqInfo.redirect
				};
				resInfo.statusCode = 302;
				resInfo.bodyData = '';
				triggerBeforeRes.call(self, resInfo).then(function () {
					res.writeHead(resInfo.statusCode, resInfo.headers);
					res.end();
					res.emit('resBodyDataReady', null, null);
				}, function () {
					var err = '调用内部出现错误';
					(0, _tools.sendErr)(res, err, req.url);
					res.emit('resBodyDataReady', err, null);
				});
			} else {
				if (reqInfo.sendToFile) {
					return local.call(self, reqInfo, resInfo, reqInfo.sendToFile);
				} else {
					return remote.call(self, reqInfo, resInfo);
				}
			}
		}).then(null, function (err) {
			// 日志在 sendErr中打印和处理
			(0, _tools.sendErr)(res, err, req.url);
			res.emit('resBodyDataReady', err, null);
		});
	});
};

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _buffer = require('buffer');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _defCfg = require('./config/defCfg');

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _changeHost = require('./changeHost');

var _changeHost2 = _interopRequireDefault(_changeHost);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _getLocalIps = require('./getLocalIps');

var _tools = require('./tools');

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _cert = require('./cert/cert.js');

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _config = require('./config/config');

var config = _interopRequireWildcard(_config);

var _evt = require('./evt');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isStartHttps = /https/; // 处理请求来后返回的数据

// 发送代理请求钱触发
var triggerBeforeRes = function triggerBeforeRes(resInfo) {
	return _evt.beforeRes.call(this, resInfo).then(function (result) {
		return (0, _merge2.default)(resInfo, result);
	});
};

// 处理本地数据
var local = function local(reqInfo, resInfo, fileAbsPath) {
	var com = this;
	resInfo.headers = resInfo.headers || {};
	return new _promise2.default(function (resolve) {
		_fs2.default.readFile(fileAbsPath, function (err, buffer) {
			if (err) {
				resInfo.bodyData = new _buffer.Buffer('local file error' + err);
				// 如果用户没有设置statusCode就设置默认的
				resInfo.statusCode = 404;
				resolve(resInfo);
			} else {
				// 如果用户没有设置statusCode就设置默认的
				resInfo.statusCode = 200;
				resInfo.bodyData = buffer;
				resolve(resInfo);
			}
		});
	}).then(function (resInfo) {
		return triggerBeforeRes.call(com, resInfo);
	}).then(function (resInfo) {
		var bodyData = resInfo.bodyData,
		    _resInfo$headers = resInfo.headers,
		    headers = _resInfo$headers === undefined ? {} : _resInfo$headers,
		    statusCode = resInfo.statusCode,
		    res = resInfo.res;

		headers['loacl-file'] = _querystring2.default.escape(fileAbsPath);
		delete headers['content-length'];
		delete headers['content-encoding'];
		if (!headers['content-type']) {
			var extName = _path2.default.extname(fileAbsPath) || '';
			var mimeType = extName ? _mime2.default.lookup(extName.slice(1)) : 'text/html';
			headers['content-type'] = mimeType;
		}
		res.writeHead(statusCode, headers || {});
		if (!res.headers) {
			res.headers = headers || {};
		}
		res.end(bodyData);
		res.emit('resBodyDataReady', null, bodyData);
	}, function (err) {
		var _resInfo$headers2 = resInfo.headers,
		    headers = _resInfo$headers2 === undefined ? {} : _resInfo$headers2,
		    res = resInfo.res;
		// 由错误方法删除的header

		return _promise2.default.reject(err);
	});
};
// 处理将 域名转换成ip
var detailHost = function detailHost(result, reqInfo, resInfo) {
	// 取当前启动的port
	var com = this;

	var _config$get = config.get(),
	    port = _config$get.port,
	    httpsPort = _config$get.httpsPort;

	var isServerPort = +port === +result.port;
	if (isStartHttps.test(reqInfo.protocol)) {
		isServerPort = +httpsPort === +result.port;
	}
	// 这里自己将死循环嗯哼获取ip错误的情况已经处理了
	return (0, _changeHost2.default)(result.hostname, isServerPort).then(function (address) {
		// 如果还是死循环，则跳出
		if (isServerPort && _getLocalIps.localIps.some(function (current) {
			return _ip2.default.isEqual(current, address);
		})) {
			if (reqInfo.headers && reqInfo.headers['self-server']) {
				return _promise2.default.reject('Dead circulation');
			} else {
				reqInfo.headers = reqInfo.headers || {};
				reqInfo.headers['self-server'] = 1;
			}
		}
		return (0, _merge2.default)(result, {
			hostname: address
		});
	}, function (err) {
		var res = resInfo.res;

		return triggerBeforeRes.call(com, (0, _merge2.default)(resInfo, { statusCode: 504 }, { bodyDataErr: err, headers: {} })).then(function () {
			return _promise2.default.reject(err);
		});
	});
};

// 真正代理请求
var proxyReq = function proxyReq(options, reqInfo, resInfo, req) {
	var com = this;
	return new _promise2.default(function (resolve, reject) {
		// 在这里hostname已经全部被转换成 ip了，将ip传递到前端
		resInfo.serverIp = options.hostname;
		// 发出请求
		_log2.default.verbose('send proxy request originalFullUrl: ' + reqInfo.originalFullUrl);
		var proxyReq = (isStartHttps.test(reqInfo.protocol) ? _https2.default : _http2.default).request(options, function (proxyRes) {
			var remoteUrl = (0, _tools.getUrl)((0, _merge2.default)({}, options, { protocol: reqInfo.protocol }));
			_log2.default.verbose('received request from : ' + remoteUrl + ', statusCode ' + proxyRes.statusCode);
			resInfo = (0, _merge2.default)(resInfo, {
				headers: proxyRes.headers || {},
				statusCode: proxyRes.statusCode
			});
			resolve({ proxyRes: proxyRes, remoteUrl: remoteUrl, reqInfo: reqInfo, resInfo: resInfo });
		});
		// 向 直接请求写入数据
		if (reqInfo.bodyData && reqInfo.bodyData.length) {
			if (!reqInfo.bodyDataErr) {
				proxyReq.write(reqInfo.bodyData);
				proxyReq.end();
			} else {
				proxyReq.write(reqInfo.bodyData);
				req.on('data', function (buffer) {
					proxyReq.write(buffer);
				}).on('end', function () {
					proxyReq.end();
				});
				req.resume();
			}
		} else {
			// 没有数据就直接end否则读取数据
			proxyReq.end();
		}
		// 出错直接结束请求
		proxyReq.on('error', function (err) {
			reject(err);
		});
	}).then(function (_ref) {
		var proxyRes = _ref.proxyRes,
		    remoteUrl = _ref.remoteUrl,
		    reqInfo = _ref.reqInfo,
		    resInfo = _ref.resInfo;
		var res = resInfo.res;
		// 数据太大的时候触发

		var err = {
			message: '响应数据过大，无法显示',
			status: _defCfg.STATUS.LIMIT_ERROR
		};
		var resBodyData = [],
		    l = 0,
		    isError = false,
		    isFired = false;
		proxyRes
		// 过滤大文件，只有小文件才返回
		// 文件过大的将无法拦截，没有事件通知
		.on('data', function (chunk) {
			if (l > _defCfg.LIMIT_SIZE) {
				isError = true;
				if (!isFired) {
					isFired = true;
					var statusCode = resInfo.statusCode,
					    headers = resInfo.headers;

					headers['remote-url'] = _querystring2.default.escape(remoteUrl);
					res.writeHead(statusCode || 200, headers);
					res.write(_buffer.Buffer.concat(resBodyData));
					res.write(chunk);
					resBodyData = [];
					var bodyData = null;
					var bodyDataErr = err.message;
					// 提前触发事件
					return triggerBeforeRes.call(com, (0, _merge2.default)(resInfo, { bodyData: bodyData, bodyDataErr: bodyDataErr }));
				} else {
					res.write(chunk);
				}
			} else {
				resBodyData.push(chunk);
				l += chunk.length;
			}
		}).on('end', function () {
			var bodyData = _buffer.Buffer.concat(resBodyData);
			return _promise2.default.resolve(bodyData).then(function (bodyData) {
				// 文件大小没有出错的情况下
				if (!isError) {
					return triggerBeforeRes.call(com, (0, _merge2.default)(resInfo, { bodyData: bodyData })).then(function (resInfo) {
						var statusCode = resInfo.statusCode,
						    headers = resInfo.headers,
						    bodyData = resInfo.bodyData;

						headers['remote-url'] = _querystring2.default.escape(remoteUrl);
						res.writeHead(statusCode || 200, headers);
						res.write(bodyData);
						return resInfo;
					}, function (err) {
						var headers = resInfo.headers;
						headers['remote-url'] = _querystring2.default.escape(remoteUrl);
						res.writeHead(500, headers);
						err = (0, _tools.writeErr)(err);
						res.write(err);
						_log2.default.error(err);
						resInfo.statusCode = 500;
						resInfo.bodyData = err;
						return resInfo;
					});
				} else {
					resInfo.bodyData = new _buffer.Buffer('');
					resInfo.bodyDataErr = err.message;
					return resInfo;
				}
			}).then(function (_ref2) {
				var headers = _ref2.headers,
				    bodyData = _ref2.bodyData;

				// 转换head大小写问题
				if (!res.headers) {
					res.headers = headers;
				}
				res.end();
				res.emit('resBodyDataReady', isError ? err : null, bodyData || new _buffer.Buffer(''));
			}, function (err) {
				_log2.default.error(err);
			});
		});
	}).then(null, function (err) {
		var statusCode = '500';
		if (err && err.message.indexOf('ENOTFOUND') > -1) {
			statusCode = '504';
		}
		// 出错也要处理下
		return triggerBeforeRes.call(com, (0, _merge2.default)({ statusCode: statusCode }, resInfo, { bodyDataErr: err, headers: {} })).then(function () {
			return _promise2.default.reject(err);
		});
	});
};

var remote = function remote(reqInfo, resInfo) {
	var req = reqInfo.req;
	var res = resInfo.res;

	var com = this;
	var isSecure = req.connection.encrypted || req.connection.pai;
	var oldProtocol = !!isSecure ? 'https' : 'http';
	return _promise2.default.resolve().then(function () {
		var t = /^\/.*/;
		var hostname = reqInfo.host.split(':')[0];
		if (!_net2.default.isIP(hostname)) {
			reqInfo.headers.host = reqInfo.host;
		}
		// 请求选项
		var options = {
			hostname: hostname,
			port: reqInfo.port || (reqInfo.protocol === 'http' ? 80 : 443),
			path: t.test(reqInfo.path) ? reqInfo.path : '/' + reqInfo.path,
			method: reqInfo.method,
			headers: reqInfo.headers
		};
		if (reqInfo.protocol === 'https') {
			options.rejectUnauthorized = false;
			// 旧的协议是http-即http跳转向https--从新生成证书
			if (oldProtocol === 'http') {
				var _getCert = (0, _cert.getCert)(hostname),
				    key = _getCert.privateKey,
				    cert = _getCert.cert;

				options.key = key;
				options.cert = cert;
			}
		}
		return options;
	}).then(function (options) {
		return detailHost.call(com, options, reqInfo, resInfo);
	}).then(function (options) {
		return proxyReq.call(com, options, reqInfo, resInfo, req);
	});
};