# nodejs-foscam

Remote control, view and config a Foscam/Tenvis IP camera.

# Usage

The installation and loading are simple with [NPM](http://search.npmjs.org/).

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
var cam = require('./nodejs-foscam/foscam.js')
```

# Methods

Every method takes a **callback** function as last parameter. The callbacks are the only way to procedural scripting.

**NOTE:** Some methods require a certain access-level, i.e. *admins* can do everything, but a *visitor* can only view.

## setup
### ( properties, [callback] )

In order to connect to the camera you first need to provide its access details. You can either do this by setting the properties below directly in **cam.settings**, but better is to use **cam.setup()**. When the **callback** function is provided, *setup()* will attempt to connect to the camera and retrieve its status, returned as object to the callback. When it fails the callback gets **false**.

<table>
	<th>key</th>
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