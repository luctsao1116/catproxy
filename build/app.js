'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CatProxy = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _spdy = require('spdy');

var _spdy2 = _interopRequireDefault(_spdy);

var _extendMime = require('./extendMime');

var _extendMime2 = _interopRequireDefault(_extendMime);

var _defCfg = require('./config/defCfg');

var _defCfg2 = _interopRequireDefault(_defCfg);

var _config = require('./config/config');

var config = _interopRequireWildcard(_config);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _requestSerives = require('./requestSerives');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _cert2 = require('./cert/cert.js');

var _httpsProxySer = require('./httpsProxySer');

var _app = require('./web/app');

var _app2 = _interopRequireDefault(_app);

var _getLocalIps = require('./getLocalIps');

var _tools = require('./tools');

var _requestMiddleware = require('./requestMiddleware');

var requestMiddleware = _interopRequireWildcard(_requestMiddleware);

var _configProps = require('./config/configProps');

var _configProps2 = _interopRequireDefault(_configProps);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _rule = require('./config/rule');

var rule = _interopRequireWildcard(_rule);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _webCfg = require('./config/webCfg');

var _webCfg2 = _interopRequireDefault(_webCfg);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ws = require('./ws/ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//	process.env.NODE_ENV
var getLocalUiReg = function getLocalUiReg(port) {
	var ips = _getLocalIps.localIps.slice(0);
	ips.push('localhost');
	var l = ips.length;
	return ips.reduce(function (result, cur, index) {
		if (index > 0) {
			result += '|';
		}
		result += '(?:' + cur;
		if (port !== 80 || port !== 443) {
			result += ':' + port + ')';
		} else {
			result += ')';
		}
		// 最后一次
		if (index === l - 1) {
			return new RegExp(result, 'i');
		}
		return result;
	}, '^(?:http|ws)(?:s?)://');
};
/**
 * 按顺序调用数组，每个步骤返回promise
 * @arr 表示要执行的数据
 * @result表示执行的结果，结果会进行合并，结果必须是一个object
 * @context 表示执行的上下文
 */
var execArrByStep = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(arr, result, context) {
		var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, cur, newRes;

		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						result = result || {};

						if (!(!arr || !arr.length)) {
							_context.next = 3;
							break;
						}

						return _context.abrupt('return', result);

					case 3:
						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						_context.prev = 6;
						_iterator = arr[Symbol.iterator]();

					case 8:
						if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
							_context.next = 18;
							break;
						}

						cur = _step.value;

						if (!cur) {
							_context.next = 15;
							break;
						}

						_context.next = 13;
						return cur.call(context, result);

					case 13:
						newRes = _context.sent;

						// 修改了引用
						if (newRes !== result) {
							result = (0, _merge2.default)(result, newRes);
						}

					case 15:
						_iteratorNormalCompletion = true;
						_context.next = 8;
						break;

					case 18:
						_context.next = 24;
						break;

					case 20:
						_context.prev = 20;
						_context.t0 = _context['catch'](6);
						_didIteratorError = true;
						_iteratorError = _context.t0;

					case 24:
						_context.prev = 24;
						_context.prev = 25;

						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}

					case 27:
						_context.prev = 27;

						if (!_didIteratorError) {
							_context.next = 30;
							break;
						}

						throw _iteratorError;

					case 30:
						return _context.finish(27);

					case 31:
						return _context.finish(24);

					case 32:
						return _context.abrupt('return', result);

					case 33:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this, [[6, 20, 24, 32], [25,, 27, 31]]);
	}));

	return function execArrByStep(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
}();

var CatProxy = function () {
	/**
  *
  * @param  {[type]} option
  *  {
  *  	type: "当前服务器类型"
  *		port: "当前http端口",
  *    httpsPort: "当前https服务器端口",
  *		certHost: "https证书生成默认host代理",
  *		crackHttps 是否解开 https请求，在 http代理模式下,
  *		log: '日志级别',
  *		uiPort 端口
  *	}
  *	@param servers 自定义服务器,最多同时开启2个服务器，一个http一个https, 2个服务器的时候顺序是http,https  	如果只有一个则没有顺序问题
  *
  *  @param saveProps 要同步到文件的字段 为空则全部同步
  *
  */
	function CatProxy(opt, saveProps) {
		(0, _classCallCheck3.default)(this, CatProxy);

		this.option = {};
		// 初始化配置文件
		(0, config.default)();
		var certDir = (0, _cert2.getCertDir)();
		_log2.default.info('\u5F53\u524D\u8BC1\u4E66\u76EE\u5F55\uFF1A ' + certDir);
		// 读取缓存配置文件
		var fileCfg = {};
		_configProps2.default.forEach(function (current) {
			var val = config.get(current);
			if (val !== undefined && val !== null) {
				fileCfg[current] = val;
			}
		});
		// 混合三种配置
		var cfg = _merge2.default.recursive({}, _defCfg2.default, fileCfg, opt);
		if (saveProps && saveProps.length) {
			this.option.saveProps = saveProps;
			// 配置了保存字段，则只保存这些字段
			config.setSaveProp.apply(config, (0, _toConsumableArray3.default)(saveProps));
		}
		// 将用户当前设置保存到缓存配置文件
		_configProps2.default.forEach(function (current) {
			if (cfg[current] !== null && cfg[current] !== undefined) {
				// 为‘’表示要删除这个字段
				if (cfg[current] === '' && config.get(current)) {
					config.del(current);
				} else {
					config.set(current, cfg[current]);
				}
			}
		});
		config.save();
		this._beforeReqEvt = [];
		this._beforeResEvt = [];
		this._afterResEvt = [];
		this._pipeRequestEvt = [];
	}

	(0, _createClass3.default)(CatProxy, [{
		key: 'init',
		value: function init() {
			var _this = this;

			var com = this;
			// 'hosts', "log", 'breakHttps', 'excludeHttps', 'sni' 可以通过 进程修改的字段
			// 别的进程发送的消息
			process.on('message', function (message) {
				if (!message.result || !(0, _typeof3.default)(message.result) === 'object') {
					return;
				}
				_log2.default.debug('receive message');
				if (message.type) {
					switch (message.type) {
						case 'config':
							var data = {};
							config.set(message.result);
							// 所有配置均不保存
							config.save([]);
							com.setLogLevel();
							break;
						default:
							_log2.default.error('收到未知的消息', message);
					}
				}
			});
			this.setLogLevel();
			// dangerous options
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
			return _promise2.default.resolve().then(this.createCache.bind(this)).then(this.checkParam.bind(this)).then(this.checkEnv.bind(this)).then(this.createServer.bind(this)).then(this.uiInit.bind(this)).then(null, function (err) {
				_this.errorHandle(err);
				process.exit(1);
			});
		}
		// 创建缓存，创建请求保存

	}, {
		key: 'createCache',
		value: function createCache() {}
	}, {
		key: 'checkParam',
		value: function checkParam() {}
		// 设置 日志级别

	}, {
		key: 'setLogLevel',
		value: function setLogLevel(logLevel) {
			if (logLevel) {
				config.set('log', logLevel);
				_log2.default.transports.console.level = config.get('log');
				config.save('log');
			} else {
				_log2.default.transports.console.level = config.get('log');
			}
		}
		// 设置服务器类别

	}, {
		key: 'setServerType',
		value: function setServerType(type) {
			config.set('type', type);
			config.save('type');
		}
		// 设置服务器端口

	}, {
		key: 'setHttpPort',
		value: function setHttpPort(port) {
			port = +port;
			config.set('port', port);
			config.save('port');
		}
	}, {
		key: 'setHttpsPort',
		value: function setHttpsPort(port) {
			port = +port;
			config.set('httpsPort', port);
			config.save('httpsPort');
		}
		// 设置ui端口

	}, {
		key: 'setUiPort',
		value: function setUiPort(port) {
			port = +port;
			config.set('uiPort', port);
			config.save('uiPort');
		}
		// 设置sni类型

	}, {
		key: 'setSniType',
		value: function setSniType(type) {
			config.set('sni', type);
			config.save('sni');
		}
		// 设置破解https

	}, {
		key: 'setBreakHttps',
		value: function setBreakHttps(list) {
			config.set('breakHttps', list);
			config.save('breakHttps');
		}
		// 设置排除https列表

	}, {
		key: 'setExcludeHttps',
		value: function setExcludeHttps(list) {
			config.set('excludeHttps', list);
			config.save('excludeHttps');
		}
	}, {
		key: 'setRules',
		value: function setRules(rules) {
			rule.saveRules(rules);
		}
		// 获取配置

	}, {
		key: 'getConfig',
		value: function getConfig(key) {
			if (typeof key === 'string') {
				return config.get(key);
			}
			return config.get();
		}
	}, {
		key: 'setConfig',
		value: function setConfig() {
			config.set.apply(config, arguments);
			config.save();
		}
		// 环境检测

	}, {
		key: 'checkEnv',
		value: function checkEnv() {}
	}, {
		key: 'uiInit',
		value: function uiInit() {
			var _this2 = this;

			var port = config.get('uiPort');
			var isAutoOpen = config.get('autoOpen');
			var p = port;
			// 如果port是0 则只提供下载链接的server
			return _promise2.default.resolve(p || (0, _tools.getPort)()).then(function (p) {
				// 内置服务器初始化
				var host = 'http://' + _getLocalIps.localIps[0] + ':' + p;
				var uiOption = {
					port: p,
					hostname: _getLocalIps.localIps[0],
					host: host,
					wsServerUrl: host + _webCfg2.default.wsPath,
					cdnBasePath: _path2.default.join('/c', _webCfg2.default.cdnBasePath),
					env: _webCfg2.default.env
				};
				// 写成正则，判断是否是ui的一个访问地址
				_this2.localUiReg = getLocalUiReg(p);
				var uiApp = (0, _app2.default)(!!port);
				var app = (0, _express2.default)();
				var uiServer = app.listen(p, function () {
					_log2.default.info('catproxy 规则配置地址：' + host + '/c/index');
					_log2.default.info('catproxy 监控界面地址：' + host + '/c/m');
					if (port && isAutoOpen) {
						(0, _tools.openCmd)(host + '/c/index');
					}
				});
				uiApp.locals.uiOption = uiOption;
				uiServer.on('error', function (err) {
					(0, _tools.error)(err);
					process.exit(1);
				});
				// 字app
				app.use('/c', uiApp);
				_this2.ui = {
					app: app,
					uiServer: uiServer
				};
			}).then(function () {
				if (port) {
					return (0, _ws2.default)(_this2.ui.uiServer, _this2);
				}
			}).then(function (wsServer) {
				if (wsServer) {
					_this2.ui.wsServer = wsServer;
				}
			});
		}
		// 出错处理

	}, {
		key: 'errorHandle',
		value: function errorHandle(err) {
			if (err) {
				_log2.default.error(err);
			}
			return _promise2.default.reject(err);
		}
		// 根据配置创建服务器

	}, {
		key: 'createServer',
		value: function createServer() {
			var opt = config.get();
			var servers = this.servers || [];
			var com = this;
			// 可以自定义server或者用系统内置的server
			if (opt.type === 'http' && !servers[0]) {
				servers[0] = _http2.default.createServer();
			} else if (opt.type === 'https' && !servers[0]) {
				// 找到证书，创建https的服务器
				var _getCert = (0, _cert2.getCert)(opt.certHost),
				    key = _getCert.privateKey,
				    cert = _getCert.cert;

				servers[0] = _spdy2.default.createServer({
					key: key,
					cert: cert,
					rejectUnauthorized: false,
					SNICallback: _httpsProxySer.SNICallback
				});
			} else if (opt.type === 'all' && !servers[0] && !servers[1]) {
				servers[0] = _http2.default.createServer();

				var _getCert2 = (0, _cert2.getCert)(opt.certHost),
				    _key = _getCert2.privateKey,
				    _cert = _getCert2.cert;

				servers[1] = _https2.default.createServer({
					key: _key,
					cert: _cert,
					rejectUnauthorized: false,
					SNICallback: _httpsProxySer.SNICallback
				});
			}
			var requestFun = requestMiddleware.middleWare(_requestSerives.requestHandler);
			servers.forEach(function (server) {
				server.catProxy = com;
				// 如果在http下代理https，则需要过度下请求
				if (server instanceof _http2.default.Server) {
					server.on('connect', _requestSerives.requestConnectHandler);
				}
				server.on('upgrade', _requestSerives.requestUpgradeHandler);
				server.on('request', function (req, res) {
					if (req.headers.upgrade) {
						return;
					}
					requestFun.call(this, req, res);
				});
				server.on('clientError', function (err, con) {
					_log2.default.error('ser-clientError' + err);
				});
				var serverType = server instanceof _http2.default.Server ? 'http' : 'https';
				var port = serverType === 'http' ? opt.port : opt.httpsPort;
				// 如果server没有被监听，则调用默认端口监听
				if (!server.listening) {
					// 根据server的类型调用不同的端口
					server.listen(port, function () {
						_log2.default.info('代理服务器启动于：' + (serverType + '://' + _getLocalIps.localIps[0] + ':' + port));
					});
				}
				server.on('error', function (err) {
					(0, _tools.error)(err);
					process.exit(1);
				});
			});
			this.servers = servers;
		}
		// 想服务器添加request事件

	}, {
		key: 'use',
		value: function use(fun) {
			requestMiddleware.use(fun);
			return this;
		}
		// 在中转请求前，可以用于修改reqInfo

	}, {
		key: 'onBeforeReq',
		value: function onBeforeReq() {
			var _this3 = this;

			for (var _len = arguments.length, fun = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
				fun[_key2] = arguments[_key2];
			}

			fun.forEach(function (f) {
				return _util2.default.isFunction(f) && _this3._beforeReqEvt.push(f);
			});
		}
		// 请求结束，可以用于产看请求结果

	}, {
		key: 'onAfterRes',
		value: function onAfterRes() {
			var _this4 = this;

			for (var _len2 = arguments.length, fun = Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
				fun[_key3] = arguments[_key3];
			}

			fun.forEach(function (f) {
				return _util2.default.isFunction(f) && _this4._afterResEvt.push(f);
			});
		}
		// 获得中转请求前，可以用于修改resInfo

	}, {
		key: 'onBeforeRes',
		value: function onBeforeRes() {
			var _this5 = this;

			for (var _len3 = arguments.length, fun = Array(_len3), _key4 = 0; _key4 < _len3; _key4++) {
				fun[_key4] = arguments[_key4];
			}

			fun.forEach(function (f) {
				return _util2.default.isFunction(f) && _this5._beforeResEvt.push(f);
			});
		}
	}, {
		key: 'onPipeRequest',
		value: function onPipeRequest() {
			var _this6 = this;

			for (var _len4 = arguments.length, fun = Array(_len4), _key5 = 0; _key5 < _len4; _key5++) {
				fun[_key5] = arguments[_key5];
			}

			fun.forEach(function (f) {
				return _util2.default.isFunction(f) && _this6._pipeRequestEvt.push(f);
			});
		}
		/**
   * 触发req事件，result表示参数，context表示上下文
   * result 格式看evt中的格式
   */

	}, {
		key: 'triggerBeforeReq',
		value: function triggerBeforeReq(result, context) {
			return execArrByStep(this._beforeReqEvt.concat([this.__monitorBeforeReq]), result, context);
		}
		/**
   * 触发 请求前事件
   *  result 格式看evt中的格式
   *  context为上下文
   */

	}, {
		key: 'triggerBeforeRes',
		value: function triggerBeforeRes(result, context) {
			return execArrByStep(this._beforeResEvt.concat([this.__monitorBeforeRes]), result, context);
		}
		/**
   * 触发请求后事件
   *  result 格式看evt中的格式
   *  context为上下文
   */

	}, {
		key: 'triggerAfterRes',
		value: function triggerAfterRes(result, context) {
			(this._afterResEvt || []).concat([this.__monitorAfterRes]).forEach(function (current) {
				try {
					current && current.call(context, result);
				} catch (e) {
					_log2.default.error(e);
				}
			});
		}
		/**
   * 触发穿过请求
   *  result 格式看evt中的格式
   *  context为上下文
   */

	}, {
		key: 'triggerPipeReq',
		value: function triggerPipeReq(result, context) {
			if (this._pipeRequestEvt.length) {
				this._pipeRequestEvt.forEach(function (current) {
					try {
						current.call(context, result);
					} catch (e) {
						_log2.default.error(e);
					}
				});
			}
		}
	}]);
	return CatProxy;
}();

exports.default = CatProxy;
exports.CatProxy = CatProxy;