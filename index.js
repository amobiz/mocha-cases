'use strict';

var Chai = require('chai'),
	Promised = require("chai-as-promised"),
	expect = Chai.expect,
	_it = it;

Chai.use(Promised);

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
function cases(testCases, runner, options) {
	var prefix, tests, it;

	testCases = Array.isArray(testCases) ? testCases : [testCases];
	tests = filter(only) || filter(skip) || testCases;
	if (typeof runner !== 'function') {
		options = runner;
		runner = noop;
	}
	options = options || {};
	it = options.it || _it;
	prefix = options.prefix || '';
	tests.forEach(runTest);

	function filter(fn) {
		var tests = testCases.filter(fn);
		if (tests.length) {
			return tests;
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
		var expected;
		var to = (testCase.async || options.async) ? 'eventually' : 'to';
		var run = testCase.runner || options.runner || runner;

		if ('values' in testCase) {
			expected = whichExpected(testCase.expected);
			testCase.values.forEach(function (value, i) {
				var _title = title({
					name: testCase.name,
					value: value
				});
				it(prefix + _title, function () {
					expect(run(value, testCase.options))[to].deep.equal(expected(i));
				});
			});
		} else {
			it(prefix + title(testCase), function () {
				if (testCase.error) {
					expect(function () { run(testCase.value, testCase.options); })[to].throw(testCase.error);
				} else if ('value' in testCase) {
					expect(run(testCase.value, testCase.options))[to].deep.equal(testCase.expected);
				}
			});
		}

		function title(testCase) {
			var template = testCase.name;
			return template.replace(INTERPOLATE, function (match, paths) {
				return get(testCase, paths) || '{' + paths + '}';
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
	}

	function get(value, name) {
		var i, n, path, paths = name.split('.');
		for (i = 0, n = paths.length; i < n; ++i) {
			path = paths[i];
			value = value[path];
			if (typeof value === 'undefined') {
				return null;
			}
		}
		return JSON.stringify(value);
	}
}

module.exports = cases;
