var dotest = require ('dotest');
var app = require ('./');

dotest.add ('Module', function (test) {
  test ()
    .isObject ('fail', 'exports', app)
    .isObject ('fail', '.settings', app.settings)
    .isFunction ('fail', '.setup', app.setup)
    .done ();
});

dotest.run ();
