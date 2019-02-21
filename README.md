# mocha-cases
A tiny mocha test case runner. Suited for simple input to output validation tests.

[![MIT](http://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/amobiz/mocha-cases/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/mocha-cases.svg)](http://badge.fury.io/js/mocha-cases) [![David Dependency Badge](https://david-dm.org/amobiz/mocha-cases.svg)](https://david-dm.org/amobiz/mocha-cases)
[![Build Status](https://travis-ci.org/amobiz/mocha-cases.svg?branch=master)](https://travis-ci.org/amobiz/mocha-cases)

[![NPM](https://nodei.co/npm/mocha-cases.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/mocha-cases.png?downloads=true&downloadRank=true&stars=true) [![NPM](https://nodei.co/npm-dl/mocha-cases.png?months=6&height=3)](https://nodei.co/npm/mocha-cases/)


## Install
``` bash
npm install mocha-cases
```

## Usage

### One case one value
``` javascript
var test = require('mocha-cases');

var cases = [{
  name: 'should {value.text} equal to {expected.text}', // name of the test,
                                                        //   a string, supports nested value interpolation
                                                        //   or a function, takes test value, expected value and options, and returns a string
  value: { text: 'input value' },                       // input value
  expected: { text: 'expected output value' },          // expected output value
  error: RangeError,                                    // expected error value, instance or class
  runner: function (value, options) {},                 // runner specific to this case
  options: {},                                          // options specific to this case
  only: false,                                          // run this case only?
  skip: false,                                          // skip this case?
  errback: false                                        // is the runner using an errback (callback)?
}, {
  name: 'case 2...',
  ...
}];

var options = {
  errback: true,                                        // is all test defaults to errback?
  prefix: ''                                             // prefix to test names
};

function runner(value, options, done) {                 // errback runner takes a `done` callback
  setTimeout(function () {
    done(null, 'expected output value');
  }, 10);
}

describe('module: mocha-cases', function () {
  describe('feature: cases', function () {
    test(cases, runner, options);
  });
});
```

Default pass through runner will be used if no runner provided at all.

### One case vs. multiple values vs. one expected

You can use an array of `values` with a single `expected` value:

``` javascript
describe('prime number', function () {
  test({
    name: 'given prime number {value}, isPrime() returns true',
    values: [2, 3, 5, 7, 11, 13],
    expected: true
  }, isPrime);
});
```

### One case vs. multiple values vs. multiple expected

You can use an array of `values` and an array of `expected` values, to pair multiple given values and expected values:

``` javascript
describe('prime number', function () {
  test({
    name: 'given prime number {value}, isPrime() returns true, false otherwise',
    values:   [2,    3,    4,     5,    6,     7,    8,     9],
    expected: [true, true, false, true, false, true, false, false],
    runner: isPrime
  });
});
```

Or, you can use `cases` to specify multiple cases:

``` javascript
describe('prime number', function () {
  test({
    name: 'isPrime({value}) should be {expected}',
    cases: [{
      value: 2,
      expected: true
    }, {
      value: 3,
      expected: true
    }, {
      value: 4,
      expected: false
    }, {
      value: 5,
      expected: true
    }, {
      value: 6,
      expected: false
    }, {
      value: 7,
      expected: true
    }, {
      value: 8,
      expected: false
    }, {
      value: 9,
      expected: false
    }],
    runner: isPrime
  });
});
```

If your values are simple enougth, you may want to simplify them with a pair of value / expected value for each case:

``` javascript
describe('prime number', function () {
  test({
    name: 'isPrime({value}) should be {expected}',
    cases: [
      [2, true],
      [3, true],
      [4, false],
      [5, true],
      [6, false],
      [7, true],
      [8, false],
      [9, false]
    ],
    runner: isPrime
  });
});
```

## Test
``` bash
$ npm test
```

## Alternatives

 * [data-driven](https://www.npmjs.com/package/data-driven)
 * [run-mocha-cases](https://www.npmjs.com/package/run-mocha-cases)
 * [mocha-check](https://www.npmjs.com/package/mocha-check)

## Change Logs

* 2019/02/22 - 0.3.0

  * Feature: Allow escaping the brace characters `{` and `}` with `\\`.
  * Feature: Allow entries of `cases` be an object.

* 2018/01/23 - 0.2.1

  * Feature: Accept function for test name
  * Feature: Add default pass through runner

* 2018/01/14 - 0.2.0

  * NPM: Bump version, update readme and publish to npm.js.

* 2017/12/07 - 0.1.11

  * Feature: New format for adding test-cases.

* 2016/01/08 - 0.1.10

  * Feature: Allow `error` to be an `Error` instance, a class or a normal value.
  * Feature: Allow test case negate `errback` option that enabled by overall options.

* 2016/01/07 - 0.1.9

  * Feature: Deprecate the `async` option. For sync/async runner that returning value, i.e. primitive value, promise, stream or observable, you don't have to add any option. For async runner that use errback (callback), you need to add `errback` option.

* 2016/01/06 - 0.1.8

  * Feature: Replace `chai-as-promised` with `async-done`. Now async runner can use callback or return promise, stream or observable.

* 2015/12/24 - 0.1.6

  * NPM: Update npm settings.

* 2015/12/16 - 0.1.5

  * Bug Fix: Fix error when expected values array contains falsy value.

* 2015/12/07 - 0.1.4

  * NPM: Move mocha from "dependencies" to "peerDependencies".

* 2015/12/03 - 0.1.3

  * Feature: Allow multiple values in one case using "values" keyword.

* 2015/12/03 - 0.1.1

  * Feature: Make runner optional, or can be defined either in global options or case options.
  * Feature: Allow value interpolation in test name.

* 2015/11/23 - 0.1.0

  * First release.

## License
MIT

## Author
[Amobiz](https://github.com/amobiz)

## Contributor
[Ivan Sosnin](https://github.com/vansosnin)
