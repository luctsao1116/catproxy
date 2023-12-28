'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _cert = require('../cert/cert');

exports.default = function () {
	return function (req, res, next) {
		if ((0, _cert.isRootCertExits)()) {
			res.download((0, _cert.getRootCertPath)());
		} else {
			next('没有根证书，请调用命令生成');
		}
	};
};