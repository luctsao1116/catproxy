'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// 注意这里有个 巧妙的地方，服务器的发送类型是 客户端的接受类型
// 获取数据配置
var fetchConfig = exports.fetchConfig = 'fetch_config';
// 出错的处理
var saveConfig = exports.saveConfig = 'save_config';
// 远程上传
var remoteUpdateRule = exports.remoteUpdateRule = 'remote_update_rule';
// 获取详情
var getConDetail = exports.getConDetail = 'get_con_detail';