'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (err, req, res) {
	_log2.default.error('发生错误了,', err.message);
	res.status(500);
	res.render('500', {
		message: '发生错误了,' + err.message
	});
};

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }