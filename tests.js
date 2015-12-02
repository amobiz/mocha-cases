/*global describe:false, it:true */
'use strict';

var Chai = require('chai'),
	expect = Chai.expect,
	_it = it;

var test = require('./');

describe('mocha-cases', function () {
	describe('value interpolate', function () {
		var cases = [{
			name: "should resolve top level value: {value}",
			value: 520,
			expected: null,
			options: {
				expected: "should resolve top level value: 520"
			}
		}, {
			name: "should resolve nested value: {value.nested}",
			value: { nested: 1024 },
			expected: null,
			options: {
				expected: "should resolve nested value: 1024"
			}
		}, {
			name: "should not replace if value not resolved: {value.not.resolvable}",
			value: {},
			expected: null,
			options: {
				expected: "should not replace if value not resolved: {value.not.resolvable}"
			}
		}, {
			name: "should resolve top level expected value: {expected}",
			value: null,
			expected: 333,
			options: {
				expected: "should resolve top level expected value: 333",
			}
		}, {
			name: "should resolve nested expected value: {expected.nested}",
			value: null,
			expected: { nested: 999 },
			options: {
				expected: "should resolve nested expected value: 999"
			}
		}, {
			name: "should not replace if expected value not resolved: {expected.not.resolvable}",
			value: null,
			expected: {},
			options: {
				expected: "should not replace if expected value not resolved: {expected.not.resolvable}"
			}
		}];

		cases.forEach(runTest);

		function runTest(testCase) {
			var options = {
				it: function(actualName, runner) {
					_it(actualName, function () {
						expect(actualName).to.equal(testCase.options.expected);
					});
				}
			};
			test([testCase], options);
		}
	});
});