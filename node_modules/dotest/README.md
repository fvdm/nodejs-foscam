# dotest

One dev dependency for your [Node.js](https://nodejs.org) package to run ESLint,
your test.js, coverage and report to Coveralls.io when running in a CI environment.

[![npm](https://img.shields.io/npm/v/dotest.svg?maxAge=3600)](https://www.npmjs.com/package/dotest?activeTab=versions)
[![Build Status](https://github.com/fvdm/nodejs-dotest/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/fvdm/nodejs-dotest/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/fvdm/nodejs-dotest/badge.svg?branch=master)](https://coveralls.io/github/fvdm/nodejs-dotest?branch=master)

* It runs ESLint with your package's `eslint.config.mjs` file
* Then it runs your `test.js` with `nyc` to generate a coverage report
* When it detects the code is running in a CI it will also submit the coverage report to [Coveralls.io](https://coveralls.io)
* In case it runs in a Github action the warning, fail and error lines are highlighted


## Example

**test.js**

```js
// Load test runner and your app
const doTest = require( 'dotest' );
const app = require( './' );

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

// Check promise
doTest.add( 'Promise good', async test => {
  let error;
  let data;

  try {
    data = await myPromise();
  }
  catch ( err ) {
    error = err;
  }

  test( error )
    .isObject( 'fail', 'data', data );
    .done()
  ;
} );

// Run the tests
doTest.run();
```

**package.json**

Full test including ESLint, test.js, coverage report and Coveralls.io submit.

```json
"scripts": {
  "test": "dotest"
}
```

Or just run your `test.js`

```json
"scripts": {
  "test": "node test.js"
}
```


Just run `npm test`


## Installation

This is usually intended for CI builds,
so best to make sure it's in your `devDependencies`

```sh
npm i dotest --save-dev
```


## Configuration

The script takes these env variables. They override the code settings.


name                   | default          | description
:----------------------|:-----------------|:-----------
[DOTEST_WAIT]          | 0                | Pause N ms between tests
[DOTEST_NOCOV]         |                  | Set to 'true' to skip coverage report
[DOTEST_MINCOV]        | 85               | Minimum coverage % default
[DOTEST_COVBRANCHES]   | `$DOTEST_MINCOV` | Minimum coverage % for branches
[DOTEST_COVLINES]      | `$DOTEST_MINCOV` | Minimum coverage % for lines
[DOTEST_COVFUNCTIONS]  | `$DOTEST_MINCOV` | Minimum coverage % for functions
[DOTEST_COVSTATEMENTS] | `$DOTEST_MINCOV` | Minimum coverage % for statements


## Methods

### add
**( label, testFunction )**

Add a new test to the queue.


```js
doTest.add( 'App interface', test => {
  test()
    .isArray( 'fail', 'my array', [] )
    .done()
  ;
} );
```


### run
**( [wait] )**

Run the tests from the queue, one by one.


param  | type   | default | description
:------|:-------|:--------|:-----------
[wait] | number | 0       | Wait N ms between tests


```js
// Normal, without pause between tests
doTest.run();

// Or wait 2 seconds
doTest.run( 2000 );
```


### log
**( [type], str, [dontCount] )**

Fancy `console.log` with style.


param       | type    | default | description
:-----------|:--------|:--------|:-----------
[type]      | string  | plain   | Text style to apply, see below
str         | string  |         | The string to output
[dontCount] | boolean | false   | Don't count a fail or error towards the exit status


style | description
:-----|:-----------
fail  | `FAIL    Text` with _FAIL_ in red
good  | `good    Text` with _good_ in green
warn  | `warn    Text` with _warn_ in yellow
info  | `info    Text` with _info_ in cyan
note  | `Text` with _Text_ in bold
error | `ERROR   Error.message\nError\nError.stack` with _ERROR_ in red
plain | No styling


The styles `error`, `fail` and `warn` add to the _errors_ and _warnings_ counters,
where `error` and `fail` also cause the script to fail.


```js
// Bold text
doTest.log( 'note', 'Hello world' );
```


### exit
**( )**

Force exit the process, after writing statistics to the console.

```js
doTest.exit();
```


### test
**( [err] )**

Returns check functions.
Optionally test for `err` instance of `Error` and dump it to the console.

The check functions take a `level` parameter.
When set to `fail` the check reports _fail_ and the whole test script will eventually fail.
When set to `warn` the check reports _warn_ but won't cause the script to fail.

You can concat the check functions for clean code.


```js
// Using the method
doTest.add( 'App interface', () => {
  doTest.test()
    .isObject( 'fail', 'Callback data', data )
    .done()
  ;
} );

// Or using the shortcut
doTest.add( 'App interface', test => {
  test()
    .isObject( 'fail', 'Callback data', data )
    .done()
  ;
} );
```


### test() .done
**( [callback] )**

Run the next test from the queue.
Optionally run a `callback` function before the next test.

See example above.


### test() .exit
**( )**

Alias to [dotest.exit()](#exit).
Works similar to `.done()` where it ends the test,
but `.exit()` also ends the whole script.

```js
test()
  .isArray( 'fail', 'data', [] )
  .exit()
;
```


### test() .info
**( message )**

Output 'info' log line.

The `message` can be of any type.
When it is not a string, the type is written instead
and the full value of `message` dumped right below.

```js
test()
  .info( { hello: 'world' } )
  .done()
;

// Output:
// info    Object
// { hello: 'world' }
```


### test() .good
**( message )**

Output 'good' log line.

The `message` can be of any type.
When it is not a string, the type is written instead
and the full value of `message` dumped right below.

```js
test()
  .good( 'It works great' )
  .done()
;

// Output:
// good    It works great
```


### test() .warn
**( message )**

Output 'warn' log line.

The `message` can be of any type.
When it is not a string, the type is written instead
and the full value of `message` dumped right below.

```js
test()
  .warn( 'Hmm something odd happened' )
  .done()
;

// Output:
// warn    Hmm something odd happend
```


### test() .fail
**( message, [dontCount] )**

Output 'FAIL' log line.

The `message` can be of any type.
When it is not a string, the type is written instead
and the full value of `message` dumped right below.

```js
test()
  .fail( 'We have a problem' )
  .done()
;

// Output:
// FAIL    We have a problem
```


### test() .error
**( err, [dontCount] )**

Output 'ERROR' log line with dump and stack trace.

```js
const err = new Error( 'Oops' );

test()
  .error( err )
  .done()
;

// Output:
// ERROR   Oops
//
// [Error: Oops]
// ...
```


### test() .isError
**( level, what, input )**

Check if `input` is an instance of _Error_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isError( 'fail', 'My data', data )
  .done()
;
```


### test() .isObject
**( level, what, input )**

Check if `input` is an instance of _Object_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isObject( 'fail', 'My data', data )
  .done()
;
```


### test() .isArray
**( level, what, input )**

Check if `input` is an instance of _Array_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isArray( 'fail', 'My data', data )
  .done()
;
```


### test() .isString
**( level, what, input )**

Check if `input` is a _string_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isString( 'fail', 'My data', data )
  .done()
;
```


### test() .isNumber
**( level, what, input )**

Check if `input` is a _number_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isNumber( 'fail', 'My data', data )
  .done()
;
```


### test() .isUndefined
**( level, what, input )**

Check if `input` is _undefined_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
function ( err, data ) {
  test()
    .isUndefined( 'warn', 'My data', data )
    .done()
  ;
}
```


### test() .isNull
**( level, what, input )**

Check if `input` is _null_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
function ( err, data ) {
  test()
    .isNull( 'warn', 'My data', data )
    .done()
  ;
}
```


### test() .isNaN
**( level, what, input )**

Check if `input` is _NaN_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
function ( err, data ) {
  test()
    .isNaN( 'warn', 'My data', data )
    .done()
  ;
}
```


### test() .isBoolean
**( level, what, input )**

Check if `input` is a _boolean_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isBoolean( 'fail', 'My data', data )
  .done()
;
```


### test() .isFunction
**( level, what, input )**

Check if `input` is an instance of _Function_ or _AsyncFunction_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isFunction( 'fail', 'My data', data )
  .done()
;
```


### test() .isNormalFunction
**( level, what, input )**

Check if `input` is an instance of _Function_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isFunction( 'fail', 'My data', data )
  .done()
;
```


### test() .isAsyncFunction
**( level, what, input )**

Check if `input` is an instance of _AsyncFunction_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
test()
  .isAsyncFunction( 'fail', 'My data', data )
  .done()
;
```


### test() .isDate
**( level, what, input )**

Check if `input` is an instance of _Date_.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
const myDate = new Date();

test()
  .isDate( 'fail', 'My data', myDate )
  .done()
;
```


### test() .isExactly
**( level, what, one, two )**

Check if `one` is exactly of the same type and value as `two`.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
one   | mixed  | The variable to check
two   | mixed  | The variable to check against


```js
test()
  .isExactly( 'fail', 'My data', 'foo', 'bar' )
  .done()
;
```


### test() .isCondition
**( level, what, one, operator, two )**

Check if the two values meet the condition.


param    | type   | description
:--------|:-------|:-----------
level    | string | Either `fail` or `warn`
what     | string | Text to prepend to check result
one      | mixed  | Variable to test against
operator | string | `<`, `>`, `<=`, `>=`
two      | mixed  | Variable to test against


```js
test()
  .isCondition( 'fail', 'My data', 1, '<', 2 )
  .done()
;
```


### test() .isEmpty
**( level, what, input )**

Check if `input` is _undefined_, _null_, or an empty _string_, _object_, _array_ or _Error_.
In case of _Error_ the `input.message` and `Object.keys( input )` are checked.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
// Object is empty
test()
  .isEmpty( 'fail', 'My data', {} )
  .done()
;
```


### test() .isNotEmpty
**( level, what, input )**

Check if `input` is not _undefined_, _null_, or an empty _string_, _object_, _array_ or _Error_.
In case of _Error_ the `input.message` and `Object.keys( input )` are checked.


param | type   | description
:-----|:-------|:-----------
level | string | Either `fail` or `warn`
what  | string | Text to prepend to check result
input | mixed  | The variable to check


```js
// Object is not empty
test()
  .isNotEmpty( 'fail', 'My data', { foo: 'bar' } )
  .done()
;
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

For more information, please refer to <https://unlicense.org>


## Author

[Franklin](https://frankl.in)
| [Buy me a coffee](https://frankl.in/donating)
