/* eslint-env node, mocha */
'use strict';

var Chai = require('chai');
var Promised = require('chai-as-promised');
var expect = Chai.expect;
var _it = it;

var INTERPOLATE = /{([\s\S]+?)}/g;

Chai.use(Promised);

/**
 * Run test runner using given test cases.
 * A tiny mocha test case runner. Suited for simple input to output validation tests.
 *
 * @param testCases {array | object} the test case(s) to verify
 * @param optionalRunner {function} optional, the test runner
 * @param optionalOptions {any} optional, extra value passed to runner
 *
 */
function cases(testCases, optionalRunner, optionalOptions) {
	var it, options, prefix, runner, tests;

	runner = optionalRunner || noop;
	options = optionalOptions || {};

	tests = Array.isArray(testCases) ? testCases : [testCases];
	tests = filter(only) || filter(skip) || tests;
	if (typeof runner !== 'function') {
		options = runner;
		runner = noop;
	}

	it = options.it || _it;
	prefix = options.prefix || '';
	tests.forEach(runTest);

	function filter(fn) {
		var filtered;

		filtered = tests.filter(fn);
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
		var to = (testCase.async || options.async) ? 'eventually' : 'to';
		var run = testCase.runner || options.runner || runner;

		if ('values' in testCase) {
			testMultiValues();
		} else {
			testSingleValue();
		}

		function testMultiValues() {
			var expected;

			expected = whichExpected(testCase.expected);
			testCase.values.forEach(function (value, i) {
				it(prefix + title({ name: testCase.name, value: value }), function () {
					expect(run(value, testCase.options))[to].deep.equal(expected(i));
				});
			});
		}

		function testSingleValue() {
			it(prefix + title(testCase), function () {
				if (testCase.error) {
					expect(expr)[to].throw(testCase.error);
				} else if ('value' in testCase) {
					expect(expr())[to].deep.equal(testCase.expected);
				}

				function expr() {
					return run(testCase.value, testCase.options);
				}
			});
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

		function title(test) {
			return test.name.replace(INTERPOLATE, function (match, paths) {
				return get(test, paths) || '{' + paths + '}';
			});
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
}

module.exports = cases;
