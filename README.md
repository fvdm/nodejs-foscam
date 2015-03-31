# foscam

Remote control, view and config a Foscam/Tenvis IP camera.

All included methods are based on Foscam's (fragmented) API documentation.
Some features may not be supported by non-pan/tilt, older cameras or old firmware.
So make sure you keep a backup of your camera settings, just in case.


## Usage

```js
var cam = require ('foscam');

cam.setup ({
  host: 'mycamera.lan',
  port: 81,
  user: 'admin',
  pass: ''
});

// start rotating left
cam.control.decoder ('left', function () {

  // stop rotation
  cam.control.decoder ('stop left', function () {

    // take a picture and store it on your computer
    cam.snapshot ('/path/to/save.jpg', console.log);

  });
});
```


## Installation

Stable: `npm install foscam`

Develop: `npm install fvdm/nodejs-foscam#develop`


## Methods

Every method takes a `callback` function as last parameter. The callbacks are the only way to procedural scripting.

**NOTE:** Some methods require a certain access-level, i.e. *admins* can do everything, but a *visitor* can only view.


### Basic

### setup
#### ( properties, [callback] )

In order to connect to the camera you first need to provide its access details. You can either do this by setting the properties below directly in `cam.settings`, but better is to use `cam.setup()`. When the `callback` function is provided, `setup()` will attempt to connect to the camera and retrieve its status, returned as object to the callback. When it fails the callback gets **false**.


name | type   | default       | description
-----|--------|---------------|----------------------
host | string | 192.168.1.239 | Camera IP or hostname
port | number | 81            | Camera port number
user | string | admin         | Username
pass | string |               | Password


```js
cam.setup (
  {
    host: 'mycamera.lan',
    port: 81,
    user: 'admin'
    pass: ''
  },
  function (status) {
    if (!status) {
      console.error ('ERROR: can\'t connect');    } else {
      console.log (status);
    }
  }
);
```

### status
#### ( callback )

**Permission: everyone**

Get basic details from the camera.

```js
cam.status (console.log);
```

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
#### ( callback )

**Permission: visitor**

Get camera sensor settings.

```js
cam.camera_params (console.log);
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

### snapshot
#### ( [filename], callback )

Take a snapshot. Either receive the **binary JPEG** in the `callback` or specify a `filename` to store it on your computer.

When a `filename` is provided the callback will return either the *filename* on success or *false* on faillure.

```js
// custom processing
cam.snapshot (function (jpeg) {
  // add binary processing here
});

// store locally
cam.snapshot ('./my_view.jpg', console.log);
```


### preset.set
#### ( id, [cb] )

Save current camera position in preset #`id`. You can set presets 1 to 16.

```js
cam.preset.set (3, console.log);
```


### preset.go
#### ( id, [cb] )

Move camera to the position as stored in preset #`id`. You can use presets 1 to 16.

```js
cam.preset.go (3, console.log);
```


### control.decoder
#### ( command, [callback] )

Control camera movement, like pan and tilt.

The `command` to execute can be a string or number.


command                | description
-----------------------|------------------
up                     | start moving up
stop up                | stop moving up
down                   | start moving down
stop down              | stop moving down
left                   | start moving left
stop left              | stop moving left
right                  | start moving right
stop right             | stop moving right
center                 | move to center
vertical patrol        | start moving y-axis
stop vertical patrol   | stop moving y-axis
horizontal patrol      | start moving x-axis
stop horizontal patrol | stop moving x-axis
io output high         | iR on _(some cameras)_
io output low          | iR off _(some camera)_


```js
cam.control.decoder ('horizontal patrol', function () {
  console.log ('Camera moving left-right');
});
```


### control.camera
#### ( name, value, [callback] )

Change a camera (sensor) setting.


name       | value
-----------|-----------------------------------
resolution | `240` (320x240) or `480` (640x480)
brightness | `0` to `255`
contrast   | `0` to `6`
mode       | `50` Hz, `60` Hz or `outdoor`
flipmirror | `default`, `flip`, `mirror` or `flipmirror`


```js
cam.control.camera ('resolution', 640, function () {
  console.log ('Resolution changed to 640x480');
});
```


### System

### reboot
#### ( [callback ] )

Reboot the device

```js
cam.reboot (function () {
  console.log ('Rebooting camera');
});
```


### restore_factory
#### ( [callback ] )

Reset all settings back to their factory values.

```js
cam.restore_factory (function () {
  console.log ('Resetting camera settings to factory defaults');
});
```


### talk
#### ( propsObject )

Directly communicate with the device.


property | type     | required | value
---------|----------|----------|----------------------
path     | string   | yes      | i.e. `get_params.cgi`
fields   | object   | no       | i.e. `{ntp_enable: 1, ntp_svr: 'ntp.xs4all.nl'}`
encoding | string   | no       | `binary` or `utf8` (default)
callback | function | yes      | i.e. `function (err, res)`


```js
cam.talk (
  {
    path: 'set_datetime.cgi',
    fields: {
      ntp_enable: 1,
      ntp_svr: 'ntp.xs4all.nl',
      tz: -3600
    }
  },
  function (response) {
    console.log (response);
  }
);
```


## Unlicense

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


## Author

Franklin van de Meent
| [Website](https://frankl.in)
| [Github](https://github.com/fvdm)
