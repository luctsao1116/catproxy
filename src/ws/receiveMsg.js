import * as status from './status';
import log from '../log';
import * as config from '../config/config';
import * as rule from '../config/rule';
import * as sendType from './sendType';
import url from 'url';
import http from 'http';
import https from 'https';
import Promise from 'promise';
import {Buffer} from 'buffer';
/*
 * 
 *  所有接受到得消息是一个Object
 * 
 * data:{
 * 	path: "数据访问路径，相同type下的不同逻辑处理可以用不同的path",
 * 	param: "相同type下相同的path，不同的参数可以通过这个处理"
 * }
 * 
 *
 * 所有发出的消息是一个Object
 * 
 * data:{
 * 	//当前请求的状态，如果不是100表示出现错误了
 * 	status: 100,
 * 	result: {'当前返回的数据'}
 * }
 * 
 */
export let error = (msg) => {
	msg = msg || "出现系统异常，请稍后再试";
	let data = {
		status: status.ERROR,
		result: msg
	};
	log.error(msg);
	return data;
};

export let success = (msg) => {
	msg = msg || "成功";
	let data = {
		status: status.SUCC,
		result: msg
	};
	return data;
};

/**
 * 请求数据，返回所有的数据
 * @return {[object]} [请求到得 config数据]
 */
export let fetchConfig = ()=> {
	let data = {
		status: status.SUCC
	};
	try {
		data.result = config.get();
		if (!data.result.hosts) {
			data.result.hosts = [];
		}
		return data;
	} catch(e) {
		return error();
	}
};

let updateRule = (rules, ws) => {
	try {
		rule.saveRules(rules);
		// ws.broadcast.emit(sendType.updateRule, {
		// 	status: status.SUCC,
		// 	result: {
		// 		hosts: rules
		// 	}
		// });
		return success('更新规则成功');
	} catch(e) {
		log.error(e);
		return error('更新规则失败');
	}
};
let disCache = (status, ws) => {
	try {
		config.set('disCache', status);
		config.save('disCache');
		return success('更新配置成功');
	} catch(e) {
		log.error(e);
		return error('更新配置失败');
	}
};

export let saveConfig = (msg = {}, ws = {}) => {
	let {path, param} = msg;
	if (path) {
		switch(msg.path) {
		case("rule"):
			if (param && param.rules) {
				return updateRule(param.rules, ws);
			} else {
				return error('更新规则必须有rules属性');
			}
		case('disCache'):
			return disCache(!!param.status, ws);
		default:
			return error('未知的保存数据');
		}
	} else {
		return error('未知的保存数据');
	}
};

// 通过远程地址更新文档
export let remoteUpdateRule = (msg = {}, ws = {}) => {
	let {url: visUrl} = msg.param;
	return new Promise((resolve, reject) => {
		config.set('remoteRuleUrl', visUrl);
		visUrl = url.parse(visUrl);
		let req = (visUrl.protocol === 'http:' ? http : https)
		.request({
			hostname: visUrl.hostname,
			port: visUrl.port ? visUrl.port : (visUrl.protocol === 'http:' ? 80 : 443),
			path: visUrl.path,
			method: 'GET',
			headers: {}
		}, (res) => {
			if (+res.statusCode !== 200) {
				return reject(error('服务器获取数据错误'));
			}
			res.setEncoding('utf8');
			let data = [];
			
			res.on('data', (chunk) => {
				data.push(chunk);
			});
			res.on('end', () => {
				let isBuffer = Buffer.isBuffer(data[0]);
				let result = isBuffer ? Buffer.concat(data) : data.join('');
				try {
					result = JSON.parse(result);
					config.set("hosts", result);
					config.save(["hosts", "remoteRuleUrl"]);
					return resolve(success({
						data: result,
						msg: "更新数据成功"
					}));
				} catch(e) {
					log.error(e.message);
					return reject(error('数据格式错误'));
				}
			});
		});
		req.on('error', (e) => {
			log.error(e.message);
			reject(error(e.message));
		});
		req.end();
	});
};
