// export
'use strict';
// 默认类型为http

Object.defineProperty(exports, "__esModule", {
	value: true
});
var DEFAULT_TYPE = exports.DEFAULT_TYPE = 'http';
// 默认代理端口为 8888
var DEFAULT_PORT = exports.DEFAULT_PORT = 80;
var DEFAULT_HTTPS_PORT = exports.DEFAULT_HTTPS_PORT = 443;
var DEFAULT_UI_PORT = exports.DEFAULT_UI_PORT = 8001;
// weinrePort
var DEFAULT_WEINRE_PORT = exports.DEFAULT_WEINRE_PORT = 8002;
var WEINRE_PATH = exports.WEINRE_PATH = '/__jianxcao__';
// https服务器启动时候需要的证书
var DEFAULT_CERT_HOST = exports.DEFAULT_CERT_HOST = 'localhost';
var DEFAULT_BREAK_HTTPS = exports.DEFAULT_BREAK_HTTPS = true;
var LIMIT_SIZE = exports.LIMIT_SIZE = 1024 * 1024 * 5;

var SIN = exports.SIN = 1;
// 自动打开管理界面
var AUTO_OPEN = exports.AUTO_OPEN = true;
var STATUS = exports.STATUS = {
	// request错误
	LIMIT_ERROR: 1
};
// 录制状态
var MONITOR_STATUS = exports.MONITOR_STATUS = true;
// 录制过滤状态
var MONITOR_FILTER_STATUS = exports.MONITOR_FILTER_STATUS = true;
// 录制类型
var MONITOR_FILTER_TYPE = exports.MONITOR_FILTER_TYPE = 'all';
// 隐藏显示 dataurl
var HIDDEN_DATA_URL = exports.HIDDEN_DATA_URL = false;
// 默认配置
exports.default = {
	type: DEFAULT_TYPE,
	port: DEFAULT_PORT,
	httpsPort: DEFAULT_HTTPS_PORT,
	certHost: DEFAULT_CERT_HOST,
	breakHttps: DEFAULT_BREAK_HTTPS,
	uiPort: DEFAULT_UI_PORT,
	autoOpen: AUTO_OPEN,
	sni: SIN,
	weinrePort: DEFAULT_WEINRE_PORT,
	monitor: {
		monitorStatus: MONITOR_STATUS,
		monitorFilterStatus: MONITOR_FILTER_STATUS,
		monitorFilterType: MONITOR_FILTER_TYPE,
		hiddenDataUrl: HIDDEN_DATA_URL
	}
};