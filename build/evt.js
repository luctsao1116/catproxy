'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.pipeRequest = exports.beforeRes = exports.afterRes = exports.beforeReq = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _rule = require('./config/rule');

var _config = require('./config/config');

var config = _interopRequireWildcard(_config);

var _iconvLite = require('iconv-lite');

var _iconvLite2 = _interopRequireDefault(_iconvLite);

var _buffer = require('buffer');

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tools = require('./tools');

var _dataHelper = require('./dataHelper');

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _requestIp = require('request-ip');

var _requestIp2 = _interopRequireDefault(_requestIp);

var _getLocalIps = require('./getLocalIps');

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _defCfg = require('./config/defCfg');

var _weinreServer = require('./weinreServer');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 自动解析类型，其他类型一律保存的是 Buffer
var autoDecodeRegs = /text\/.+|(?:application\/(?:json.*|.*javascript))/i; // 事件触发中心


var detailBeforeReq = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(reqInfo) {
		var catProxy, com, port, _result, _reqInfo, req, headers, clientIp, result;

		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						catProxy = this.catProxy;
						com = this;
						// 等待解析url
						// weinre解析直接转走
						// 6d902c89-aee6-4428-9357-b71c7242359f/ws/target|/b97a96cd-cd88-48dd-9d4f-7d41401aa4d8/target/target-script-min.js

						if (!(reqInfo.originalUrl.toLowerCase().indexOf(_defCfg.WEINRE_PATH + '/' + _tools.weinreId) >= 0)) {
							_context.next = 10;
							break;
						}

						port = config.get('weinrePort');

						reqInfo.host = '127.0.0.1';
						reqInfo.port = port;
						reqInfo.protocol = 'http';
						reqInfo.path = (reqInfo.path || '').replace(_defCfg.WEINRE_PATH + '/' + _tools.weinreId, '');
						_context.next = 14;
						break;

					case 10:
						_context.next = 12;
						return (0, _rule.parseRule)(reqInfo);

					case 12:
						_result = _context.sent;

						reqInfo = _result || reqInfo;

					case 14:
						// 添加 clientIp，目前还有bug-- 这段 clientIp总是获取不对
						_reqInfo = reqInfo, req = _reqInfo.req, headers = _reqInfo.headers;
						clientIp = _requestIp2.default.getClientIp(req);
						// clientIp获取不对，就设置成 机器ip？？？
						// let xForwardedFor = headers['x-forwarded-for'];
						// if (!xForwardedFor) {
						// 	headers['x-forwarded-for'] = clientIp + "," + localIps[0];
						// } else {
						// 	headers['x-forwarded-for'] = "," + localIps[0];
						// }

						reqInfo.clientIp = clientIp;
						// 触发事件
						_context.next = 19;
						return catProxy.triggerBeforeReq(reqInfo, this);

					case 19:
						result = _context.sent;

						// 修改了引用
						if (reqInfo !== result) {
							reqInfo = (0, _merge2.default)(reqInfo, result);
						}
						return _context.abrupt('return', reqInfo);

					case 22:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function detailBeforeReq(_x) {
		return _ref.apply(this, arguments);
	};
}();

/**
 * 代理请求发出前
 * 该方法主要是处理在响应前的所有事情，可以用来替换header，替换头部数据等操作
 * 可以直接像res中写数据结束请求
 * 如果是异步请返回promise对象
 * @param reqInfo 请求信息 可以修改请求代理的form数据和 请求代理的头部数据
 * @param {resInfo} 响应投信息可以修改响应投的header
 * @param res 响应对象
 * @returns {*}
 *   reqInfo 包含的信息
 *  {
 *    headers: "请求头"
 *		host: "请求地址,包括端口，默认端口省略"
 *		method: "请求方法"
 *		protocol: "请求协议"
 *		originalFullUrl: "原始请求地址，包括参数"
 *		req: "请求对象，请勿删除"
 *		port: "请求端口"
 *		startTime: "请求开始时间"
 *		path: "请求路径，包括参数"
 *		originalUrl: "原始的请求地址,不包括参数,请不要修改",
 *		bodyData: "buffer 数据，body参数，可以修改"
 *    reqInfo.sendToFile
 *    //重定向到某个url，--有这个，就会忽略远程的调用即host设置之类的都无效
 *    reqInfo.redirect
 *	}
 *
 *  举例说明,可以请求的修改的地方
 *  	修改请求头，注意只有请求远程服务器的时候管用
 *  	reqInfo.headers['test-cjx'] = 111;
 *   	//修改请求域名
 *    reqInfo.host = '114.113.198.187';
 *    //修改请求协议
 *    reqInfo.protocol = '114.113.198.187';
 *    //修改请求端口
 *    reqInfo.port="8080"
 *    //修改请求路径--包括get参数
 *    reqInfo.path= "/ccc?aaa"
 *    //修改方法
 *    reqInfo.method= "post" //注意post方法要有对应的content-type数据才能过去
 *    //修改请求数据
 *    reqInfo.bodyData = "请求数据",
 *    //直接定位到某个文件 --如果返回某个文件，有这个，就会忽略远程的调用即host设置之类的都无效
 *    reqInfo.sendToFile
 *    //重定向到某个url，--有这个，就会忽略远程的调用即host设置之类的都无效
 *    reqInfo.redirect
 */
/**
 *   test code
 * 	 reqInfo.headers['test-cjx'] = 111;
 *   reqInfo.path = '/hyg/mobile/common/base/base.34b37a3c0b.js';
 *   reqInfo.port = 9090;
 *   reqInfo.protocol = "https";
 *   reqInfo.path = "/a/b?c=d";
 *   reqInfo.method = "post";
 *   reqInfo.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
 *   reqInfo.bodyData = new Buffer('a=b&c=d');
 *   reqInfo.sendToFile = "D:/project/gitWork/catproxy/bin.js";
 *   reqInfo.serverIp ="127.0.1" *   真实地服务器ip地址，请不要修改
 *   log.debug(reqInfo.headers);
 *   log.debug(reqInfo.bodyData.toString());
 *   if (reqInfo.host.indexOf('pimg1.126.net') > -1) {
 *   	reqInfo.host = '114.113.198.187';
 *   }
 */
var beforeReq = function beforeReq(reqInfo) {
	return detailBeforeReq.call(this, reqInfo).then(null, function (err) {
		// 如果出错忽略所有数据
		// 如果改了reqInfo引用上的数据就没救了
		_log2.default.error(err);
		return reqInfo;
	});
};

/**
 *禁止缓存
 * */
var disCache = function disCache(resInfo) {
	// 禁用缓存则删掉缓存相关的header
	var disCache = config.get('disCache');
	if (disCache) {
		// http 1.1引入
		resInfo.headers['cache-control'] = 'no-store';
		// 时间点表示什么时候文件过期，缺点，服务器和客户端必须有严格的时间同步
		// 旧浏览器兼容  expires -1 表示不缓存
		resInfo.headers.expires = '-1';

		// 删除 etag ,让浏览器下次请求不能带 If-None-Match 头部,这样服务器无法返回304
		/**
   * etag是服务器首次相应带etag，给文件打标机，下次在请求的时候浏览器
   *  请求头会带 If-None-Match , 服务器根据该字段判断文件是否改变，如果没改变就返回304，否则返回新文件
   */
		delete resInfo.headers.etag;
		/**
   * last-Modified 是 浏览器首次返回的res中带Last-Modified头，标记一个时间，服务器下次接受到请求会带头If-Modified-Since
   * 服务器根据该头部判断是否是缓存，如果是返回304，不是则返回新文件
   * 缺点，如果服务器文件并没有什么改变，只是改变了时间，也会跟新文件
   */
		// 删除 last-modified,让浏览器下次请求不能带 If-Modified-Since 头部,这样服务器无法返回304
		delete resInfo.headers['last-modified'];
	}
	return resInfo;
};

/**
 * 准备响应请求前
 * @param  {[type]} resInfo [响应信息]
 *  *  resInfo包含的信息
 *  {
 *    headers: "响应头 --- 代理请求已经发出并受到，无法修改"
 *		host: "请求地址,包括端口，默认端口省略 --- 代理请求已经发出并受到，无法修改"
 *		method: "请求方法 --- 代理请求已经发出并受到，无法修改"
 *		protocol: "请求协议 --- 代理请求已经发出并受到，无法修改"
 *		originalFullUrl: "原始请求地址，包括参数 --- 代理请求已经发出并受到，无法修改"
 *		res: "请求对象，请勿删除 --- 代理请求已经发出并受到，无法修改"
 *		port: "请求端口 --- 代理请求已经发出并受到，无法修改"
 *		startTime: "请求开始时间 --- 代理请求已经发出并受到，无法修改"
 *		path: "请求路径，包括参数 --- 代理请求已经发出并受到，无法修改"
 *		originalUrl: "原始的请求地址,不包括参数,请不要修改 --- 代理请求已经发出并受到，无法修改", 

 *    statusCode: "响应状态码, 可以修改"
 *    headers: "响应头,可修改"
 *    ---注意如果有bodyData则会直接用bodyData的数据返回
 *		bodyData: "buffer 数据",
 *		bodyDataErr: "请求出错，目前如果是大文件会触发这个,这个时候bodyData为空，且不可以设置"
 *    charset: "", 编码，如果是 文本文件设置后，如果支持该编码将用该编码解码
 *		//这个时候 resInfo,bodyData无效
 *    
 *	}
 *
 *   举例说明可以修改响应的地方/
 *  	resInfo.headers['test-cjx'] = 111;
 * @return {[type]}         [description]
 */
var beforeRes = function () {
	var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resInfo) {
		var catProxy, com, contentEncoding, contentType, bodyData, result, meta;
		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						catProxy = this.catProxy;
						com = this;
						contentEncoding = resInfo.headers['content-encoding'];
						contentType = resInfo.headers['content-type'];

						resInfo.ext = _mime2.default.extension(contentType || '') || (_path2.default.extname(_url2.default.parse(resInfo.originalUrl || '').pathname || '') || '').slice(1);
						// 禁止缓存
						_context2.next = 7;
						return disCache(resInfo);

					case 7:
						resInfo = _context2.sent;
						_context2.prev = 8;

						if (!(contentEncoding && resInfo.bodyData.length)) {
							_context2.next = 16;
							break;
						}

						_context2.next = 12;
						return (0, _dataHelper.decodeCompress)(resInfo.bodyData, contentEncoding);

					case 12:
						bodyData = _context2.sent;

						resInfo.bodyData = bodyData;
						delete resInfo.headers['content-encoding'];
						// 更新content-length
						if (resInfo.headers['content-length']) {
							resInfo.headers['content-length'] = bodyData.length;
						}

					case 16:
						_context2.next = 21;
						break;

					case 18:
						_context2.prev = 18;
						_context2.t0 = _context2['catch'](8);

						_log2.default.error(_context2.t0);

					case 21:
						_context2.next = 23;
						return catProxy.triggerBeforeRes(resInfo, this);

					case 23:
						result = _context2.sent;

						// 修改了引用
						if (resInfo !== result) {
							resInfo = (0, _merge2.default)(resInfo, result);
						}
						resInfo.isBinary = (0, _dataHelper.isBinary)(resInfo.bodyData);
						// 文本文件 -- 需要检测编码是不是不是 utf-8
						// 二进制文件是没有charset的

						if (resInfo.isBinary) {
							_context2.next = 40;
							break;
						}

						// 设置默认编码
						resInfo.charset = (0, _dataHelper.getCharset)(resInfo);

						if (!resInfo.weinre) {
							_context2.next = 39;
							break;
						}

						_context2.prev = 29;
						_context2.next = 32;
						return (0, _weinreServer.insertWeinreScript)(resInfo.bodyData, resInfo.charset, _defCfg.WEINRE_PATH);

					case 32:
						resInfo.bodyData = _context2.sent;

						if (resInfo.headers['content-length']) {
							resInfo.headers['content-length'] = resInfo.bodyData.length;
						}
						_context2.next = 39;
						break;

					case 36:
						_context2.prev = 36;
						_context2.t1 = _context2['catch'](29);

						_log2.default.error(_context2.t1);

					case 39:
						// 是个文件
						if (contentType && contentType.indexOf('text/html') > -1 && config.get('cacheFlush') && resInfo.bodyData && resInfo.bodyData.length) {
							meta = '\n\t\t\t<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n\t\t\t<meta http-equiv="Pragma" content="no-cache" />\n\t\t\t<meta http-equiv="Expires" content="0" />\n\t\t\t';

							resInfo.bodyData = resInfo.bodyData.toString().replace('<head>', '<head>' + meta);
							resInfo.bodyData = _iconvLite2.default.encode(resInfo.bodyData, resInfo.charset || 'UTF-8');
							// 重新设置body的长度
							if (resInfo.headers['content-length']) {
								resInfo.headers['content-length'] = resInfo.bodyData.length;
							}
						}

					case 40:
						return _context2.abrupt('return', resInfo);

					case 41:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this, [[8, 18], [29, 36]]);
	}));

	return function beforeRes(_x2) {
		return _ref2.apply(this, arguments);
	};
}();

/**
 * 请求响应后
 * 该方法主要是请求响应后的处理操作，主要是可以查看请求数据，
 * 注意这时候请求已经结束了，无法在做其他的处理
 * @param result
 * 所有字段不可以修改,只可以查看
 *  * result包含的信息
 *  {
 *  	statusCode: "响应状态码"
 *    headers: "请求头"
 *		host: "请求地址"
 *		method: "请求方法"
 *		protocol: "请求协议"
 *		originalFullUrl: "原始请求地址，包括参数"
 *		port: "请求端口"
 *		endTime: "请求开始时间"
 *		path: "请求路径，包括参数"
 *		originalUrl: "原始的请求地址,不包括参数",
 *		bodyData: "buffer 数据，body参数",
 *		bodyDataErr: null,
 *		bodyDataFile: null //如果资源定位到本地就显示这个字段
 *	}
 * @returns {*}
 */
var afterRes = function afterRes(result) {
	var catProxy = this.catProxy;
	catProxy.triggerAfterRes(result, this);
	return result;
};

// 中转请求
var pipeRequest = function pipeRequest(result) {
	result.id = (0, _tools.getMonitorId)();
	var catProxy = this.catProxy;
	catProxy.triggerPipeReq(result, this);
	return result;
};
exports.beforeReq = beforeReq;
exports.afterRes = afterRes;
exports.beforeRes = beforeRes;
exports.pipeRequest = pipeRequest;