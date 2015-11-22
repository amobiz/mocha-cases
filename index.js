'use strict';

var Chai = require('chai'),
	Promised = require("chai-as-promised"),
	expect = Chai.expect;

Chai.use(Promised);

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
 *       title: 'should ...',
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
    var prefix, tests;

	tests = filter(only) || filter(skip) || testCases;
	options = options || {};
	prefix = options.prefix || '';
    tests.forEach(function (testCase) {
        it(prefix + testCase.name, function () {
            var to = (testCase.async || options.async) ? 'eventually' : 'to';
			var run = testCase.runner || runner;
            if (testCase.error) {
                expect(function () { run(testCase.value, testCase.options); })[to].throw(testCase.error);
            } else {
                expect(run(testCase.value, testCase.options))[to].deep.equal(testCase.expected);
            }
        });
    });

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
}

module.exports = cases;
