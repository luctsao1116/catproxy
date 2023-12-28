'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sendConnDetail = exports.updateMonitor = exports.addMonitor = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _webCfg = require('../config/webCfg');

var _webCfg2 = _interopRequireDefault(_webCfg);

var _status = require('./status');

var _sendType = require('./sendType');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addMonitorArr = [];
var updateMonitorArr = [];
var addMonitorTimer = void 0;
var updateMonitorTimer = void 0;
var wss = null;

var sendAddMonitor = function sendAddMonitor(data) {
	if (wss) {
		var result = {
			result: data,
			status: _status.SUCC
		};
		wss.emit(_sendType.addMonitorData, result);
	}
};
var sendUpdateMonitor = function sendUpdateMonitor(data) {
	if (wss) {
		var result = {
			result: data,
			status: _status.SUCC
		};
		wss.emit(_sendType.updateMonitorData, result);
	}
};
// 添加监控数据
var addMonitor = exports.addMonitor = function addMonitor(data) {
	if (!wss) {
		_log2.default.error('清先初始化monitor');
		return;
	}
	if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object' && data.id) {
		addMonitorArr.push(data);
	}
	if (addMonitorTimer) {
		clearTimeout(addMonitorTimer);
	}
	// 延迟比 update短点，保证先触发，如果后触发前端也会有特殊处理
	addMonitorTimer = setTimeout(function () {
		var data = addMonitorArr;
		addMonitorArr = [];
		sendAddMonitor(data);
	}, 100);
};
// 更新监控数据
var updateMonitor = exports.updateMonitor = function updateMonitor(data) {
	if (!wss) {
		_log2.default.error('清先初始化monitor');
		return;
	}
	if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object' && data.id) {
		updateMonitorArr.push(data);
	}
	if (updateMonitorTimer) {
		clearTimeout(updateMonitorTimer);
	}
	updateMonitorTimer = setTimeout(function () {
		var data = updateMonitorArr;
		updateMonitorArr = [];
		sendUpdateMonitor(data);
	}, 150);
};
// 发送监控详情数据
var sendConnDetail = exports.sendConnDetail = function sendConnDetail(data) {
	if (wss) {
		var result = {
			result: data,
			status: _status.SUCC
		};
		wss.emit(_sendType.getConDetail, result);
	}
};
// 启动项目的时候需要  群发一个消息，清除掉当前页面的记录，否则id会冲突--- 为了以防万一，id前面带个随机数？？

/**
 * 必须先调init，即default方法才能使用
 */

exports.default = function (webSocket) {
	wss = webSocket;
};