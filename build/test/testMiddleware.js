'use strict';

var _requestMiddleware = require('../requestMiddleware');

var middleware = _interopRequireWildcard(_requestMiddleware);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var a = function a(req, res, next) {
	setTimeout(function () {
		console.log('a', req, res);
		next();
	}, 300);
};
var b = function b(req, res, next) {
	console.log('b', req, res);
	next();
};

var c = function c(req, res, next) {
	setTimeout(function () {
		console.log('c', req, res);
		next();
	}, 300);
};

middleware.use(a);
middleware.use(b);
middleware.use(c);
middleware.middleWare(function (req, res) {
	console.log('final success', req, res);
})({ req: 1 }, { res: 1 });