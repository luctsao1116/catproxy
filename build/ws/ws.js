'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _receiveMsg = require('./receiveMsg');

var receiveMsg = _interopRequireWildcard(_receiveMsg);

var _receiveType = require('./receiveType');

var receiveType = _interopRequireWildcard(_receiveType);

var _webCfg = require('../config/webCfg');

var _webCfg2 = _interopRequireDefault(_webCfg);

var _monitor = require('../monitor/monitor');

var _monitor2 = _interopRequireDefault(_monitor);

var _sendMsg = require('./sendMsg');

var _sendMsg2 = _interopRequireDefault(_sendMsg);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * websocket通讯入口
 *
 *  所有接受到得消息是一个Object
 *
 * {
 * 	path: "数据访问路径，相同type下的不同逻辑处理可以用不同的path"
 * 	param: "请求参"
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
var wss;

// 方法分发
// 会根据receiveType中定义的不同类型调用不同的事件，每个事件的方法就是receiveType的键
// 方法有三个参数message(当前客户端的消息)， ws(当前的client连接), wss (io对象)
// 方法返回值 可以是promise或者 值，如果返回值为空，则不会给客户端回写值
var recive = function recive(ws, evtType) {
	ws.on(receiveType[evtType], function (message, callback) {
		_log2.default.verbose('收到消息, 消息类型: ' + receiveType[evtType]);
		var method = receiveMsg[evtType];
		var result = null;
		if (method) {
			// 调用定义的方法
			result = method(message, ws, wss);
			// 需要向客户端返回结果
			if (result) {
				// 返回的是一个promise
				if (result.then) {
					result.then(function (msg) {
						return msg && callback(msg);
					}, function (msg) {
						return msg && callback(msg);
					});
				} else {
					callback(result);
				}
			}
		} else {
			_log2.default.warn('\u6D88\u606F' + receiveType[evtType] + '\u67E5\u627E\u6267\u884C\u65B9\u6CD5\u5931\u8D25');
		}
	});
};

// 将接受到的消息映射到 receiveMsg中去处理
var distributeReciveMethod = function distributeReciveMethod() {
	// 有新的客户端建立链接
	// 所有请求都在catproxy下
	wss.of(_webCfg2.default.wsPath).on('connection', function (ws) {
		for (var type in receiveType) {
			recive(ws, type);
		}
	});
};

exports.default = function (server, catproxy) {
	if (wss) {
		return _promise2.default.resolve(wss);
	}
	if (!server) {
		return _promise2.default.reject('must have server');
	}
	return new _promise2.default(function (resolve) {
		wss = (0, _socket2.default)(server);
		wss.on('error', function (err) {
			_log2.default.info('err io', err);
		});
		// 初始化监控
		(0, _monitor2.default)(catproxy);
		distributeReciveMethod();
		// 初始化sendMsg
		(0, _sendMsg2.default)(wss.of(_webCfg2.default.wsPath));
		resolve(wss);
	});
};