#!/bin/bash
result=0

eslint *.js || result=1

if [ "$TRAVIS" == "true" ]; then
  istanbul cover test.js --report lcovonly || result=1
  [ "$result" -eq "0" ] && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js -v || result=1
else
  node test.js || result=1
fi

exit $result

