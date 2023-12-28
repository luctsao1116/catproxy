'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (catproxy) {
	if (!catproxy || !catproxy.onBeforeReq) {
		throw new Error('catproxy是必须得');
	}
	var monitorBeforeReq, monitorBeforeRes, monitorAfterRes;
	// 检测是不是本地的一个服务器
	// 只要ip是localhost ui服务器 或者是weinre的请求就忽略
	var checkIsInnerServer = function checkIsInnerServer(originalUrl) {
		return catproxy.localUiReg.test(originalUrl) || originalUrl.toLowerCase().indexOf(_defCfg.WEINRE_PATH + '/' + _tools.weinreId) >= 0;
	};
	// 请求发送前
	monitorBeforeReq = function monitorBeforeReq(result) {
		if (result && result.id && config.get('monitor:monitorStatus') && !checkIsInnerServer(result.originalUrl)) {
			/**
    * 
    * 目前没有把请求数据直接保存到文件，后期可以考虑
   	请求头部数据一共三种，一种是  post提交数据 一种是  get提交数据， 还有一种是表单提交数据，表单提交数据如果带 二进制就存储，否则直接返回
   	contentType 的三种情况
   	application/x-www-form-urlencoded	在发送前编码所有字符（默认）// 转换成 form data   & 符号链接的数据，   <xml 数据  等等， 直接返回json ？？？
   	text/plain	空格转换为 "+" 加号，但不对特殊字符编码。		// 转换成form data  任意不是二进制的数据 -- 可以检查  是不是{}或者 []开始判断是不是json
   	上面2种类似
   	multipart/form-data	不对字符编码。在使用包含文件上传控件的表单时，必须使用该值。 去掉二进制数据转换  multipart request payload
   	
   **/

			var contentType = result.headers['content-type'];
			var addMontiorData = {
				id: result.id,
				name: result.originalFullUrl,
				protocol: result.protocol,
				method: result.method,
				reqHeaders: result.headers,
				startTime: result.startTime
			};
			if (result.ruleInfo) {
				addMontiorData.reqRuleInfo = result.ruleInfo;
			}
			var bodyData = result.bodyData;
			if (result.bodyData) {
				var isb = (0, _dataHelper.isBinary)(result.bodyData);
				addMontiorData.isReqBinary = isb;
				if (isb) {
					if (contentType) {
						// 混合流，里面有二进制的文件数据也有 字段数据，需要解析下
						if (contentType.indexOf('boundary=') > -1) {
							bodyData = detailMultipartData(contentType, bodyData);
						} else {
							// 不认识的二进制数据忽略
							bodyData = '二进制数据!!!';
						}
					} else {
						bodyData = '二进制数据!!!';
					}
				}
				addMontiorData.reqBodyData = (bodyData || '').toString();
				// log.debug(contentType, "************\n" ,result.bodyData.length, "**************\n", result.originalFullUrl);
				// log.debug("isBinary", isb);
				// log.debug('content--', addMontiorData.bodyData);
				// 先记录到缓存中
				monitorList[result.id] = addMontiorData;
			}
		}
	};
	// 准备发送请求
	monitorBeforeRes = function monitorBeforeRes(result) {
		if (result && result.id && config.get('monitor:monitorStatus') && !checkIsInnerServer(result.originalUrl)) {
			var addMontiorData = (0, _merge2.default)(monitorList[result.id], {
				ext: result.ext,
				resHeaders: result.headers,
				serverIp: result.serverIp
			});
			var type = (0, _dataHelper.getReqType)(addMontiorData, result.ext) || 'other';
			addMontiorData.type = type;
			// 当所有用户调用结束在看是否是二进制数据
			result.isBinary = (0, _dataHelper.isBinary)(result.bodyData);
			addMontiorData.isResbinary = result.isBinary;
			// 修改缓存数据
			monitorList[result.id] = {
				startTime: addMontiorData.startTime
			};
			// startTime不需要传递到前端
			delete addMontiorData.startTime;
			// 调用数据增加
			(0, _sendMsg.addMonitor)(addMontiorData);
		}
	};
	// 请求发送后
	monitorAfterRes = function monitorAfterRes(result) {
		if (result && +result.id && config.get('monitor:monitorStatus') && !checkIsInnerServer(result.originalUrl)) {
			if (monitorList[result.id]) {
				var startTime = monitorList[result.id].startTime;
				var bodyData = result.bodyData;

				var fileName = void 0;
				var resBodyData = void 0;
				if (bodyData && bodyData.length) {
					var contentType = result.headers['content-type'];
					// 是二进制数据并且是图片，或者不是二进制数据
					if (!result.isBinary || result.isBinary && _dataHelper.isImage.test(contentType)) {
						var md5 = _crypto2.default.createHash('md5');
						md5.update(bodyData);
						fileName = md5.digest('hex');
						fileName = resBodyName + fileName;
						// 缓存文件
						(0, _cacheFile.cacheFile)(fileName, bodyData);
					} else {
						resBodyData = '二进制数据!!!';
					}
				} else {
					if (result.bodyDataErr) {
						resBodyData = result.bodyDataErr;
					} else {
						// 可能是 302，等请求没有响应内容
						resBodyData = '';
					}
				}
				var updateData = {
					id: result.id,
					time: result.endTime - startTime,
					status: result.statusCode,
					size: bodyData ? bodyData.length : 0
				};
				if (result.charset) {
					updateData.resCharset = result.charset;
				}
				if (fileName) {
					updateData.resBodyDataId = fileName;
				}
				if (resBodyData !== undefined) {
					updateData.resBodyData = resBodyData;
				}
				delete monitorList[result.id];
				(0, _sendMsg.updateMonitor)(updateData);
			}
		}
	};
	// 动态添加到数组中，因为这些方法在用户调用 on事件后才能被调用
	catproxy.__monitorBeforeReq = monitorBeforeReq;
	catproxy.__monitorBeforeRes = monitorBeforeRes;
	catproxy.__monitorAfterRes = monitorAfterRes;
	// 管道调用
	catproxy.onPipeRequest(function (result) {
		// 后面判断带得协议不准确，但是仅仅是为了通过正则，测试，正则中并不关系，请求的类型是ws还是wss
		if (result && result.id && config.get('monitor:monitorStatus') && !checkIsInnerServer('ws://' + result.host)) {
			var addMontiorData = {
				id: result.id,
				name: (result.host || '').split(':')[0],
				protocol: result.protocol,
				method: 'CONNECT',
				time: '-',
				status: 200,
				size: 0,
				type: result.protocol === 'ws' || result.protocol === 'wss' ? 'ws' : 'other'
			};
			// 调用数据增加
			(0, _sendMsg.addMonitor)(addMontiorData);
		}
	});
};

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _isbinaryfile = require('isbinaryfile');

var _isbinaryfile2 = _interopRequireDefault(_isbinaryfile);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _cacheFile = require('./cacheFile');

var _dataHelper = require('../dataHelper');

var _sendMsg = require('../ws/sendMsg');

var _tools = require('../tools');

var _config = require('../config/config');

var config = _interopRequireWildcard(_config);

var _defCfg = require('../config/defCfg');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 当前监控数据-- 记录文件的url和 resBodyData的文件生成的md5值
var monitorList = {};
var resBodyName = '_res_body_';
// 处理mulitpartData
/** 数据格式
 * multipart/form-data; boundary=----WebKitFormBoundaryAxMpx9qwQiovE99R 659
		content-- ------WebKitFormBoundaryAxMpx9qwQiovE99R
		Content-Disposition: form-data; name="fileName"

		说明.txt
		------WebKitFormBoundaryAxMpx9qwQiovE99R
		Content-Disposition: form-data; name="gameId"

		2010110218YX22859517
		------WebKitFormBoundaryAxMpx9qwQiovE99R
		Content-Disposition: form-data; name="formatType"

		1
		------WebKitFormBoundaryAxMpx9qwQiovE99R
		Content-Disposition: form-data; name="period"
		61202
		------WebKitFormBoundaryAxMpx9qwQiovE99R
		Content-Disposition: form-data; name="uploadFile"; filename="说明.txt"
		Content-Type: text/plain

		xbmcRemote Զ�̿��� kodi������


		homido ����ͷ������
		------WebKitFormBoundaryAxMpx9qwQiovE99R--
 */
var detailMultipartData = function detailMultipartData(contentType, bodyData) {
	contentType = contentType || '';
	var key = contentType.toLowerCase().split('boundary=');
	if (key && key.length > 0) {
		var reg = /Content-Disposition\s*:\s*form-data;.+;\s*filename=.*/gi;
		var isContentType = /^Content-Type.*/i;
		key = key[1];
		var data = bodyData.toString().split('\n');
		var newData = [];
		var l = data.length;
		var s = null;
		var j = null;
		if (l) {
			for (var i = 0; i < l; i++) {
				var current = data[i] || '';
				if (reg.test(current)) {
					s = true;
				}
				if (s) {
					if (!j) {
						newData.push(current);
					}
					if (isContentType.test(current)) {
						j = true;
					}
					if (current.indexOf(key) > -1) {
						j = null;
						s = null;
						newData.push(current);
					}
				} else {
					newData.push(current);
				}
			}
		}
		return newData.join('\n');
	}
};