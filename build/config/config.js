'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.save = exports.setSaveProp = exports.setRecursive = exports.del = exports.set = exports.get = exports.getPath = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.default = function () {
	isInit = true;
	_log2.default.info('配置文件加载中, 加载路径: ' + getPath());
	data = loadingData();
	// 浅拷贝数据
	oldData = (0, _clone2.default)(data);
	_log2.default.info('配置文件加载成功');
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _checkConfig = require('./checkConfig');

var _checkConfig2 = _interopRequireDefault(_checkConfig);

var _isEqual = require('is-equal');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 数据对象直接require后直接返回一个对象，init方法只能调用一次，一个进程公用一个config
var data = {};
var oldData = null;
var saveProps = null;
var isInit = false;
// 获取配置路径
var getPath = exports.getPath = function getPath() {
	var dirPath = void 0,
	    filePath = void 0;
	// The expected result is:
	// OS X - '/Users/user/Library/Preferences'
	// Windows 8 - 'C:\Users\User\AppData\Roaming'
	// Windows XP - 'C:\Documents and Settings\User\Application Data'
	// Linux - '/var/local'
	// 获取系统临时目录
	var tmpPath = process.env.APPDATA;
	if (!tmpPath || tmpPath === 'undefined') {
		tmpPath = process.platform === 'darwin' ? _path2.default.join(process.env.HOME, 'Library/Preferences') : '/var/local';
	}
	dirPath = _path2.default.resolve(tmpPath, 'catproxy');
	var exits = _fs2.default.existsSync(dirPath);
	// 目录不存在
	if (!exits) {
		_fs2.default.mkdirSync(dirPath);
	}
	// 临时文件存放位置
	filePath = _path2.default.resolve(dirPath, 'rule.json');
	return filePath;
};

var loadingData = function loadingData() {
	var filePath = getPath();
	var currentData = {};
	// 判断是否存在临时文件
	var exits = _fs2.default.existsSync(filePath);
	if (exits) {
		var bufData = _fs2.default.readFileSync(filePath, 'utf-8');
		try {
			currentData = JSON.parse(bufData);
		} catch (e) {
			_log2.default.error(e);
			currentData = {};
		}
	}
	return currentData;
};

// 获取一个值
var get = exports.get = function get(key) {
	if (!isInit) {
		throw new Error('请先初始化配置');
	}
	var tmp = data;
	if (!key) {
		return data;
	} else {
		key = key.split(':');
		for (var i = 0; i < key.length; i++) {
			if (tmp[key[i]] !== undefined) {
				tmp = tmp[key[i]];
			} else {
				return null;
			}
		}
		return tmp;
	}
};

// 设置一个直接
var set = exports.set = function set(key, val, isRecursive) {
	if (!isInit) {
		throw new Error('请先初始化配置');
	}
	if (!key) {
		return false;
	}
	var current = void 0;
	var type = typeof key === 'undefined' ? 'undefined' : (0, _typeof3.default)(key);
	if (type === 'string') {
		current = (0, _defineProperty3.default)({}, key, val);
	} else if (type === 'object') {
		current = key;
	}
	if (current) {
		current = (0, _checkConfig2.default)(current);
		if (isRecursive) {
			data = _merge2.default.recursive(data, current);
		} else {
			data = (0, _merge2.default)(data, current);
		}
		return true;
	}
};
var del = exports.del = function del(key) {
	if (!isInit) {
		throw new Error('请先初始化配置');
	}
	// 不传递key删除所有
	if (!key) {
		data = {};
	}
	// key 必须是字符串
	if (typeof key !== 'string') {
		return;
	}
	var tmp = data,
	    keys;
	keys = key.split(':');
	key = keys[keys.length - 1];
	if (keys.length > 1) {
		for (var i = 0; i < keys.length - 1; i++) {
			if ((typeof tmp === 'undefined' ? 'undefined' : (0, _typeof3.default)(tmp)) === 'object') {
				if (tmp[keys[i]]) {
					tmp = tmp[keys[i]];
				} else {
					tmp = null;
					return false;
				}
			} else {
				tmp = null;
				return false;
			}
		}
	}
	if (tmp) {
		delete tmp[key];
		return true;
	}
};

var setRecursive = exports.setRecursive = function setRecursive(key, val) {
	set(key, val, true);
};

var setSaveProp = exports.setSaveProp = function setSaveProp() {
	for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
		keys[_key] = arguments[_key];
	}

	saveProps = keys;
};

// 保存到文件
/**
 * key  如果传递，则只更新对应key的数据到文件中，否则全部更新
 * key 可以是数组或者字符串只可以更新顶级的字段，字段下面的字段不行
 */
var save = exports.save = function save(key) {
	if (!isInit) {
		throw new Error('请先初始化配置');
	}
	key = key || saveProps;
	var saveData;
	if (!key) {
		// 全部覆盖
		saveData = (0, _clone2.default)(data);
	} else {
		saveData = (0, _clone2.default)(oldData);
		if (typeof key === 'string') {
			key = [key];
		}
		// 全部转换成数组处理
		if (Object.prototype.toString.call(key) === '[object Array]') {
			key.forEach(function (cur) {
				if (data[cur] !== undefined) {
					saveData[cur] = (0, _clone2.default)(data[cur]);
				}
			});
		}
	}
	// 如果数据完全一样，不调用
	if ((0, _isEqual2.default)(saveData, oldData)) {
		return;
	}
	var myData = JSON.stringify(saveData);
	var filePath = getPath();
	_log2.default.debug('保存规则文件路径:' + filePath);
	try {
		var fd = _fs2.default.openSync(filePath, 'w+', '777');
		_fs2.default.writeSync(fd, myData, null, 'utf-8');
		_fs2.default.closeSync(fd);
		oldData = saveData;
	} catch (e) {
		throw e;
	}
};