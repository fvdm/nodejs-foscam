/*
Name:           foscam
Description:    Remote control a Foscam/Tenvis IP camera
Framework:      node.js
Author:         Franklin van de Meent (https://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-foscam
Feedback:       https://github.com/fvdm/nodejs-foscam/issues
License:        Unlicense (public domain) - see LICENSE file
*/

var httpreq = require ('httpreq');
var fs = require ('fs');

// defaults
var config = {
  endpoint: 'http://192.168.1.239:81',
  username: 'admin',
  password: '',
  timeout: 5000
};


/**
 * Process httpreq response for callback
 *
 * @callback callback
 * @param err {Error, null} - httpreq error
 * @param res {object} - httpreq response details
 * @param callback {function} - `function (err, data) (}`
 * @returns {void}
 */

function httpResponse (err, res, callback) {
  var data = res && res.body || '';
  var error = null;

  if (err) {
    error = new Error ('request failed');
    error.error = err;

    callback (error);
    return;
  }

  data = data.trim ();

  if (res.statusCode >= 300) {
    error = new Error ('api error');
    error.code = res.statusCode;
    error.error = data;

    callback (error);
    return;
  }

  if (data === 'ok.') {
    data = {
      success: true
    };
  }

  callback (null, data);
}


/**
 * Send HTTP request
 *
 * @callback callback
 * @param [props.method = GET] {string} - GET, POST, etc
 * @param props.path {string} - Path after `endpoint`
 * @param [props.params] {object} - GET or POST parameters
 * @param [props.timeout = config.timeout] {number} - Wait timeout in ms
 * @param [props.endpoint = config.endpoint] {string} - Override API endpoint
 * @params callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function httpRequest (props, callback) {
  var options = {
    url: (props.endpoint || config.endpoint) + props.path,
    method: props.method || 'GET',
    parameters: props.params || null,
    binary: props.binary || null,
    timeout: props.timeout || config.timeout,
    auth: config.username + ':' + config.password
  };

  function processResponse (err, res) {
    httpResponse (err, res, callback);
  }

  httpreq.doRequest (options, processResponse);
}


/**
 * Parse parameters from camera response
 *
 * @param data {string} - Text response from camera
 * @returns {object} - Parsed parameters
 */

function parseParams (data) {
  var result = {};

  data = data.replace (/^var ([^=]+)=([^;]*);/gm, function (str, key, val) {
    result [key] = val.replace (/^((\d+)|'([^']*)')$/, function (str2, match, number, string) {
      if (number) {
        return parseInt (number, 10);
      }

      return string;
    });
  });

  return result;
}


/**
 * Get camera status
 *
 * @callback callback
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function systemStatus (callback) {
  function doCallback (err, data) {
    var result = {};

    var alarmStates = [
      'No alarm',
      'Motion alarm',
      'Input alarm'
    ];

    var ddnsStates = [
      'No action',
      'Connecting...',
      'Cannot connect to the server',
      'Dyndns succeed',
      'DynDns failed: Dyndns.org server error',
      'DynDns failed: Incorrect user or password',
      'DynDns failed: Need credited user',
      'DynDns failed: Illegal host format',
      'DynDns failed: Host does not exist',
      'DynDns failed: Host does not belong to you',
      'DynDns failed: Too many or too few hosts',
      'DynDns failed: Host is blocked for abusing',
      'DynDns failed: Bad Reply from Server',
      'DynDns failed: Bad Reply from Server',
      'Oray failed: Bad reply from server',
      'Oray failed: Incorrect user or password',
      'Oray failed: Incorrect hostname',
      'Oray succeed',
      'Reserved',
      'Reserved',
      'Reserved',
      'Reserved'
    ];

    var upnpStates = [
      'No action',
      'Succeed',
      'Device system error',
      'Errors in network communication',
      'Errors in chat with UPnP device',
      'Rejected by UPnP device, maybe port conflict'
    ];

    if (err) {
      callback (err);
      return;
    }

    result = parseParams (data);
    result.alarm_status = parseInt (result.alarm_status, 10);
    result.alarm_status_str = alarmStates [result.alarm_status] || '';
    result.ddns_status = parseInt (result.ddns_status, 10);
    result.ddns_status_str = ddnsStates [result.ddns_status] || '';
    result.upnp_status = parseInt (result.upnp_status, 10);
    result.upnp_status_str = upnpStates [result.upnp_status] || '';

    callback (null, result);
  }

  httpRequest ({ path: '/get_status.cgi' }, doCallback);
}

// pan/tilt
function controlPTZ (cmd, callback) {
  var commands = {
    'stop': 1,
    'up': 0,
    'stop up': 1,
    'down': 2,
    'stop down': 3,
    'left': 4,
    'stop left': 5,
    'right': 6,
    'stop right': 7,
    'repeat horizontal patrol': 20,
    'stop repeat horizontal patrol': 21,
    'center': 25,
    'vertical patrol': 26,
    'stop vertical patrol': 27,
    'horizontal patrol': 28,
    'stop horizontal patrol': 29,
    'left up': 90,
    'right up': 91,
    'left down': 92,
    'right down': 93,
    'io output high': 94,
    'io output low': 95
  };

  var options = {
    path: '/decoder_control.cgi',
    params: {
      command: commands [cmd] || cmd
    }
  };

  if (!callback) {
    callback = function () {};
  }

  httpRequest (options, callback);
}


// Presets
function preset2cmd (action, presetId) {
  var cmds = {
    set: [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
    go: [31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61]
  };

  return cmds [action] [presetId - 1];
}

function controlStorePreset (id, callback) {
  controlPTZ (preset2cmd ('set', id), callback);
}

function controlGotoPreset (id, callback) {
  controlPTZ (preset2cmd ('go', id), callback);
}


// alias
function configAlias (alias, callback) {
  var options = {
    path: '/set_alias.cgi',
    params: {
      alias: alias
    }
  };

  httpRequest (options, callback);
}

// datetime
function configDatetime (params, callback) {
  var options = {
    path: '/set_datetime.cgi',
    params: params
  };

  httpRequest (options, callback);
}

// restore factory
function configFactoryRestore (callback) {
  httpRequest ({ path: '/restore_factory.cgi' }, callback);
}


// camera settings
function configVideo (param, value, callback) {
  var params = {
    resolution: 0,
    brightness: 1,
    contrast: 2,
    mode: 3,
    flipmirror: 5
  };

  var values = {
    '240p': 8,
    '480p': 32,
    '50hz': 0,
    '60hz': 1,
    'outdoor': 2,
    'default': 0,
    'flip': 1,
    'mirror': 2,
    'flipmirror': 3
  };

  var options = {
    path: '/camera_control.cgi',
    params: {
      param: params [param] || param,
      value: values [value] || value
    }
  };

  // Only get config
  if (typeof param === 'function') {
    options.path = '/get_params.cgi';
    options.params = null;
    httpRequest (options, callback);
    return;
  }

  // Change config
  httpRequest (options, callback);
}


// reboot
function systemReboot (callback) {
  httpRequest ({ path: '/reboot.cgi' }, callback);
}


// snapshot
function controlSnapshot (filepath, callback) {
  var options = {
    path: '/snapshot.cgi',
    binary: true
  };

  if (typeof filepath === 'function') {
    callback = filepath;
    filepath = null;
  }

  httpRequest (options, function processSnapshot (err, data) {
    if (err) {
      callback (err);
      return;
    }

    if (filepath) {
      fs.writeFile (filepath, data, 'binary', function (writeErr) {
        if (writeErr) {
          callback (writeErr);
          return;
        }

        callback (null, filepath);
      });

      return;
    }

    callback (null, data);
  });
}


/**
 * Module interface & config
 *
 * @param [set] {object} - Configuration params
 * @param [set.endpoint = http://192.168.1.239:81] {string} - URL to camera web UI
 * @param [set.timeout = 5000] {number} - Request timeout in ms
 * @param [set.username = admin] {string} - Camera username
 * @param [set.password] {string} - Camera password
 * @returns {object} - Interface methods
 */

function setup (set) {
  config.endpoint = set.endpoint || config.endpoint;
  config.username = set.username || config.username;
  config.password = set.password || config.password;
  config.timeout = set.timeout || config.timeout;

  return {
    config: {
      alias: configAlias,
      datetime: configDatetime,
      factoryRestore: configFactoryRestore,
      video: configVideo
    },
    control: {
      gotoPreset: controlGotoPreset,
      storePreset: controlStorePreset,
      snapshot: controlSnapshot,
      ptz: controlPTZ
    },
    system: {
      reboot: systemReboot,
      status: systemStatus
    }
  };
}

module.exports = setup;
