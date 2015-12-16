# mocha-cases
A tiny mocha test case runner. Suited for simple input to output validation tests.

## Install
``` bash
npm install --save-dev mocha-cases
```

## Usage

### One case one value
``` javascript
var test = require('mocha-cases');

var cases = [{
	name: 'should {value.text} equal to {expected.text}, supports nested value interpolation',
	value: { text: 'input value for test' },
	expected: { text: 'expected output value' },
	error: 'expected error',
	runner: function (value, options) {},	// runner specific to this case
	options: {},							// options specific to this case
	async: false,							// is this an async test? i.e. returning a promise?
	only: false,							// run this case only?
	skip: false								// skip this case?
}, {
	name: 'case 2...',
	...
}];

var options = {
	async: false,							// default async option
	prefix: ''								// prefix to test names
};

function runner(value, options) {
	return 'expected output value';
}

describe('module: mocha-cases', function () {
	describe('feature: cases', function () {
		test(cases, runner, options);
	});
});
```

### One case vs. multiple values vs. one expected
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

## Test
``` bash
$ npm test
```

## Alternatives

 * [data-driven](https://www.npmjs.com/package/data-driven)
 * [run-mocha-cases](https://www.npmjs.com/package/run-mocha-cases)
 * [mocha-check](https://www.npmjs.com/package/mocha-check)

## Change Logs

* 2015/12/16 - 0.1.5

  * Bug fix: fix error when expected values array contains falsy value.

* 2015/12/07 - 0.1.4

  * Move mocha from "dependencies" to "peerDependencies".

* 2015/12/03 - 0.1.3

  * Allow multiple values in one case using "values" keyword.

* 2015/12/03 - 0.1.1

  * Make runner optional, or can be defined either in global options or case options.
  * Allow value interpolation in test name.

* 2015/11/23 - 0.1.0

  * First release.

## License
MIT

## Author
[Amobiz](https://github.com/amobiz)