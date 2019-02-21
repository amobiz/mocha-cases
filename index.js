'use strict';

var async = require('async-done');
var expect = require('chai').expect;
var _it = it;

var INTERPOLATE = /\\{|\\}|{\s*([.\w]+?)\s*}/gm;

/**
 * Run test runner using given test cases.
 * A tiny mocha test case runner. Suited for simple input to output validation tests.
 *
 * @param testCases {array | object} the test case(s) to verify
 * @param runner {function} optional, the test runner
 * @param options {any} optional, extra value passed to runner
 *
 */
function test(testCases, runner, options) {
  var it;

  if (!Array.isArray(testCases)) {
    return test([testCases], runner, options);
  } else if (runner && typeof runner !== 'function') {
    return test(testCases, null, runner);
  } else if (!options) {
    return test(testCases, runner, {});
  }

  it = options.it || _it;
  (filter(testCases, only) || filter(testCases, skip) || testCases).forEach(runTest);

  function runTest(testCase) {
    var prefix = testCase.prefix || options.prefix || '';
    var testRunner = getTestRunner();

    if ('cases' in testCase) {
      testPairValues();
    } else if ('values' in testCase) {
      testMultiValues();
    } else {
      testSingleValue(testCase);
    }

    function getTestRunner() {
      var run = testCase.runner || options.runner || runner || passThrough;

      return isErrback() ? testErrback : testAsyncDone;

      function passThrough(value) {
        return value;
      }

      function isErrback() {
        if ('errback' in testCase) {
          return testCase.errback;
        }
        return options.errback;
      }

      function testErrback(theCase, done) {
        run(theCase.value, theCase.options, done);
      }

      function testAsyncDone(theCase, done) {
        async(function (asyncDone) {
          var actual;

          actual = run(theCase.value, theCase.options);
          if (actual && typeof (actual.on || actual.subscribe || actual.then) === 'function') {
            return actual;
          }
          asyncDone(null, actual);
        }, done);
      }
    }

    function testPairValues() {
      testCase.cases.forEach(function (theCase) {
        var value, expected;

        if (Array.isArray(theCase)) {
          value = theCase[0];
          expected = theCase[1];
        } else {
          value = theCase.value;
          expected = theCase.expected;
        }
        testSingleValue({
          name: testCase.name,
          value: value,
          expected: expected,
          error: testCase.error,
          options: testCase.options
        });
      });
    }

    function testMultiValues() {
      var expected = which(testCase.expected);

      testCase.values.forEach(function (value, i) {
        testSingleValue({
          name: testCase.name,
          value: value,
          expected: expected(i),
          error: testCase.error,
          options: testCase.options
        });
      });

      function which(values) {
        if (Array.isArray(values)) {
          return function (index) {
            return values[index];
          };
        }
        return function () {
          return values;
        };
      }
    }

    function testSingleValue(theCase) {
      it(prefix + title(theCase), function (done) {
        testRunner(theCase, sandbox(verify, done));
      });

      function verify(err, actual) {
        if (theCase.error) {
          if (typeof theCase.error === 'function') {
            expect(err).to.be.instanceof(theCase.error);
          } else {
            expect(err).to.deep.equal(theCase.error);
          }
        } else {
          expect(actual).to.deep.equal(theCase.expected);
        }
      }
    }
  }
}

function filter(testCases, fn) {
  var filtered = testCases.filter(fn);

  if (filtered.length) {
    return filtered;
  }
}

function only(testCase) {
  return testCase.only;
}

function skip(testCase) {
  return !testCase.skip;
}

function title(testCase) {
  if (typeof testCase.name === 'function') {
    return testCase.name(testCase.value, testCase.expected, testCase.options);
  }

  return testCase.name.replace(INTERPOLATE, function (match, paths) {
    switch (match) {
    case '\\{':
      return '{';
    case '\\}':
      return '}';
    default:
      return get(testCase, paths) || '{' + paths + '}';
    }
  });
}

function get(values, name) {
  var i, n, path, paths, node;

  node = values;
  paths = name.split('.');
  for (i = 0, n = paths.length; i < n; ++i) {
    path = paths[i];
    node = node[path];
    if (typeof node === 'undefined') {
      return null;
    }
  }
  return JSON.stringify(node);
}

function sandbox(expr, done) {
  return function () {
    var err, result;

    try {
      result = expr.apply(null, arguments);
    } catch (ex) {
      err = ex;
    }
    done(err, result);
  };
}

module.exports = test;
