#!/bin/bash
result=0
libpath="$(pwd)"
nodebin="$libpath/node_modules/.bin"
eslintBin="$nodebin/eslint"
nycBin="$nodebin/nyc"
coverallsBin="$nodebin/coveralls"


# Coverage
skipCoverage=$DOTEST_NOCOV
minimalCoverage=$DOTEST_MINCOV
branchCoverage=$DOTEST_COVBRANCHES
lineCoverage=$DOTEST_COVLINES
functionCoverage=$DOTEST_COVFUNCTIONS
statementCoverage=$DOTEST_COVSTATEMENTS

if [[ -z "$skipCoverage" ]]; then
  skipCoverage=false
fi

if [[ -z "$minimalCoverage" ]]; then
  minimalCoverage=85
fi

if [[ -z "$branchCoverage" ]]; then
  branchCoverage=$minimalCoverage
fi

if [[ -z "$lineCoverage" ]]; then
  lineCoverage=$minimalCoverage
fi

if [[ -z "$functionCoverage" ]]; then
  functionCoverage=$minimalCoverage
fi

if [[ -z "$statementCoverage" ]]; then
  statementCoverage=$minimalCoverage
fi


# ESLint
if [[ -x "$eslintBin" ]]; then
  echo "Running ESLint..."
  "$eslintBin" *.js || result=1

  if [[ -d ./lib ]]; then
    "$eslintBin" --no-error-on-unmatched-pattern ./lib/ || result=1
  fi

  if [[ -d ./test ]]; then
    "$eslintBin" --no-error-on-unmatched-pattern ./test/ || result=1
  fi

  echo
else
  result=1
  echo -e "\033[31mERROR:\033[0m ESLint is not installed"
  echo "Run 'npm i' to install all dependencies."
  echo
fi

# Run test script without coverage
if [[ "$skipCoverage" == "true" ]]; then

  cd "$libpath"
  node test.js || result=1

# Run test script with coverage
elif [[ -x "$nycBin" ]]; then

  cd "$libpath"

  "$nycBin" \
  --clean \
  --check-coverage \
  --branches=$branchCoverage \
  --lines=$lineCoverage \
  --functions=$functionCoverage \
  --statements=$statementCoverage \
  --all \
  --exclude='**/eslint.config.js' \
  --exclude='**/eslint.config.mjs' \
  --exclude='**/test.js' \
  --exclude='**/example.js' \
  --exclude='**/coverage/**' \
  --exclude='**/packages/**' \
  --exclude='**/.git/**' \
  --exclude='**/node_modules/**' \
  --reporter=lcov \
  --reporter=text \
  node test.js || result=1

  # Submit coverage to Coveralls.io
  if [[ "$CI" == "true" && "$GITHUB_ACTIONS" != "true" ]]; then
    if [[ -x "$coverallsBin" ]]; then
      cd "$libpath"

      echo
      echo "Sending coverage report to Coveralls..."
      "$coverallsBin" < "$(pwd)/coverage/lcov.info" || result=1
      echo
    else
      result=1
      echo -e "\033[31mERROR:\033[0m Coveralls is not installed"
      echo "Run 'npm i' to install all dependencies."
      echo
    fi
  fi

# Coverage tool 'nyc' not available
else

  result=1
  echo -e "\033[31mERROR:\033[0m nyc is not installed"
  echo "Run 'npm i' to install all dependencies."
  echo

fi

# All done, return exit status
exit $result
