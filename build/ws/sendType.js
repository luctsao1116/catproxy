'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// 注意这里有个 巧妙的地方，服务器的发送类型是 客户端的接受类型
// 获取监控类型
var addMonitorData = exports.addMonitorData = 'add-monitor-data';

// 获取更新监控数据
var updateMonitorData = exports.updateMonitorData = 'update-monitor-data';
// 获取详情
var getConDetail = exports.getConDetail = 'get_con_detail';