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
 * @param testCases
 * @param runner
 * @param options
 *
 *
 * @sample
 *
 *   var test = require('mocha-cases');
 *
 *   var cases = [{
 *       name: 'should ...',
 *       value: 'input value for test',
 *       expected: 'expected output value',
 *       error: 'expected error',
 *       runner: function(value, options) {},	// runner specific to this case
 *       options: {},							// options specific to this case
 *       async: false,							// is this an async test? i.e. returning a promise?
 *       only: false,							// run this case only?
 *       skip: false							// skip this case?
 *   }, {
 *       ...
 *   }];
 *
 *   var options = {
 *		 async: false,							// default async option
 * 	     prefix: ''								// prefix to test names
 *   };
 *
 *   function runner(value, options) {
 *    	 return 'expected output value';
 *   }
 *
 *   describe('module: mocha-cases', function () {
 *	     describe('feature: cases', function () {
 *		     test(cases, runner, options);
 *		 });
 *	 });
 *
 */
function cases(testCases, runner, options) {
	var prefix, tests, it;

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
		it(prefix + title(testCase), function () {
			var to = (testCase.async || options.async) ? 'eventually' : 'to';
			var run = testCase.runner || options.runner || runner;
			if (testCase.error) {
				expect(function () { run(testCase.value, testCase.options); })[to].throw(testCase.error);
			} else {
				expect(run(testCase.value, testCase.options))[to].deep.equal(testCase.expected);
			}
		});

		function title(testCase) {
			var template = testCase.name;
			return template.replace(INTERPOLATE, function (match, paths) {
				return get(testCase, paths) || '{' + paths + '}';
			});
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
		return value;
	}
}

module.exports = cases;
