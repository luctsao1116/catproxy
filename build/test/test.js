'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getLocalIps = require('../getLocalIps');

var _getLocalIps2 = _interopRequireDefault(_getLocalIps);

var _dns = require('dns');

var _dns2 = _interopRequireDefault(_dns);

var _changeHost = require('../changeHost');

var _changeHost2 = _interopRequireDefault(_changeHost);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// console.log(getLocalIps()); // my ip address
// dns.lookup("p1111img1.126.net", (err, address) => {
// 	if (!err) {
// 		console.log("jjjj", address);
// 	} else {
// 		console.log(err, dns.NOTFOUND);
// 	}
// });

// dns.resolve("pimg1.126.net", function(err, addresses){
// 	console.log(addresses);
// });
//
//
// changeHost("pimg1.126.net", true)

// .then(address => {
// 	console.log(address);
// }, (err) => {
// 	console.log(err);
// });

// var a = '<meta charset="gb2312">';
// var b = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
// var checkMetaCharset = /<meta(?:\s)+.*charset(?:\s)*=(?:[\s'"])*([^"']+)/;
// console.log(b.match(checkMetaCharset));
// console.log(a.match(checkMetaCharset));

// var server;
// var localIps = [];
// let getScriptStr = function() {
// 	console.log(server);
// 	let a = server.port;
// 	let port = (server || {}).___port || "";
// 	let ip = localIps[0] || "";
// 	return `<head><script src="http://${ip}:${port}/target/target-script-min.js#anonymous"></script>`;
// };
// /**
//  * 插入weinre代码
//  */
// export let insertWeinreScript = async function(data = "") {
// 	let strData = data.toString();
// 	if (true) {
// 		getScriptStr();
// 		return data;
// 	}
// 	return data;
// };

// insertWeinreScript("<head>")
// .then(null, function(err) {
// 	console.log(err);
// });
var index = 0;
var time = function time() {
	return new Promise(function (resolve, reject) {
		setTimeout(function () {
			console.log(index);
			resolve(index);
			index++;
		}, 300);
	});
};

var a = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
		var i, result;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						i = 0;

					case 1:
						if (!(i < 5)) {
							_context.next = 9;
							break;
						}

						_context.next = 4;
						return time();

					case 4:
						result = _context.sent;

						console.log(result);

					case 6:
						i++;
						_context.next = 1;
						break;

					case 9:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function a() {
		return _ref.apply(this, arguments);
	};
}();
a();