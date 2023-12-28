'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// 整个配置文件可以保存的字段
var configProps = ['type', 'port', 'httpsPort', 'uiPort', 'log', 'breakHttps', 'excludeHttps', 'autoOpen', 'sni', 'hosts', 'disCache', 'remoteRuleUrl', 'monitor', 'weinrePort', 'cacheFlush'];
exports.default = configProps;
var monitorType = exports.monitorType = ['all', 'doc', 'xhr', 'js', 'css', 'img', 'media', 'font', 'ws', 'mainifest', 'other'];