'use strict';
import http from 'http';
import https from 'https';
import defCfg from './config/defCfg';
import configInit, * as config from './config/config';
import merge from 'merge';
import Promise from 'promise';
import log from './log';
import {requestHandler, requestConnectHandler, requestUpgradeHandler} from './requestSerives';
import EventEmitter from 'events';
import {getCert, getCertDir} from './cert/cert.js';
import {SNICallback} from './httpsProxySer';
import ui from './web/app';
import {localIps} from './getLocalIps';
import {error as errFun} from './tools';
import * as requestMiddleware from './requestMiddleware';
import configProps from './config/configProps';
import util from 'util';

//	process.env.NODE_ENV

class CatProxy extends EventEmitter{
	/**
	 * 
	 * @param  {[type]} option 
	 *  {
	 *  	type: "当前服务器类型"
	 *		port: "当前http端口",
	 *    httpsPort: "当前https服务器端口",
	 *		certHost: "https证书生成默认host代理",
	 *		crackHttps 是否解开 https请求，在 http代理模式下,
	 *		log: '日志级别',
	 *		uiPort 端口
	 *	}
	 *	@param servers 自定义服务器,最多同时开启2个服务器，一个http一个https, 2个服务器的时候顺序是http,https  	如果只有一个则没有顺序问题
	 *
	 *  @param saveProps 要同步到文件的字段 为空则全部同步
	 *
	 */
	constructor(opt, saveProps) {
		super();
		this.option = {};
		// 初始化配置文件
		configInit();
		let certDir = getCertDir();
		log.info(`当前证书目录： ${certDir}`);
		// 读取缓存配置文件
		let fileCfg = {};
		configProps
		.forEach(current => {
			let val = config.get(current);
			if ( val !== undefined && val !== null) {
				fileCfg[current] = val;
			}
		});
		if (saveProps === false) {
			saveProps = ['hosts', "log", 'breakHttps', 'excludeHttps'];
		}
		// 混合三种配置
		let cfg = merge({}, defCfg, fileCfg, opt);
		if (saveProps && saveProps.length) {
			this.option.saveProps = saveProps;
		}
		// 将用户当前设置保存到缓存配置文件
		configProps
		.forEach(current => {
			if (cfg[current] !== null && cfg[current] !== undefined) {
				// 为‘’表示要删除这个字段
				if (cfg[current] === '' && config.get(current)) {
					config.del(current);
				} else {
					config.set(current, cfg[current]);
				}
			}
		});
		if (saveProps && saveProps.length) {
			config.save(saveProps); 
		} else {
			config.save();
		}
		this._beforeReqEvt = [];
		this._beforeResEvt = [];
		this._afterResEvt = [];
		this._pipeRequestEvt = [];
	}
	init() {
		// 别的进程发送的消息
		process.on('message', function(message) {
			if (message.type) {
				switch(message.type) {
				case "config":
					config.set(message.result || {});
					break;
				}
			}
			log.error('收到未知的消息', message);
		});
		this.setLogLevel();
		// dangerous options
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
		// // 请求前
		// this.beforeReq = beforeReq.bind(this); 
		// // 请求后
		// this.afterRes = afterRes.bind(this);
		// // 请求前 
		// this.beforeRes = beforeRes.bind(this); 
		return Promise.resolve()
		.then(this.createCache.bind(this))
		.then(this.checkParam.bind(this))
		.then(this.checkEnv.bind(this))
		.then(this.createServer.bind(this))
		.then(this.uiInit.bind(this))
		.then(null, this.errorHandle.bind(this));
	}
	// 创建缓存，创建请求保存
	createCache() {
	}
	checkParam() {
	}
	setLogLevel(logLevel) {
		log.transports.console.level = config.get('log');
	}
	// 环境检测
	checkEnv() {
	}
	uiInit() {
		let port = config.get('uiPort');
		if (+port === 0) {
			return;
		}
		ui({
			port : port,
			hostname: localIps[0],
			host: `http://${localIps[0]}:${port}`,
			isAutoOpen: config.get('autoOpen')
		});
	}
	// 出错处理
	errorHandle(err) {
		if (err) {
			log.error(err);
		}
		return Promise.reject(err);
	}
	// 根据配置创建服务器
	createServer() {
		let opt = config.get();
		let servers = this.servers || [];
		let com = this;
		// 可以自定义server或者用系统内置的server
		if (opt.type === 'http' && !servers[0]) {
			servers[0] = http.createServer();
		} else if (opt.type === 'https' && !servers[0]){
			// 找到证书，创建https的服务器
			let {privateKey: key, cert} = getCert(opt.certHost);
			servers[0] = https.createServer({key,cert, rejectUnauthorized: false, SNICallback});
		} else if (opt.type === 'all' && !servers[0]  && !servers[1]) {
			servers[0] = http.createServer();
			let {privateKey: key, cert} = getCert(opt.certHost);
			servers[1] = https.createServer({key,cert, rejectUnauthorized: false, SNICallback});
		}
		let requestFun = requestMiddleware.middleWare(requestHandler);
		servers.forEach(server => {
			server.catProxy = com;
			// 如果在http下代理https，则需要过度下请求
			if (server instanceof  http.Server) {
				server.on('connect', requestConnectHandler);
			}
			server.on('upgrade', requestUpgradeHandler);
			server.on('request', function(req, res) {
				if (req.headers.upgrade) {
					return;
				}
				requestFun.call(this, req, res);
			});
			let serverType = server instanceof  http.Server ? 'http' : 'https';
			let port = serverType === 'http' ? opt.port : opt.httpsPort;
			// 如果server没有被监听，则调用默认端口监听
			if (!server.listening) {
				// 根据server的类型调用不同的端口
				server.listen(port, function () {
					log.info('代理服务器启动于：' + `${serverType}://${localIps[0]}:${port}`);
				});
			}
			server.on('error', function(err) {
				errFun(err);
				process.exit(1);
			});
		});
		this.servers = servers;
	}
	// 想服务器添加request事件
	use (fun) {
		requestMiddleware.use(fun);
		return this;
	}
	// 在中转请求前，可以用于修改reqInfo
	onBeforeReq(...fun) {
		fun.forEach(f => util.isFunction(f) && this._beforeReqEvt.push(f));
	}
	// 请求结束，可以用于产看请求结果
	onAfterRes(...fun) {
		fun.forEach(f => util.isFunction(f) && this._afterResEvt.push(f));
	}
	// 获得中转请求前，可以用于修改resInfo
	onBeforeRes(...fun) {
		fun.forEach(f => util.isFunction(f) && this._beforeResEvt.push(f));
	}
	onPipeRequest(...fun) {
		fun.forEach(f => util.isFunction(f) && this._pipeRequestEvt.push(f));
	}
}

process.on('uncaughtException', errFun);
process.on('exit', ()=> log.info('服务器退出'));
export default CatProxy;
export {CatProxy};
