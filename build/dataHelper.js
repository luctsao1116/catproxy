'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.decodeData = exports.updateExt = exports.betuifyCode = exports.getReqType = exports.getCharset = exports.isBinary = exports.decodeCompress = exports.isJSONP = exports.isMedia = exports.isImage = exports.isDataUrl = exports.isXml = exports.isFont = exports.isJSONStr = undefined;

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _buffer = require('buffer');

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _iconvLite = require('iconv-lite');

var _iconvLite2 = _interopRequireDefault(_iconvLite);

var _isbinaryfile = require('isbinaryfile');

var _isbinaryfile2 = _interopRequireDefault(_isbinaryfile);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _brotli = require('brotli');

var _brotli2 = _interopRequireDefault(_brotli);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// <meta charset="gb2312">
// <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
var checkMetaCharset = /<meta(?:\s)+.*charset(?:\s)*=(?:[\s'"])*([^"']+)/i;
var isJSONStr = exports.isJSONStr = /(^(?:\s*\[)[\s\S]*(?:\]\s*)$|(^(?:\s*\{)[\s\S]*(?:\}\s*)$))/;
var isFont = exports.isFont = /(^font\/.+)|(^application\/x-font.+)|(^application\/font.+)/;
var isXml = exports.isXml = /^\s*\<\?xml.*/;
var isDataUrl = exports.isDataUrl = /^data:.+/;
var isImage = exports.isImage = /^image\/.+/;
var isMedia = exports.isMedia = /(^video\/.+)|(^audio\/.+)/;
// 这么判断并不准确，最好是用ast，语法树，但是怕性能有问题，就用这个了
// ()中间的参数并不匹配??
var isJSONP = exports.isJSONP = /^\s*[a-zA-Z$_]+[\w$]*\s*\(([\s\S]*)(\)|(?:\)[\s;]*))$/;

// 解压数据
var decodeCompress = exports.decodeCompress = function decodeCompress(bodyData, encode) {
	if (!_buffer.Buffer.isBuffer(bodyData) || !encode) {
		return _promise2.default.reject(bodyData);
	}
	return new _promise2.default(function (resolve, reject) {
		// 成功的取到bodyData
		var isZip = /gzip/i.test(encode);
		var isDeflate = /deflate/i.test(encode);
		var isBr = /br/i.test(encode);
		if (isZip) {
			_zlib2.default.gunzip(bodyData, function (err, buff) {
				if (err) {
					_log2.default.error(err);
					reject('decompress err: ', err.message);
				} else {
					resolve(buff);
				}
			});
		} else if (isBr) {
			try {
				var result = _brotli2.default.decompress(bodyData);
				resolve(_buffer.Buffer.from(result));
			} catch (err) {
				_log2.default.error(err);
				reject('decompress err: ', err.message);
			}
		} else if (isDeflate) {
			_zlib2.default.inflateRaw(bodyData, function (err, buff) {
				if (err) {
					_log2.default.error(err);
					reject('decompress err: ', err.message);
				} else {
					resolve(buff);
				}
			});
		} else {
			reject('解压body出错，未知的编码');
		}
	});
};

var isBinary = exports.isBinary = function isBinary(buffer) {
	var data = void 0;
	if (_buffer.Buffer.isBuffer(buffer)) {
		var l = Math.min(512, buffer.length);
		data = new _buffer.Buffer(l);
		buffer.copy(data, 0, 0, l);
		return _isbinaryfile2.default.sync(data, l);
	} else if (typeof buffer === 'string') {
		// 通过文件名称判断是否是buffer
		return false;
	}
	return false;
};

var getCharset = exports.getCharset = function getCharset(resInfo) {
	var charset = 'UTF-8';
	var contentType = resInfo.headers['content-type'] || '';
	var ext = resInfo.ext;

	// 在取一次编码
	if (contentType) {
		// 如果contenttype上又编码，则重新设置编码
		var tmp = contentType.match(/charset=([^;]+)/);
		if (tmp && tmp.length > 0) {
			charset = tmp[1].toUpperCase();
			return charset;
		}
	}
	// gbk  gb2312文件编码怎么解析？？
	return charset;
};

// 根据请求获取请求的类型主要类型在 config/configProps 下地  monitorType
var getReqType = exports.getReqType = function getReqType(result) {
	var contentType = result.resHeaders['content-type'] || '';
	var type = 'other';
	var headers = result.reqHeaders;
	var ext = result.ext;
	if (headers['x-requested-with']) {
		type = 'xhr';
	} else if (isImage.test(contentType)) {
		type = 'img';
	} else if (contentType === 'text/cache-manifest') {
		type = 'mainifest';
	} else if (result.protocol === 'ws' || result.protocol == 'wss') {
		type = 'ws';
	} else if (isFont.test(contentType) || ext === 'ttf' || ext === 'woff') {
		// svg不能算是字体文件，因为svg可能是别的文件
		// font/woff2  application/x-font-ttf 2种都是font
		type = 'font';
	} else if (ext === 'js' || ext === 'jsx' || ext === 'es6' || ext === 'json' || ext === 'map') {
		type = 'js';
	} else if (ext === 'css' || ext === 'less' || ext === 'sass') {
		type = 'css';
	} else if (isMedia.test(contentType)) {
		// 视频 ，音频
		type = 'media';
	} else if (ext === 'xhtml' || ext === 'html' || ext === 'hltm') {
		type = 'doc';
	}
	return type;
};

var supportEncode = ['UTF-8', 'GBK', 'GB2312', 'UTF8'];
var supportBetuifyType = {
	js: ['javascript', 'js', 'es6', 'jsx', 'json', 'jsonp'],
	css: ['css', 'less', 'scass'],
	html: ['html', 'htm', 'ejs']
};
/**
 * 按照指定格式美化代码 js-betuify
 */
var betuifyCode = exports.betuifyCode = function betuifyCode(code, ext) {
	var some = function some(current) {
		return ext === current;
	};
	var is = '';
	for (var type in supportBetuifyType) {
		if (supportBetuifyType[type].some(some)) {
			is = type;
			break;
		}
	}
	if (is === 'js') {
		return (0, _jsBeautify2.default)(code);
	} else if (is === 'css') {
		return _jsBeautify2.default.css(code);
	} else if (is === 'html') {
		return _jsBeautify2.default.html(code);
	} else {
		return code;
	}
};

var updateExt = exports.updateExt = function updateExt(ext, contentType) {
	var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

	if (isJSONStr.test(data)) {
		return 'json';
	} else if (isJSONP.test(data)) {
		return 'jsonp';
	} else if (isXml.test(data)) {
		return 'xml';
	}
	return ext;
};
/**
 * 按照指定编码解码文件
 *
 */
var decodeData = exports.decodeData = function decodeData(data) {
	var charset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';

	return new _promise2.default(function (resolve, reject) {
		var is = supportEncode.some(function (cur) {
			return charset.toUpperCase() === cur;
		});
		if (!is) {
			reject('不支持当前的编码方式：' + charset);
		}
		try {
			resolve(_iconvLite2.default.decode(data, charset));
		} catch (e) {
			reject('解码数据出错');
		}
	});
};