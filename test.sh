#!/bin/bash
result=0

eslint *.js || result=1
istanbul cover test.js || result=1

if [ "$TRAVIS" == "true" ] && [ "$result" -eq "0" ]; then
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js -v || result=1
fi

exit $result
