# nodejs-foscam

Remote control, view and config a Foscam/Tenvis IP camera.

All included methods are based on Foscam's (fragmented) API documentation. Some features may not be supported by non-pan/tilt, older cameras or old firmware. So make sure you keep a backup of your camera settings, just in case.

# Usage

The installation and loading are simple with [NPM](https://npmjs.org/).

```sh
npm install foscam
```

```js
var cam = require('foscam')

cam.setup({
  host: 'mycamera.lan',
  port: 81,
  user: 'admin'
  pass: ''
})

// start rotating left
cam.control.decoder( 'left', function() {
  
  // stop rotation
  cam.control.decoder( 'stop left', function() {
    
    // take a picture and store it on your computer
    cam.snapshot( '/path/to/save.jpg', console.log )
  
  })
  
})
```

### Or directly from Github

```sh
git clone https://github.com/fvdm/nodejs-foscam.git
```
```js
var cam = require('./nodejs-foscam')
```

# Methods

Every method takes a `callback` function as last parameter. The callbacks are the only way to procedural scripting.

**NOTE:** Some methods require a certain access-level, i.e. *admins* can do everything, but a *visitor* can only view.

## Basic

## setup
### ( properties, [callback] )

In order to connect to the camera you first need to provide its access details. You can either do this by setting the properties below directly in `cam.settings`, but better is to use `cam.setup()`. When the `callback` function is provided, `setup()` will attempt to connect to the camera and retrieve its status, returned as object to the callback. When it fails the callback gets **false**.

<table>
	<th>setting</th>
	<th>description</th>
	<th>default</th>
	<tr>
		<td>host</td>
		<td>IP-address or hostname</td>
		<td>192.168.1.239</td>
	</tr>
	<tr>
		<td>port</td>
		<td>port number</td>
		<td>81</td>
	</tr>
	<tr>
		<td>user</td>
		<td>username</td>
		<td>admin</td>
	</tr>
	<tr>
		<td>pass</td>
		<td>password</td>
		<td>[empty]</td>
	</tr>
</table>

```js
cam.setup(
	{
		host: 'mycamera.lan',
		port: 81,
		user: 'admin'
		pass: ''
	},
	function( status ) {
		if( !status ) {
			console.error( 'ERROR: can\'t connect' )
		} else {
			console.log( status )
		}
	}
)
```

## status
### ( callback )
**Permission: everyone**

Get basic details from the camera.

```js
cam.status( console.log )
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

## camera_params
### ( callback )

**Permission: visitor**

Get camera sensor settings.

```js
cam.camera_params( console.log )
```
```js
{ resolution: 32,
  brightness: 96,
  contrast: 4,
  mode: 1,
  flip: 0,
  fps: 0 }
```

## Camera

## snapshot
### ( [filename], callback )

Take a snapshot. Either receive the **binary JPEG** in the `callback` or specify a `filename` to store it on your computer.

When a `filename` is provided the callback will return either the *filename* on success or *false* on faillure.

```js
// custom processing
cam.snapshot( function( jpeg ) {
	// add binary processing here
})

// store locally
cam.snapshot( './my_view.jpg', console.log )
```

## preset.set
### ( id, [cb] )

Save current camera position in preset #`id`. You can set presets 1 to 16.

```js
cam.preset.set( 3, console.log )
```

## preset.go
### ( id, [cb] )

Move camera to the position as stored in preset #`id`. You can use presets 1 to 16.

```js
cam.preset.go( 3, console.log )
```

## control.decoder
### ( command, [callback] )

Control camera movement, like pan and tilt.

**command** - The command to execute. This can be a string (see below) or number.

###### Commands

<table>
	<th>command</th>
	<th>api id</th>
	<th>description</th>
	<tr>
		<td>up</td>
		<td>0</td>
		<td>start moving upwards</td>
	</tr>
	<tr>
		<td>stop up</td>
		<td>1</td>
		<td>stop moving upwards</td>
	</tr>
	<tr>
		<td>down</td>
		<td>2</td>
		<td>start moving downwards</td>
	</tr>
	<tr>
		<td>stop down</td>
		<td>3</td>
		<td>stop moving downwards</td>
	</tr>
	<tr>
		<td>left</td>
		<td>4</td>
		<td>start moving left</td>
	</tr>
	<tr>
		<td>stop left</td>
		<td>5</td>
		<td>stop moving left</td>
	</tr>
	<tr>
		<td>right</td>
		<td>6</td>
		<td>start moving right</td>
	</tr>
	<tr>
		<td>stop right</td>
		<td>7</td>
		<td>stop moving right</td>
	</tr>
	<tr>
		<td>center</td>
		<td>25</td>
		<td>move to center</td>
	</tr>
	<tr>
		<td>vertical patrol</td>
		<td>26</td>
		<td>start moving vertical (y-axis)</td>
	</tr>
	<tr>
		<td>stop vertical patrol</td>
		<td>27</td>
		<td>stop moving vertical (y-axis)</td>
	</tr>
	<tr>
		<td>horizontal patrol</td>
		<td>28</td>
		<td>start moving horizontal (x-axis)</td>
	</tr>
	<tr>
		<td>stop horizontal patrol</td>
		<td>29</td>
		<td>stop moving horizontal (x-axis)</td>
	</tr>
	<tr>
		<td>io output high</td>
		<td>94</td>
		<td>iR on *(some cameras)*</td>
	</tr>
	<tr>
		<td>io output low</td>
		<td>95</td>
		<td>iR off *(some cameras)*</td>
	</tr>
</table>

## control.camera
### ( name, value, [callback] )

Change a camera (sensor) setting.

**name** - the parameter *name* or *id*.
**value** - its replacement value.

###### Parameters

<table>
	<th>name</th>
	<th>id</th>
	<th>values</th>
	<tr>
		<td>brightness</td>
		<td>1</td>
		<td>0-255</td>
	</tr>
	<tr>
		<td>contrast</td>
		<td>2</td>
		<td>0-6</td>
	</tr>
	<tr>
		<td>resolution</td>
		<td>0</td>
		<td>
			<table>
				<th>value (aliases)</th>
				<th>id</th>
				<tr>
					<td>320, 320x240, 320*240</td>
					<td>8</td>
				</tr>
				<tr>
					<td>640, 640x480, 640*480</td>
					<td>32</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td>mode</td>
		<td>3</td>
		<td>
			<table>
				<th>value (aliases)</th>
				<th>id</th>
				<tr>
					<td>50, 50hz, 50 hz</td>
					<td>0</td>
				</tr>
				<tr>
					<td>60, 60hz, 60 hz</td>
					<td>1</td>
				</tr>
				<tr>
					<td>outdoor, outside</td>
					<td>2</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td>flipmirror</td>
		<td>5</td>
		<td>
			<table>
				<th>value (aliases)</th>
				<th>id</th>
				<tr>
					<td>default</td>
					<td>0</td>
				</tr>
				<tr>
					<td>flip</td>
					<td>1</td>
				</tr>
				<tr>
					<td>mirror</td>
					<td>2</td>
				</tr>
				<tr>
					<td>flipmirror, flip+mirror</td>
					<td>3</td>
				</tr>
			</table>
		</td>
	</tr>
</table>

## System

## reboot
### ( [callback ] )

Reboot the device

## restore_factory
### ( [callback ] )

Reset all settings back to their factory values.

## talk
### ( propsObject )

Directly communicate with the device.

###### properties

<table>
	<th>name</th>
	<th>required</th>
	<th>description</th>
	<th>value</th>
	<th>default</th>
	<tr>
		<td>path</td>
		<td>required</td>
		<td>the method path</td>
		<td>ie. `get_params.cgi`</td>
		<td></td>
	</tr>
	<tr>
		<td>fields</td>
		<td>optional</td>
		<td>object with method parameters</td>
		<td>ie. {ntp_enable: 1, ntp_svr: 'ntp.xs4all.nl'}
		<td>{}</td>
	</tr>
	<tr>
		<td>encoding</td>
		<td>optional</td>
		<td>response encoding to expect</td>
		<td>ie. `utf8` or `binary`</td>
		<td></td>
	</tr>
	<tr>
		<td>callback</td>
		<td>optional</td>
		<td>(trimmed) output will be send to the callback *function*</td>
		<td></td>
		<td></td>
	</tr>
</table>

# Unlicense

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
