'use strict';

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mime2.default.define({
	'text/json': ['json']
});
_mime2.default.define({
	'text/javascript': ['js']
});

_mime2.default.define({
	'text/html': ['ftl']
});