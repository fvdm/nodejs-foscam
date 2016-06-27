var dotest = require ('dotest');
var app = require ('./');

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

dotest.run ();
