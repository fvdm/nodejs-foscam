var dotest = require ('dotest');
var app = require ('./');
var cache = {};

var config = {
  endpoint: process.env.foscamEndpoint || null,
  username: process.env.foscamUsername || null,
  password: process.env.foscamPassword || null,
  timeout: process.env.foscamTimeout || null
};

var foscam = app (config);


dotest.add ('Module', function (test) {
  var tconfig = foscam && foscam.config;
  var tcontrol = foscam && foscam.control;
  var tsystem = foscam && foscam.system;

  test ()
    .isFunction ('fail', 'exports', app)
    .isObject ('fail', 'interface', foscam)
    .isObject ('fail', '.config', tconfig)
    .isFunction ('fail', '.config.alias', tconfig && tconfig.alias)
    .isFunction ('fail', '.config.datetime', tconfig && tconfig.datetime)
    .isFunction ('fail', '.config.factoryRestore', tconfig && tconfig.factoryRestore)
    .isFunction ('fail', '.config.video', tconfig && tconfig.video)
    .isObject ('fail', '.control', tcontrol)
    .isFunction ('fail', '.control.gotoPreset', tcontrol && tcontrol.gotoPreset)
    .isFunction ('fail', '.control.storePreset', tcontrol && tcontrol.storePreset)
    .isFunction ('fail', '.control.snapshot', tcontrol && tcontrol.snapshot)
    .isFunction ('fail', '.control.ptz', tcontrol && tcontrol.ptz)
    .isObject ('fail', '.system', tsystem)
    .isFunction ('fail', '.system.reboot', tsystem && tsystem.reboot)
    .isFunction ('fail', '.system.status', tsystem && tsystem.status)
    .done ();
});


dotest.add ('Method .system.status', function (test) {
  foscam.system.status (function t (err, data) {
    cache.alias = data && data.alias || null;

    test (err)
      .isObject ('fail', 'data', data)
      .isString ('fail', 'data.id', data && data.id)
      .isNumber ('fail', 'data.alarm_status', data && data.alarm_status)
      .isString ('fail', 'data.alarm_status_str', data && data.alarm_status_str)
      .isNotEmpty ('fail', 'data.alarm_status_str', data && data.alarm_status_str)
      .isNumber ('fail', 'data.ddns_status', data && data.ddns_status)
      .isString ('fail', 'data.ddns_status_str', data && data.ddns_status_str)
      .isNotEmpty ('fail', 'data.alarm_status_str', data && data.alarm_status_str)
      .isNumber ('fail', 'data.upnp_status', data && data.upnp_status)
      .isString ('fail', 'data.upnp_status_str', data && data.upnp_status_str)
      .isNotEmpty ('fail', 'data.alarm_status_str', data && data.alarm_status_str)
      .done ();
  });
});


dotest.add ('Method .config.alias', function (test) {
  foscam.config.alias (cache.alias, function (err, data) {
    test (err)
      .isObject ('fail', 'data', data)
      .isExactly ('fail', 'data.success', data && data.success, true)
      .done ();
  });
});


dotest.run ();
