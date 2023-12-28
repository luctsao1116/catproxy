'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	return function (req, res, next) {
		if (req.url == '/' || req.url == '/index.html') {
			res.render('host/app');
		} else {
			next();
		}
	};
};