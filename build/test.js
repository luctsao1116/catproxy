'use strict';

// 通过net创建一个服务器并对连接着发送一个消息
var net = require('net');
var server = net.createServer(function (out) {
	out.write('HTTP/1.0 200 OK\r\n');
	out.write('Date: Fri, 31 Dec 1999 23:59:59 GMT\r\n');
	out.write('Server: Apache/0.8.4\r\n');
	out.write('Content-Type: text/html\r\n');
	out.write('Content-Length: 59\r\n');
	out.write('Expires: Sat, 01 Jan 2000 00:59:59 GMT\r\n');
	out.write('Last-modified: Fri, 09 Aug 1996 14:21:40 GMT\r\n');
	out.write('\r\n');
	out.write('<TITLE>Exemple</TITLE>');
	out.write("<P>Ceci est une page d'exemple.</P>");
	out.write('\r\n');
	out.end();
});

server.on('error', function (err) {
	throw err;
});

server.listen(8080, function () {
	console.log('server bound');
});