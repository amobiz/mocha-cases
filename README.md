# empirical-cases

A lightweight, intuitive, straightforward, yet flexible data‑driven test runner, compatible with Vitest, Jest, Mocha and any framework that provides similar test function. It simplifies input‑to‑output validation with numerous test styles that fit your data. It supports synchronous, Promise‑based, and callback (errback) runners.

![npm](https://shieldcn.dev/group/npm/license/empirical-cases+/npm/empirical-cases+npm/dw/empirical-cases+github/amobiz/empirical-cases/stars.svg)

## Install

```bash
npm install --save-dev empirical-cases
```

## Getting Started

For test frameworks such as Jest and Mocha that provide global APIs (such as `describe`, `it`, and `test`), The empirical-cases package can automatically identify the test function being used. All you need to do is import the `test` function from the empirical-cases package and use it in place of the test function (i.e., `it` or `test`) provided by your test framework.

```typescript
import test from "empirical-cases";

describe("simple test cases", () => {
  test({
    name: "my first test case",
    ...
  });
});
```

However, for modern test frameworks that do not provide global APIs by default, you need to configure the empirical-cases package for the framework first:

```typescript
import { prepare } from "empirical-cases";
import { describe, test as it } from "vitest";

//  prepare empirical-cases for vitest
const test = prepare(it);

describe("simple test cases", () => {
  test({
    name: "my first test case",
    ...
  });
});
```

Create a basic test suite with a runner wrapping the function you want to test:

```typescript
import { prepare } from "empirical-cases";
import { describe, test as it } from "vitest";

// prepare empirical-cases for vitest
const test = prepare(it);

// the function you want to test.
function sum(...nums: number[]) {
  return nums.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
}

describe("simple test cases", () => {
  test(
    {
      // test title (supports {value}, {expected}, {error} and {options} interpolation)
      name: "sum of {value} equals to {expected}",
      // test cases to run
      cases: [
        {
          // input value passed to the runner
          value: [1776, 250],
          // expected output to compare against
          expected: 2026,
        },
        {
          value: [1989, 64, 89 * 64, 9 * 9 * 5 * 3],
          expected: 8964,
        },
        {
          value: [2, 3, 5, 7, 11, 13],
          expected: 41,
        },
      ],
    },
    // runner wrapping the function under test
    (value) => sum(...value),
  );
});
```

## Core Features

- **Lightweight** - no external dependencies; uses only Node.js's built-in `assert` module.
- **Template interpolation** – write test names like `should {value.a} + {value.b} be {expected.result}`.
- **Flexible case definitions** – express test cases that fit your data with flexibility and without redundancy.
- **Synchronous and asynchronous runners** – supports synchronous, Promise-based, and errback (callback) runners; choose the style that matches your code.
- **Selective execution** – `only` and `skip` flags let you focus on specific cases.

## Template interpolation

Empirical-cases support template interpolation. You can include `{value}`, `{expected}` and `{error}` in title to express the purpose of the test case more clearly.

You can also use dot notation to refer properties of your value like this: `{value.person.age}`. Also, you can add `prefix` to prepend a common title to each case in options.

```typescript
describe("template interpolation", () => {
  test(
    {
      name: "{value.a} + {value.b} equals to {expected.result}",
      value: { a: 5, b: 7 },
      expected: { result: 12 },
    },
    (value) => ({ result: sum(value.a, value.b) }),
    {
      prefix: "sum(): ",
    },
  );
});
```

If template interpolation is not enough, you can provide a name resolver function to perform complex transformations.

```typescript
describe("name resolver", () => {
  test(
    {
      name: ({ value, expected, options }) => {
        let timestamp = options?.timestamp ? ` (${String(Date.now())})` : "";
        return `${value.a} + ${value.b} equals to ${expected!.result}.${timestamp}`;
      },
      value: { a: 5, b: 7 },
      expected: { result: 12 },
      options: {
        timestamp: true,
      },
    },
    (value) => ({ result: sum(value.a, value.b) }),
    {
      prefix: "sum(): ",
    },
  );
});
```

## Flexible case definitions

Empirical-cases supports flexible case definitions, you can express numerous test styles that fit your data without redundancy.

### Map each one value to one expected value

```typescript
describe("map each one value to one expected", () => {
  test(
    [
      {
        name: "{value} is prime number: {expected}",
        value: 2,
        expected: true,
      },
      {
        name: "{value} is non-prime number: {expected}",
        value: 4,
        expected: false,
      },
    ],
    isPrime,
  );
});
```

### Map multiple values to one expected value

```typescript
describe("map multiple values to single expected", () => {
  test(
    [
      {
        name: "Is {value} a prime number? → {expected}",
        values: [2, 3, 5, 7],
        expected: true,
      },
      {
        name: "Is {value} a prime number? → {expected}",
        values: [4, 9, 15, 27],
        expected: false,
      },
    ],
    isPrime,
  );
});
```

### Pair multiple given values and expected values

You can use an array of `values` and an array of `expected` values, to pair multiple given values and expected values:

```typescript
describe("pair multiple given values and expected values using `values` keyword", () => {
  test(
    {
      name: "Is {value} a prime number? → {expected}",
      values: [2, 4, 6, 8],
      expected: [true, false, false, false],
    },
    isPrime,
  );
});
```

Alternatively, if you prefer to pair each value with its corresponding expected value, you can use the `cases` keyword:

```typescript
describe("pair multiple given values and expected values using `cases` keyword", () => {
  test(
    {
      name: "Is {value} a prime number? → {expected}",
      cases: [
        { value: 2, expected: true },
        { value: 4, expected: false },
        { value: 5, expected: true },
      ],
    },
    isPrime,
  );
});
```

If your values are simple enough, you can simplify them further by using a tuple containing the value and its expected value for each case:

```typescript
describe("pair multiple given values and expected values using `cases` keyword", () => {
  test(
    {
      name: "Is {value} a prime number? → {expected}",
      cases: [
        [2, true],
        [4, false],
        [5, true],
      ],
    },
    isPrime,
  );
});
```

### Expecting error

You can use the `error` keyword to indicate that a test case is expected to throw an error:

```typescript
describe("expect error", function () {
  test(
    {
      name: "should throw if value is not an natural number",
      value: 3.14,
      error: Error,
    },
    isPrime,
  );
});
```

### Synchronous and asynchronous runner

#### Using async function

```typescript
async function isPrimeAsync(value: number) {
  return isPrime(value);
}

describe("asynchronous runner using async function", () => {
  test(
    {
      name: "Is {value} a prime number?  → {expected}",
      value: 6,
      expected: false,
    },
    isPrimeAsync,
  );
});
```

#### Using Promise

```typescript
function isPrimePromise(value: number) {
  return new Promise((resolve) => {
    resolve(isPrime(value));
  });
}

describe("asynchronous runner using Promise", () => {
  test(
    {
      name: "Is {value} a prime number ? → {expected}",
      value: 3,
      expected: true,
    },
    isPrimePromise,
  );
});
```

#### Using errback (callback)

By adding THREE arguments to a test runner (i.e. with signature `(value, options, done) => void`), the empirical-cases package will know that it should wait for the `done` function to be called to complete the test. The `done` callback has signature `(error, actual) => void`, it accepts an `Error` instance or `string` describing the error. If the runner finished successfully without error, your pass `undefined` or `null` via the `error` argument and the result via the `actual` argument.

```typescript
function isPrimeCallback(value, options, done) {
  setTimeout(() => {
    // assume isPrime() can throw error
    try {
      done(undefined, isPrime(value));
    } catch (error) {
      done(error);
    }
  }, 10);
}

describe("asynchronous runner using errback (callback)", () => {
  test(
    {
      name: "Is {value} a prime number ? → {expected}",
      value: 3,
      expected: true,
    },
    isPrimeCallback,
  );
});
```

Empirical-cases auto-detects your callback runner function as long as it has the signature `(value, options, done) => void`, in which case the `errback` option is not required. But if you use a rest parameter (e.g. `(...args) => void`) or default parameters (e.g. `(value, options = {}, done) => void`), you must include `{ errback: true }` in your test case or test suite options:

```typescript
function isPrimeCallbackWithRestParameter(...args: any[]) {
  const [value, _options, done] = args;
  setTimeout(() => {
    done(undefined, isPrime(value));
  }, 10);
}

describe("asynchronous runner using errback (callback) with rest parameter", () => {
  test(
    {
      name: "Is {value} a prime number ? → {expected}",
      value: 3,
      expected: true,
    },
    {
      runner: isPrimeCallbackWithRestParameter,
      errback: true,
    },
  );
});
```

### Per-case runner

You can configure a different runner for each test case.

```typescript
describe("per-case runner", function () {
  test([
    {
      name: "Is {value} a prime number? → {expected}",
      cases: [
        { value: 2, expected: true },
        { value: 4, expected: false },
        { value: 5, expected: true },
      ],
      runner: isPrime,
    },
    {
      name: "Is {value} a prime number? → {expected}",
      cases: [
        { value: 2, expected: true },
        { value: 4, expected: false },
        { value: 5, expected: true },
      ],
      runner: isPrimeCallbackWithRestParameter,
      errback: true,
    },
  ]);
});
```

## Selective execution

When adding a new test case or debugging a specific one, use the `only` or `skip` options to focus on it.

```typescript
describe("selective execution", () => {
  test([
    {
      name: "Is {value} a prime number? → {expected}",
      cases: [
        { value: 2, expected: true },
        { value: 4, expected: false },
        { value: 5, expected: true },
      ],
      runner: isPrime,
    },
    {
      name: "Is {value} a prime number? → {expected}",
      cases: [
        { value: 2, expected: true },
        { value: 4, expected: false },
        { value: 5, expected: true },
      ],
      runner: isPrimeCallbackWithRestParameter,
      errback: true,
      only: true,
    },
  ]);
});
```

## Support test frameworks that do not provide global APIs

As long as your preferred test framework provides a test function with a `(title, testFn): void` signature, you can use empirical-cases with it.

```typescript
import { prepare } from "empirical-cases";
import { test as it } from "my-prefered-test-framework";

const test = prepare(it);

describe("prepare test framework that does not provide global APIs", () => {
  test({
    name: "Is {value} a prime number? → {expected}",
    cases: [
      { value: 2, expected: true },
      { value: 4, expected: false },
      { value: 5, expected: true },
    ],
    runner: isPrime,
  });
});
```

For backward compatibility, passing the test function through the `it` suite options is still supported:

```typescript
import test from "empirical-cases";
import { test as it } from "my-prefered-test-framework";

describe("support test framework that does not provide global APIs via suite options", () => {
  test(
    {
      name: "Is {value} a prime number? → {expected}",
      cases: [
        { value: 2, expected: true },
        { value: 4, expected: false },
        { value: 5, expected: true },
      ],
      runner: isPrime,
    },
    {
      it,
    },
  );
});
```

## API

### Main function

The empirical-cases package exports its main test function with the following overloaded signatures:

```typescript
function test<Value, Expected, Actual = Expected, Options = unknown>(
  aTestSuite: TestSuite<Value, Expected, Actual, Options>,
  aTestSuiteOptions?: TestSuiteOptions<Value, Actual, Options>,
): void;

function test<Value, Expected, Actual = Expected, Options = unknown>(
  aTestSuite: TestSuite<Value, Expected, Actual, Options>,
  aTestRunner?: TestRunner<Value, Actual, Options>,
  aTestSuiteOptions?: TestSuiteOptions<Value, Actual, Options>,
): void;
```

That is, you can run a test suite in any of the following fashion:

```typescript
test(aTestSuite);
test(aTestSuite, aTestRunner);
test(aTestSuite, aTestSuiteOptions);
test(aTestSuite, aTestRunner, aTestSuiteOptions);
```

### TestSuiteOptions

The parameter `aTestSuiteOptions` has the following type definition:

```typescript
export type TestSuiteOptions<Value, Actual, Options> = {
  /** Default test runner function used when a test case does not define its own. */
  runner?: TestRunner<Value, Actual, Options>;
  /** Whether the runner uses a callback (`done`) instead of returning a value or Promise. */
  errback?: boolean;
  /** Custom test function to register other test framework. */
  it?: TestFunction;
  /** Prepended a string to all test titles in this suite. */
  prefix?: string;
};
```

### TestRunner

A test `runner` is the function that executes a test. It can be the function under test directly, provided its signature matches `TestRunner<Value, Actual, Options>`. Otherwise, wrap it in a glue function. `TestRunner` has the following type definition:

```typescript
/**
 * The function under test. Can return a value synchronously, return a Promise, or invoke a `done` callback.
 *
 * @template Value The input value type.
 * @template Actual The actual output value type.
 * @template Options Custom options you pass extra data to.
 * @param value The input value for this test case.
 * @param options Optional custom options for this test case.
 * @param done Callback function for callback-based asynchronous test runners.
 * @returns The expected result, a Promise resolving to it, or void when using the `done` callback.
 */
export type TestRunner<Value, Actual, Options = unknown> = (
  value: Value,
  options: Options | null | undefined,
  done: Done<Actual>,
) => Actual | Promise<Actual> | void;
```

The `options` parameter corresponds to the `options` property you include in a test case (`TestCase`), and is only provided when specified in the test case.

Include the `done` parameter **only** when your runner uses errback (callback) style. The `done` callback has the following signature:

```typescript
/**
 * Callback invoked by callback-based test runners upon completion.
 *
 * @template Actual The actual output value type.
 * @param error Error or error message if the runner failed, or null/undefined on success.
 * @param actual The resulting output value on success.
 */
export type Done<Actual = unknown> = (
  error: Error | string | null | undefined,
  actual?: Actual,
) => void;
```

If your errback runner does not have exactly three parameters (e.g. it uses rest parameters or default parameters), add `errback: true` to the `aTestSuiteOptions` or include it in the test case data, alongside the runner function.

Although passing arrow functions (lambdas) directly to Mocha or Jest is discouraged — because they lexically bind `this` and cannot access the framework context — passing them to empirical-cases is perfectly fine, since empirical-cases does not bind `this`.

For backward compatibility, a default pass-through runner will be used if no runner is provided at all.

### TestCase

The parameter `aTestSuite` is an instance of type `TestCase` or an array of `TestCase` and has the following type definition:

```typescript
/**
 * Union of all supported test case formats:
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the runner.
 */
export type TestCase<Value, Expected, Actual = Expected, Options = unknown> =
  | TestWithCases<Value, Expected, Actual, Options>
  | TestWithValues<Value, Expected, Actual, Options>
  | TestWithValue<Value, Expected, Actual, Options>;
```

`TestCase` has three variants, each offering a different style to express your test data:

#### Many to many mapping

```typescript
type TestWithCases<Value, Expected, Actual, Options> = {
  /** Test title template string (supports `{value}` and `{expected}` interpolation) or a resolver function. */
  name: string | TestNameResolver<Value, Expected, Options>;
  /** Case-specific test runner function. */
  runner?: TestRunner<Value, Actual, Options>;
  /** Explicitly flag whether this case's runner uses a callback (`done`). */
  errback?: boolean;
  /** Custom options passed to the runner for this case. */
  options?: Options;
  /** Array of `{ value, expected }` objects or `[value, expected]` tuples. */
  cases:
    | Array<{
        value: Value;
        expected: Expected;
      }>
    | Array<[Value, Expected]>;
  /** Optional expected error for all sub-cases in this group. */
  error?: ErrorClass | Error | string | null | undefined;
  /** Run only the first case marked with `only`. */
  only?: boolean;
  /** Skip running this test case. */
  skip?: boolean;
};
```

#### Many to many or many to one mapping

```typescript
type TestWithValues<Value, Expected, Actual, Options> = {
  /** Test title template string (supports `{value}` and `{expected}` interpolation) or a resolver function. */
  name: string | TestNameResolver<Value, Expected, Options>;
  /** Case-specific test runner function. */
  runner?: TestRunner<Value, Actual, Options>;
  /** Explicitly flag whether this case's runner uses a callback (`done`). */
  errback?: boolean;
  /** Custom options passed to the runner for this case. */
  options?: Options;
  /** Array of input values to test. */
  values: Array<Value>;
  /** Expected output: a single value for all inputs, or an array corresponding element-by-element to `values`. */
  expected?: Array<Expected> | Expected;
  /** Expected error(s): a single error for all values, or an array corresponding to `values`. */
  error?:
    | Array<ErrorClass>
    | ErrorClass
    | Array<Error>
    | Error
    | Array<string>
    | string
    | null
    | undefined;
  /** Run only the first case marked with `only`. */
  only?: boolean;
  /** Skip running this test case. */
  skip?: boolean;
};
```

#### One to one mapping

```typescript
type TestWithValue<Value, Expected, Actual, Options> = {
  /** Test title template string (supports `{value}` and `{expected}` interpolation) or a resolver function. */
  name: string | TestNameResolver<Value, Expected, Options>;
  /** Case-specific test runner function. */
  runner?: TestRunner<Value, Actual, Options>;
  /** Explicitly flag whether this case's runner uses a callback (`done`). */
  errback?: boolean;
  /** Custom options passed to the runner for this case. */
  options?: Options;
  /** The input value to test. */
  value: Value;
  /** The expected output value. */
  expected?: Expected;
  /** The expected error. */
  error?: ErrorClass | Error | string | null | undefined;
  /** Run only the first case marked with `only`. */
  only?: boolean;
  /** Skip running this test case. */
  skip?: boolean;
};
```

## Test

Run the library's own test suite:

```bash
pnpm run test
```

## Alternatives

- [data-driven](https://www.npmjs.com/package/data-driven)
- [run‑mocha‑cases](https://www.npmjs.com/package/run-empirical-cases)
- [mocha-check](https://www.npmjs.com/package/mocha-check)

## License

MIT

## Author

[Amobiz](https://github.com/amobiz)

## Contributor

[Ivan Sosnin](https://github.com/vansosnin)
