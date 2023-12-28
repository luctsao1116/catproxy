'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getCacheFile = exports.cacheFile = exports.fileCache = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  放到临时目录中
var fileCache = exports.fileCache = _path2.default.join(_os2.default.tmpdir(), './catproxy.cache.fileCache');
// 数据库缓存大小
// 确定db目录存在
_fsExtra2.default.ensureDirSync(fileCache);
// 清空db目录
_fsExtra2.default.emptyDirSync(fileCache);

/**
 * 检测文件是否存在
 */
var checkFileExits = function checkFileExits(filePath) {
	return new _promise2.default(function (resolve, reject) {
		_fs2.default.stat(filePath, function (err, exits) {
			if (err) {
				if (err.code === 'ENOENT') {
					// 文件不存在
					return resolve(false);
				} else {
					// 其他错误
					reject(err);
				}
			} else {
				// 文件存在
				resolve(true);
			}
		});
	});
};
var saveFile = function saveFile(filePath, data) {
	return new _promise2.default(function (resolve, reject) {
		_fs2.default.writeFile(filePath, data, function (err) {
			if (err) {
				return reject(err);
			}
			return resolve(filePath);
		});
	});
};
/**
 * 缓存文件
 * id 文件名称
 */
var cacheFile = exports.cacheFile = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(id, data) {
		var filePath, status;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						filePath = _path2.default.resolve(fileCache, id);
						_context.next = 3;
						return checkFileExits(filePath);

					case 3:
						status = _context.sent;

						if (!status) {
							_context.next = 8;
							break;
						}

						return _context.abrupt('return', filePath);

					case 8:
						_context.next = 10;
						return saveFile(filePath, data);

					case 10:
						return _context.abrupt('return', _context.sent);

					case 11:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function cacheFile(_x, _x2) {
		return _ref.apply(this, arguments);
	};
}();
/**
 * id 文件名称
 * encode指定编码打开文件
 */
var getCacheFile = exports.getCacheFile = function getCacheFile(id) {
	return new _promise2.default(function (resolve, reject) {
		var filePath = _path2.default.resolve(fileCache, id);
		_fs2.default.readFile(filePath, function (err, data) {
			if (err) {
				reject(err.message);
			}
			resolve(data);
		});
	});
};

process.on('beforeExit', function () {
	_fsExtra2.default.removeSync(fileCache);
});