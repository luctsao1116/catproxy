'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createSelfCert = exports.createRootCert = undefined;

var _nodeForge = require('node-forge');

var _nodeForge2 = _interopRequireDefault(_nodeForge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var attrs = [{
	name: 'countryName',
	value: 'CN'
}, {
	shortName: 'ST',
	value: 'CP'
}, {
	name: 'localityName',
	value: 'BJ'
}, {
	name: 'organizationName',
	value: 'catproxy'
}, {
	shortName: 'OU',
	value: 'CP'
}];
var rootAttrs = attrs.slice(0);
rootAttrs.push({
	name: 'commonName',
	value: 'catproxy'
});

var createKeyandCert = function createKeyandCert() {
	// generate a keypair and create an X.509v3 certificate
	var keys = _nodeForge.pki.rsa.generateKeyPair(2048);
	var cert = _nodeForge.pki.createCertificate();
	var today = new Date().getTime();
	var tenYearMin = 1 * 365 * 24 * 60 * 60 * 1000;
	cert.publicKey = keys.publicKey;
	cert.serialNumber = '' + new Date().getTime();
	cert.validity.notBefore = new Date(today - tenYearMin);
	cert.validity.notAfter = new Date(today + tenYearMin);
	return { cert: cert, keys: keys };
};

var createRootCert = function createRootCert() {
	var _createKeyandCert = createKeyandCert(),
	    cert = _createKeyandCert.cert,
	    keys = _createKeyandCert.keys;

	cert.setSubject(rootAttrs);
	// alternatively set subject from a csr
	// cert.setSubject(csr.subject.attributes);
	cert.setIssuer(rootAttrs);
	cert.setExtensions([{
		name: 'basicConstraints',
		cA: true
	}]);
	cert.sign(keys.privateKey, _nodeForge.md.sha256.create());
	// base64-encode p12
	var p12Asn1 = _nodeForge.pkcs12.toPkcs12Asn1(keys.privateKey, cert, '123456', {
		algorithm: '3des'
	});
	var p12Der = new Buffer(_nodeForge2.default.asn1.toDer(p12Asn1).toHex(), 'hex');
	return {
		cert: _nodeForge.pki.certificateToPem(cert),
		pfx: p12Der,
		privateKey: _nodeForge.pki.privateKeyToPem(keys.privateKey),
		publicKey: _nodeForge.pki.publicKeyToPem(keys.publicKey)
	};
};

var createSelfCert = function createSelfCert(domains, rootOpt) {
	if (!domains) {
		return {};
	}
	if (typeof domains === 'string') {
		domains = [domains];
	}
	var rootKey = _nodeForge.pki.privateKeyFromPem(rootOpt.privateKey);

	var _createKeyandCert2 = createKeyandCert(),
	    cert = _createKeyandCert2.cert,
	    keys = _createKeyandCert2.keys;
	// rootCert.subject.attributes


	cert.setIssuer(rootAttrs);

	// ,{
	// 		name: 'subjectAltName',
	// 		altNames: domains.map(function(host) {
	// 			if (host.match(/^[\d\.]+$/)) {
	// 				return {type: 7, ip: host};
	// 			}
	// 			return {type: 2, value: host};
	// 		})
	// 	}
	cert.setExtensions([
	// 某些电脑加这个 会爆出 证书乱码问题
	// {
	// 	name: 'basicConstraints',
	// 	cA: true
	// },
	{
		name: 'subjectAltName',
		altNames: domains.map(function (host) {
			if (host.match(/^[\d\.]+$/)) {
				return { type: 7, ip: host };
			}
			return { type: 2, value: host };
		})
	}]);

	cert.setSubject(attrs.concat([{
		name: 'commonName',
		value: domains[0]
	}]));
	// console.log(111111);
	// console.log(cert.getExtensions());
	cert.sign(rootKey, _nodeForge.md.sha256.create());
	return {
		cert: _nodeForge.pki.certificateToPem(cert),
		privateKey: _nodeForge.pki.privateKeyToPem(keys.privateKey),
		publicKey: _nodeForge.pki.publicKeyToPem(keys.publicKey)
	};
};

exports.createRootCert = createRootCert;
exports.createSelfCert = createSelfCert;