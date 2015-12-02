# mocha-cases
A tiny mocha test case runner. Suited for simple input to output validation tests.

## Install
```
npm install --save-dev mocha-cases
```

## Usage
```
var test = require('mocha-cases');

var cases = [{
	name: 'should case 1 ...',
	value: 'input value for test',
	expected: 'expected output value',
	error: 'expected error',
	runner: function(value, options) {},	// runner specific to this case
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

## Alternatives

 * [data-driven](https://www.npmjs.com/package/data-driven)
 * [run-mocha-cases](https://www.npmjs.com/package/run-mocha-cases)
 * [mocha-check](https://www.npmjs.com/package/mocha-check)

## License
MIT

## Author
[Amobiz](https://github.com/amobiz)