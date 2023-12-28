'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _config = require('../config/config');

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = function () {
	return function (req, res, next) {
		var rules = config.get('hosts');
		res.set('Content-Disposition', 'attachment; filename="rule.json"');
		res.set('Content-Type', 'application/json');
		res.set('Accept-Ranges', 'bytes');
		if (rules && rules.length) {
			res.json(rules);
		} else {
			next('没有可用的配置');
		}
	};
};