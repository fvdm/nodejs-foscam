/*
Name:           foscam
Description:    Remote control a Foscam/Tenvis IP camera
Framework:      node.js
Author:         Franklin van de Meent (https://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-foscam
Feedback:       https://github.com/fvdm/nodejs-foscam/issues
License:        Unlicense (public domain) - see LICENSE file
*/

const fs = require( 'fs' );
const { EventEmitter } = require( 'events' );
const app = new EventEmitter();

// defaults
app.settings = {
  host: '192.168.1.239',
  port: 81,
  user: 'admin',
  pass: ''
};

// overrides
app.setup = function( props, cb ) {
  for ( const key in props ) {
    app.settings[key] = props[key];
  }

  if ( typeof cb === 'function' ) {
    return app.status( cb );
  }
};


// status
app.status = function( cb ) {
  const processData = ( data ) => {
    const result = {};
    const lines = data.split( '\n' );

    for ( const line of lines ) {
      if ( line !== '' ) {
        const parts = line.split( 'var ' );
        const parsed = String( parts[1] ).split( '=' );
        parsed[1] = String( parsed[1] ).replace( /;$/, '' );
        result[parsed[0]] = parsed[1].substring( 0, 1 ) === '\'' ? parsed[1].substring( 1, parsed[1].length - 2 ) : parsed[1];
      }
    }

    if ( result.alarm_status ) {
      switch ( result.alarm_status ) {
        case '0': result.alarm_status_str = 'no alarm'; break;
        case '1': result.alarm_status_str = 'motion alarm'; break;
        case '2': result.alarm_status_str = 'input alarm'; break;
      }
    }

    if ( result.ddns_status ) {
      switch ( result.ddns_status ) {
        case '0': result.ddns_status_str = 'No Action'; break;
        case '1': result.ddns_status_str = 'It\'s connecting...'; break;
        case '2': result.ddns_status_str = 'Can\'t connect to the Server'; break;
        case '3': result.ddns_status_str = 'Dyndns Succeed'; break;
        case '4': result.ddns_status_str = 'DynDns Failed: Dyndns.org Server Error'; break;
        case '5': result.ddns_status_str = 'DynDns Failed: Incorrect User or Password'; break;
        case '6': result.ddns_status_str = 'DynDns Failed: Need Credited User'; break;
        case '7': result.ddns_status_str = 'DynDns Failed: Illegal Host Format'; break;
        case '8': result.ddns_status_str = 'DynDns Failed: The Host Does not Exist'; break;
        case '9': result.ddns_status_str = 'DynDns Failed: The Host Does not Belong to You'; break;
        case '10': result.ddns_status_str = 'DynDns Failed: Too Many or Too Few Hosts'; break;
        case '11': result.ddns_status_str = 'DynDns Failed: The Host is Blocked for Abusing'; break;
        case '12': result.ddns_status_str = 'DynDns Failed: Bad Reply from Server'; break;
        case '13': result.ddns_status_str = 'DynDns Failed: Bad Reply from Server'; break;
        case '14': result.ddns_status_str = 'Oray Failed: Bad Reply from Server'; break;
        case '15': result.ddns_status_str = 'Oray Failed: Incorrect User or Password'; break;
        case '16': result.ddns_status_str = 'Oray Failed: Incorrect Hostname'; break;
        case '17': result.ddns_status_str = 'Oray Succeed'; break;
        case '18': result.ddns_status_str = 'Reserved'; break;
        case '19': result.ddns_status_str = 'Reserved'; break;
        case '20': result.ddns_status_str = 'Reserved'; break;
        case '21': result.ddns_status_str = 'Reserved'; break;
      }
    }

    if ( result.upnp_status ) {
      switch ( result.upnp_status ) {
        case '0': result.upnp_status_str = 'No Action'; break;
        case '1': result.upnp_status_str = 'Succeed'; break;
        case '2': result.upnp_status_str = 'Device System Error'; break;
        case '3': result.upnp_status_str = 'Errors in Network Communication'; break;
        case '4': result.upnp_status_str = 'Errors in Chat with UPnP Device'; break;
        case '5': result.upnp_status_str = 'Rejected by UPnP Device, Maybe Port Conflict'; break;
      }
    }

    return result;
  };

  if ( typeof cb === 'function' ) {
    app.talk( {
      path: 'get_status.cgi',
      callback: ( data ) => cb( processData( data ) )
    } );
    return;
  }

  return app.talk( { path: 'get_status.cgi' } ).then( processData );
};


// camera params
app.camera_params = function( cb ) {
  const processData = ( data ) => {
    const result = {};
    data.replace( /var ([^=]+)=([^;]+);/g, ( str, key, value ) => {
      const parsed = parseInt( value, 10 );
      result[key] = isNaN( parsed ) ? 0 : parsed;
    } );
    return result;
  };

  if ( typeof cb === 'function' ) {
    app.talk( {
      path: 'get_camera_params.cgi',
      callback: ( data ) => cb( processData( data ) )
    } );
    return;
  }

  return app.talk( { path: 'get_camera_params.cgi' } ).then( processData );
};


// Presets
app.preset = {
  id2cmd: function( action, id ) {
    const cmds = {
      set: [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
      go: [31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61]
    };
    return cmds[action][id - 1];
  },

  set: function( id, cb ) {
    return app.control.decoder( app.preset.id2cmd( 'set', id ), cb );
  },

  go: function( id, cb ) {
    return app.control.decoder( app.preset.id2cmd( 'go', id ), cb );
  }
};


// control
app.control = {

  // pan/tilt
  decoder: function( cmd, cb ) {
    let command = cmd;

    if ( typeof command === 'string' && !command.match( /^[0-9]+$/ ) ) {
      switch ( command ) {
        case 'up': command = 0; break;
        case 'stop up': command = 1; break;
        case 'down': command = 2; break;
        case 'stop down': command = 3; break;
        case 'left': command = 4; break;
        case 'stop left': command = 5; break;
        case 'right': command = 6; break;
        case 'stop right': command = 7; break;
        case 'center': command = 25; break;
        case 'vertical patrol': command = 26; break;
        case 'stop vertical patrol': command = 27; break;
        case 'horizontal patrol': command = 28; break;
        case 'stop horizontal patrol': command = 29; break;
        case 'io output high': command = 94; break;
        case 'io output low': command = 95; break;
      }
    }

    if ( typeof cb === 'function' ) {
      app.talk( {
        path: 'decoder_control.cgi',
        fields: { command },
        callback: cb
      } );
      return;
    }

    return app.talk( {
      path: 'decoder_control.cgi',
      fields: { command }
    } );
  },

  // camera settings
  camera: function( param, value, cb ) {
    let paramVal = param;
    let valueVal = value;

    // fix param
    if ( typeof paramVal === 'string' && !paramVal.match( /^[0-9]+$/ ) ) {
      switch ( paramVal ) {

        case 'brightness': paramVal = 1; break;
        case 'contrast': paramVal = 2; break;

        // resolution
        case 'resolution':
          paramVal = 0;
          if ( typeof valueVal === 'string' && !valueVal.match( /^[0-9]{1,2}$/ ) ) {
            switch ( valueVal ) {
              case '320':
              case '320x240':
              case '320*240':
                valueVal = 8;
                break;

              case '640':
              case '640x480':
              case '640*480':
                valueVal = 32;
                break;
            }
          }
          break;

        case 'mode':
          paramVal = 3;
          if ( typeof valueVal === 'string' && !valueVal.match( /^[0-9]$/ ) ) {
            switch ( valueVal.toLowerCase() ) {
              case '50':
              case '50hz':
              case '50 hz':
                valueVal = 0;
                break;

              case '60':
              case '60hz':
              case '60 hz':
                valueVal = 1;
                break;

              case 'outdoor':
              case 'outside':
                valueVal = 2;
                break;
            }
          }
          break;

        case 'flipmirror':
          paramVal = 5;
          if ( typeof valueVal === 'string' && !valueVal.match( /^[0-9]$/ ) ) {
            switch ( valueVal.toLowerCase() ) {
              case 'default':
                valueVal = 0;
                break;

              case 'flip':
                valueVal = 1;
                break;

              case 'mirror':
                valueVal = 2;
                break;

              case 'flipmirror':
              case 'flip&mirror':
              case 'flip+mirror':
              case 'flip + mirror':
              case 'flip & mirror':
                valueVal = 3;
                break;
            }
          }
          break;
      }
    }

    // send it
    if ( typeof cb === 'function' ) {
      app.talk( {
        path: 'camera_control.cgi',
        fields: {
          param: paramVal,
          value: valueVal
        },
        callback: cb
      } );
      return;
    }

    return app.talk( {
      path: 'camera_control.cgi',
      fields: {
        param: paramVal,
        value: valueVal
      }
    } );
  }
};


// reboot
app.reboot = function( cb ) {
  if ( typeof cb === 'function' ) {
    app.talk( {
      path: 'reboot.cgi',
      callback: cb
    } );
    return;
  }

  return app.talk( { path: 'reboot.cgi' } );
};


// restore factory
app.restore_factory = function( cb ) {
  if ( typeof cb === 'function' ) {
    app.talk( {
      path: 'restore_factory.cgi',
      callback: cb
    } );
    return;
  }

  return app.talk( { path: 'restore_factory.cgi' } );
};


// params
app.params = function( cb ) {
  if ( typeof cb === 'function' ) {
    app.talk( {
      path: 'get_params.cgi',
      callback: cb
    } );
    return;
  }

  return app.talk( { path: 'get_params.cgi' } );
};


// set
app.set = {

  // alias
  alias: function( alias, cb ) {
    if ( typeof cb === 'function' ) {
      app.talk( {
        path: 'set_alias.cgi',
        fields: { alias },
        callback: cb
      } );
      return;
    }

    return app.talk( {
      path: 'set_alias.cgi',
      fields: { alias }
    } );
  },

  // datetime
  datetime: function( props, cb ) {
    if ( typeof cb === 'function' ) {
      app.talk( {
        path: 'set_datetime.cgi',
        fields: props,
        callback: cb
      } );
      return;
    }

    return app.talk( {
      path: 'set_datetime.cgi',
      fields: props
    } );
  }
};


// snapshot
app.snapshot = function( filepath, cb ) {
  let callback = cb;
  let savePath = filepath;

  if ( !callback && typeof filepath === 'function' ) {
    callback = filepath;
    savePath = false;
  }

  const processData = async ( bin ) => {
    if ( savePath ) {
      await fs.promises.writeFile( savePath, bin );
      return savePath;
    }
    return bin;
  };

  if ( typeof callback === 'function' ) {
    app.talk( {
      path: 'snapshot.cgi',
      encoding: 'binary',
      callback: async ( bin ) => {
        try {
          const result = await processData( bin );
          callback( result );
        }
        catch ( err ) {
          app.emit( 'connection-error', err );
          callback( false );
        }
      }
    } );
    return;
  }

  return app.talk( {
    path: 'snapshot.cgi',
    encoding: 'binary'
  } ).then( processData );
};


// communicate
app.talk = function( {

  path,
  fields = {},
  encoding = '',
  callback = false,
  timeout = app.settings.timeout,
 
} ) {

  fields.user = app.settings.user;
  fields.pwd = app.settings.pass;

  const queryParams = new URLSearchParams( fields ).toString();
  const url = `http://${app.settings.host}:${app.settings.port}/${path}?${queryParams}`;


  const fetchData = async () => {
    try {
      const response = await fetch( url );

      if ( !response.ok ) {
        throw new Error( `HTTP error! status: ${response.status}` );
      }

      let data;
      if ( encoding === 'binary' ) {
        const buffer = await response.arrayBuffer();
        data = Buffer.from( buffer );
      }
      else {
        data = await response.text();
        data = data.trim();
      }

      return data;
    }
    catch ( err ) {
      app.emit( 'connection-error', err );
      throw err;
    }
  };

  if ( typeof callback === 'function' ) {
    fetchData().then( callback );
    return;
  }

  return fetchData();
 
};

// ready
module.exports = app;
