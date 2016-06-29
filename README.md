foscam
======

Node.js package to remote control, view and config a Foscam/Tenvis IP camera.

[![npm](https://img.shields.io/npm/v/foscam.svg?maxAge=3600)](https://github.com/fvdm/nodejs-foscam/blob/master/CHANGELOG.md)
[![Build Status](https://travis-ci.org/fvdm/nodejs-foscam.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-foscam)
[![Dependency Status](https://gemnasium.com/badges/github.com/fvdm/nodejs-foscam.svg)](https://gemnasium.com/github.com/fvdm/nodejs-foscam#runtime-dependencies)
[![Coverage Status](https://coveralls.io/repos/github/fvdm/nodejs-foscam/badge.svg?branch=master)](https://coveralls.io/github/fvdm/nodejs-foscam?branch=master)

All included methods are based on Foscam's (fragmented) API documentation
and the web interface of a Tenvis camera.
Some features may not be supported by non-pan/tilt, older cameras or old firmware.
So make sure you keep a backup of your camera settings, just in case.


Usage example
-------------

```js
// Configuration
var camera = require ('foscam') ({
  endpoint: 'http://192.168.1.123:8080',
  username: 'myname',
  password: 'mysecret'
});

// Horizontal patrol for 5 seconds
camera.control.ptz ('horizontal patrol', 5000, function (err) {
  if (err) {
    console.log (err);
    return;
  }

  // Take a picture and store it
  camera.control.snapshot ('/path/to/save.jpg', console.log);
});
```


Installation
------------

`npm install foscam`


Configuration
-------------

**( properties, [callback] )**

In order to connect to the camera you first need to provide its access details. When the `callback` function is provided, it will attempt to connect to the camera and retrieve its status, returned as object to the callback. When it fails the callback gets and _Error_.


name     | type   | default                   | description
:--------|:-------|:--------------------------|:---------------------
endpoint | string | 'http://192.168.1.239:81' | Camera URL
username | string | 'admin'                   | Username
password | string |                           | Password
timeout  | number | 5000                      | Wait timeout in ms


```js
function statusCallback (err, data) {
  if (err) {
    console.log ('Can\'t connect');
    console.log (err);
    return;
  }

  console.log ('Camera online: ' + data.alarm_status_str);
}

var config = {
  endpoint: 'http://192.168.1.123:8080',
  username: 'myname',
  password: 'mysecret'
};

var camera = require ('foscam') (config, statusCallback);
```


Methods
-------

Every method takes a `callback` function as last parameter. The callbacks are the only way to procedural scripting.

**NOTE:** Some methods require a certain access-level, i.e. *admins* can do everything, but a *visitor* can only view.


##### Example

```js
function myCallback (err, data) {
  if (err) {
    console.log (err);
    return;
  }

  console.log (data);
}

camera.system.status (myCallback);
```


### system.status
**( callback )**

**Permission:** everyone

Get basic details from the camera.


##### Example

```js
camera.system.status (console.log);
```


##### Output

```js
{ id: '001A11A00A0B',
  sys_ver: '0.37.2.36',
  app_ver: '3.2.2.18',
  alias: 'Cam1',
  now: '1343304558',
  tz: '-3600',
  alarm_status: '0',
  ddns_status: '0',
  ddns_host: '',
  oray_type: '0',
  upnp_status: '0',
  p2p_status: '0',
  p2p_local_port: '23505',
  msn_status: '0',
  alarm_status_str: 'no alarm',
  ddns_status_str: 'No Action',
  upnp_status_str: 'No Action' }
```


### camera_params
**( callback )**

**Permission:** visitor

Get camera sensor settings.


##### Example

```js
camera.camera_params (console.log);
```

```js
{ resolution: 32,
  brightness: 96,
  contrast: 4,
  mode: 1,
  flip: 0,
  fps: 0 }
```


### Camera

### control.snapshot
**( [filename], callback )**

Take a snapshot. Either receive the **binary JPEG** _Buffer_ in the `callback` or specify a `filename` to store it on your computer.

When a `filename` is provided the callback will return either the *filename* on success or *false* on faillure.


##### Example

```js
// custom processing
camera.control.snapshot (function (jpegBuffer) {
  // add binary processing here
});

// or store locally
camera.control.snapshot ('./my_view.jpg', console.log);
```


### control.storePreset
**( presetId, [callback] )**

Save current camera position in preset #`id`. You can set presets 1 to 16.


##### Example

```js
// Save current PTZ angles in preset #3
camera.control.storePreset (3, console.log);
```


### control.gotoPreset
**( presetId, [callback] )**

Move camera to the position as stored in preset #`presetId`. You can use presets 1 to 16.


##### Example

```js
// Move to position #3
camera.control.gotoPreset (3, console.log);
```


### control.ptz
**( command, [callback] )**

Control camera movement, like pan and tilt.

The `command` to execute can be a string or number.


command                | number | description
:----------------------|:-------|:------------------------
stop                   | 1      | stop any movement
up                     | 0      | start moving up
stop up                | 1      | stop moving up
down                   | 2      | start moving down
stop down              | 3      | stop moving down
left                   | 4      | start moving left
stop left              | 5      | stop moving left
right                  | 6      | start moving right
stop right             | 7      | stop moving right
center                 | 25     | move to center (recalibration)
vertical patrol        | 26     | start moving y-axis
stop vertical patrol   | 27     | stop moving y-axis
horizontal patrol      | 28     | start moving x-axis
stop horizontal patrol | 29     | stop moving x-axis
left up                | 90     | start moving left and upwards
right up               | 91     | start moving right and upwards
left down              | 92     | start moving left and downwards
right down             | 93     | start moving right and downwards
io output high         | 94     | iR on _(some cameras)_
io output low          | 95     | iR off _(some camera)_


##### Example

```js
camera.control.ptz ('horizontal patrol', function () {
  console.log ('Camera moving left-right');
});
```


### config.video
**( name, value, [callback] )**

Change a camera (sensor) setting.


name       | value
:----------|:----------------------------------
resolution | `240` (320x240) or `480` (640x480)
brightness | `0` to `255`
contrast   | `0` to `6`
mode       | `50Hz`, `60Hz` or `outdoor`
flipmirror | `default`, `flip`, `mirror` or `flipmirror`


##### Example

```js
camera.config.video ('resolution', 480, function (err) {
  if (err) { return console.log (err); }

  console.log ('Resolution changed to 640x480');
});
```


### System

### system.reboot
**( [callback ] )**

Reboot the device


##### Example

```js
camera.system.reboot (function (err) {
  if (err) { return console.log (err); }

  console.log ('Rebooting camera');
});
```


### system.factoryRestore
**( [callback ] )**

Reset all settings back to their factory values.


##### Example

```js
camera.config.factoryRestore (function (err) {
  if (err) { return console.log (err); }

  console.log ('Resetting camera settings to factory defaults');
});
```


Unlicense
---------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>


Author
------

[Franklin van de Meent](https://frankl.in)
