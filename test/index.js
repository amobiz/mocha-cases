/* eslint no-undefined: 0 */
'use strict';

var expect = require('chai').expect;
var _it = it;

var test = require('../');

describe('mocha-cases', function () {
	describe('dealing with single test value', function () {
		var cases = [{
			name: 'should handle single expected value',
			value: 7,
			expected: 14,
			runner: function (value) {
				return value * 2;
			}
		}, {
			name: 'should handle exception',
			value: 'oops!',
			error: Error,
			runner: function (value) {
				if (value === 'oops!') {
					throw new Error(value);
				}
			}
		}];

		test(cases);
	});
	describe('dealing with miltiple test values', function () {
		var cases = [{
			name: 'should handle single expected value',
			values: [2, 4, 6, 8, 10],
			expected: 0,
			runner: function (value) {
				return value % 2;
			}
		}, {
			name: 'should handle miltiple expected values',
			values:   [3, 0, false, undefined, null, [], {}, ''],
			expected: [3, 0, false, undefined, null, [], {}, ''],
			runner: function echo(value) {
				return value;
			}
		}];

		test(cases);
	});
	describe('dealing value interpolating', function () {
		var cases = [{
			name: 'should resolve top level value: {value}',
			value: 520,
			expected: null,
			options: {
				expected: 'should resolve top level value: 520'
			}
		}, {
			name: 'should resolve nested value: {value.nested}',
			value: { nested: 1024 },
			expected: null,
			options: {
				expected: 'should resolve nested value: 1024'
			}
		}, {
			name: 'should not replace if value not resolved: {value.not.resolvable}',
			value: {},
			expected: null,
			options: {
				expected: 'should not replace if value not resolved: {value.not.resolvable}'
			}
		}, {
			name: 'should resolve top level expected value: {expected}',
			value: null,
			expected: 333,
			options: {
				expected: 'should resolve top level expected value: 333'
			}
		}, {
			name: 'should resolve nested expected value: {expected.nested}',
			value: null,
			expected: { nested: 999 },
			options: {
				expected: 'should resolve nested expected value: 999'
			}
		}, {
			name: 'should not replace if expected value not resolved: {expected.not.resolvable}',
			value: null,
			expected: {},
			options: {
				expected: 'should not replace if expected value not resolved: {expected.not.resolvable}'
			}
		}];

		cases.forEach(runTest);

		function runTest(testCase) {
			var options;

			options = {
				it: function (actualName) {
					_it(actualName, function () {
						expect(actualName).to.equal(testCase.options.expected);
					});
				}
			};
			test([testCase], options);
		}
	});
});
