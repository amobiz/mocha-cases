/* eslint-env node, mocha */
'use strict';

var async = require('async-done');
var expect = require('chai').expect;
var _it = it;

var INTERPOLATE = /{([\s\S]+?)}/g;

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
	var it, prefix, cases;

	if (runner && typeof runner !== 'function') {
		return test(testCases, noop, runner);
	} else if (!options) {
		return test(testCases, runner, {});
	}

	it = options.it || _it;
	prefix = options.prefix || '';
	cases = Array.isArray(testCases) ? testCases : [testCases];
	cases = filter(only) || filter(skip) || cases;
	cases.forEach(runTest);

	function filter(fn) {
		var filtered;

		filtered = cases.filter(fn);
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

	function noop() {
	}

	function runTest(testCase) {
		var run = testCase.runner || options.runner || runner;

		if ('values' in testCase) {
			testMultiValues();
		} else {
			testSingleValue(testCase);
		}

		function testMultiValues() {
			var expected;

			expected = whichExpected(testCase.expected);
			testCase.values.forEach(function (value, i) {
				testSingleValue({
					name: testCase.name,
					value: value,
					expected: expected(i),
					error: testCase.error,
					options: testCase.options,
					errback: testCase.errback
				});
			});
		}

		function testSingleValue(theCase) {
			it(prefix + title(), function (done) {
				if (theCase.errback || options.errback) {
					run(theCase.value, theCase.options, sandbox(verify, done));
				} else {
					async(function (asyncDone) {
						var actual;

						actual = run(theCase.value, theCase.options);
						if (actual && typeof (actual.on || actual.subscribe || actual.then) === 'function') {
							return actual;
						}
						asyncDone(null, actual);
					}, sandbox(verify, done));
				}
			});

			function title() {
				return theCase.name.replace(INTERPOLATE, function (match, paths) {
					return get(theCase, paths) || '{' + paths + '}';
				});
			}

			function verify(err, actual) {
				if (theCase.error) {
					if (err instanceof Error) {
						expect(err).to.be.instanceof(theCase.error);
					} else {
						expect(err).to.deep.equal(theCase.error);
					}
				} else {
					expect(actual).to.deep.equal(theCase.expected);
				}
			}
		}

		function whichExpected(expected) {
			if (Array.isArray(expected)) {
				return function (index) {
					return expected[index];
				};
			}
			return function () {
				return expected;
			};
		}
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
}

module.exports = test;
