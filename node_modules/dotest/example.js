// Load test runner and your app
const doTest = require( 'dotest' );

const app = {
  methodOne: callback => {
    var data = {
      music: ['song'],
    };

    callback( null, data );
  },
  sub: {
    methodTwo: () => {},
  },
};

// Check app interface
doTest.add( 'App interface', test => {
  test()
    .isFunction( 'fail', 'methodOne', app.methodOne )
    .isObject( 'fail', 'sub', app.sub )
    .isFunction( 'fail', 'sub.methodTwo', app.sub.methodTwo )
    .done()
  ;
} );

// Check method response
doTest.add( 'App methodOne', test => {
  app.methodOne( ( err, data ) => {
    test( err )
      .isObject( 'fail', 'Callback data', data )
      .isArray( 'fail', 'data.music', data.music )
      .isNotEmpty( 'warn', 'data.music', data.music )
      .done()
    ;
  } );
} );

// Run the tests
doTest.run();
