'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _winston2.default.Logger({
	transports: [new _winston2.default.transports.Console({
		levels: _winston2.default.config.npm.levels,
		level: 'debug',
		stripColors: true,
		colorize: 'all'
	})]
});
// logger.error('error');
// logger.warn('warn');
// logger.info("test");
// logger.verbose('verbose');
// logger.debug('debug');
// logger.silly('silly');
exports.default = logger;