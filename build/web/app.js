'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _host = require('./host');

var _host2 = _interopRequireDefault(_host);

var _tools = require('../tools');

var _ = require('./500');

var _2 = _interopRequireDefault(_);

var _3 = require('./404');

var _4 = _interopRequireDefault(_3);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _downloadrule = require('./downloadrule');

var _downloadrule2 = _interopRequireDefault(_downloadrule);

var _downloadcert = require('./downloadcert');

var _downloadcert2 = _interopRequireDefault(_downloadcert);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _monitor = require('./monitor');

var _monitor2 = _interopRequireDefault(_monitor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (isHaveUi) {
	var uiApp = (0, _express2.default)();
	uiApp.engine('.ejs', require('ejs').__express);
	uiApp.set('views', _path2.default.join(__dirname, '../../web/build'));
	uiApp.set('view engine', 'ejs');
	// 内部使用静态文件加载
	uiApp.use('/static', _express2.default.static(_path2.default.join(__dirname, '../../web/build')));
	if (isHaveUi) {
		uiApp.use(['/m', '/m.html'], (0, _monitor2.default)());
		uiApp.use(['/index', '/index.html'], (0, _host2.default)());
	}
	uiApp.use('/downloadrule.html', (0, _downloadrule2.default)());
	uiApp.use('/downloadcert.html', (0, _downloadcert2.default)());
	uiApp.use(_4.default);
	uiApp.use(_2.default);
	return uiApp;
};