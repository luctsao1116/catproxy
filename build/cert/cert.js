'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getRootCert = exports.getCert = exports.emptyCertDir = exports.getRootCertPath = exports.getCertDir = exports.setCertDir = exports.setRootCert = exports.isRootCertExits = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _nodeForge = require('node-forge');

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _createCert = require('./createCert');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var certDir = process.env.APPDATA;
var heartReg = /\*/g;
if (!certDir || certDir === 'undefined') {
	certDir = process.platform === 'darwin' ? _path2.default.join(process.env.HOME, 'Library/Preferences') : '/var/local';
}
certDir = _path2.default.join(certDir, './.cert_center');

var rootKeyPath = _path2.default.resolve(certDir, './cert.key');
var rootCrtPath = _path2.default.resolve(certDir, './cert.crt');
var rootPfxPath = _path2.default.resolve(certDir, './cert.pfx');
var certCachePath = _path2.default.resolve(certDir, 'certCache');
var certCache = {};
// console.log(log);
// 是否纯在根证书
var isRootCertExits = function isRootCertExits() {
	return !!(_fs2.default.existsSync(certDir) && _fs2.default.existsSync(rootKeyPath) && _fs2.default.existsSync(rootCrtPath));
};

var setRootCert = function setRootCert() {
	_fsExtra2.default.ensureDirSync(certDir);
	// 清除已经有的证书
	_fsExtra2.default.emptyDirSync(certDir);
	_log2.default.info('根证书生成目录: ' + certDir);
	var result = (0, _createCert.createRootCert)();
	var privateKey = result.privateKey;
	var cert = result.cert;
	_fs2.default.writeFileSync(rootKeyPath, privateKey);
	_fs2.default.writeFileSync(rootCrtPath, cert);
	_fs2.default.writeFileSync(rootPfxPath, result.pfx);
	return {
		privateKey: privateKey,
		cert: cert
	};
};

// 不存在根证书就创建
var getRootCert = function getRootCert() {
	var privateKey, cert;
	// 存在缓存，直接调用
	if (certCache.root) {
		return certCache.root;
	}
	// 确保证书目录存在
	_fsExtra2.default.ensureDirSync(certDir);
	if (!isRootCertExits()) {
		return setRootCert();
	} else {
		privateKey = _fs2.default.readFileSync(rootKeyPath, { encoding: 'utf8' });
		cert = _fs2.default.readFileSync(rootCrtPath, { encoding: 'utf8' });
		certCache.root = { privateKey: privateKey, cert: cert };
	}
	return { privateKey: privateKey, cert: cert };
};

// 证书是否存在
var isCertExits = function isCertExits(keyPath, crtPath) {
	return _fs2.default.existsSync(keyPath) && _fs2.default.existsSync(crtPath);
};
// 获取证书
var getCert = function getCert(domain) {
	var result = {};
	if (!domain) {
		return result;
	}
	// 已经存在，则从缓存中获取
	if (certCache[domain]) {
		return certCache[domain];
	}
	// var mc = md.md5.create();
	// mc.update(domain);
	// var domainMd5 = mc.digest().toHex();
	var domainC = domain.replace(heartReg, '_');
	var keyPath = _path2.default.join(certCachePath, domainC + '.key');
	var certPath = _path2.default.join(certCachePath, domainC + '.crt');
	var cert, privateKey;
	if (isCertExits(keyPath, certPath)) {
		privateKey = _fs2.default.readFileSync(keyPath, { encoding: 'utf8' });
		cert = _fs2.default.readFileSync(certPath, { encoding: 'utf8' });
	} else {
		var _createSelfCert = (0, _createCert.createSelfCert)(domain, getRootCert());

		cert = _createSelfCert.cert;
		privateKey = _createSelfCert.privateKey;

		_fsExtra2.default.ensureDirSync(certCachePath);
		_fs2.default.writeFileSync(keyPath, privateKey);
		_fs2.default.writeFileSync(certPath, cert);
	}
	certCache[domain] = { cert: cert, privateKey: privateKey };
	return { cert: cert, privateKey: privateKey };
};

// 删除证书目录
var emptyCertDir = function emptyCertDir() {
	_fsExtra2.default.emptyDirSync(certDir);
};

var setCertDir = function setCertDir(path) {
	if (!path) {
		return;
	}
	_fsExtra2.default.ensureDirSync(path);
	certDir = path;
	rootKeyPath = path.resolve(certDir, './cert.key');
	rootCrtPath = path.resolve(certDir, './cert.crt');
	certCachePath = path.resolve(certDir, 'certCache');
};
var getCertDir = function getCertDir() {
	return certDir;
};
var getRootCertPath = function getRootCertPath() {
	return rootCrtPath;
};
// getCert('lmlc.com');
// emptyCertDir();
exports.isRootCertExits = isRootCertExits;
exports.setRootCert = setRootCert;
exports.setCertDir = setCertDir;
exports.getCertDir = getCertDir;
exports.getRootCertPath = getRootCertPath;
exports.emptyCertDir = emptyCertDir;
exports.getCert = getCert;
exports.getRootCert = getRootCert;