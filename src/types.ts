import type { TestFunction } from "./frameworks";
import type { MaybeArray } from "./utility";

/**
 * Represents a collection of one or more test cases.
 *
 * @template Value The input value type provided to the test case.
 * @template Expected The expected output value type.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the test runner.
 */
export type TestSuite<
  Value,
  Expected,
  Actual = Expected,
  Options = unknown,
> = MaybeArray<TestCase<Value, Expected, Actual, Options>>;

/**
 * Configuration options for test suite execution.
 *
 * @template Value The input value type provided to the test case.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the test runner.
 */
export type TestSuiteOptions<Value, Actual, Options = unknown> = {
  /** Default test runner function used when a test case does not define its own. */
  runner?: TestRunner<Value, Actual, Options>;
  /** Whether the runner uses a callback (`done`) instead of returning a value or Promise. */
  errback?: boolean;
  /** Custom test function for use with an alternative test framework. */
  it?: TestFunction;
  /** String prepended to all test titles in this suite. */
  prefix?: string;
};

/**
 * Union of all supported test case formats:
 * - {@link TestWithCases}: Sub-cases defined as pairs or objects.
 * - {@link TestWithValues}: Multiple input values paired with one or more expected results.
 * - {@link TestWithValue}: A single input value paired with an expected result or error.
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

/**
 * A custom function that dynamically generates a test title from a unit case.
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Options Custom options passed to the runner.
 * @param unitCase The resolved unit case containing value, expected, error, and options.
 * @returns The formatted test title.
 */
export type TestNameResolver<Value, Expected, Options = unknown> = (
  unitCase: UnitCase<Value, Expected, Options>,
) => string;

/**
 * The test runner function. It may be the function under test directly, or a wrapper around it.
 * Can return a value synchronously, return a Promise, or signal completion via a `done` callback.
 *
 * @template Value The input value type.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the runner.
 * @param value The input value for this test case.
 * @param options Optional custom options for this test case.
 * @param done Callback for signaling completion in callback-based (errback) runners.
 * @returns The actual result, a Promise resolving to it, or void when using the `done` callback.
 */
export type TestRunner<Value, Actual, Options = unknown> = (
  value: Value,
  options: Options | null | undefined,
  done: Done<Actual>,
) => Actual | Promise<Actual> | void;

/**
 * Callback invoked by errback-style test runners to signal completion.
 *
 * @template Actual The actual output value type.
 * @param error The error or error message if the runner failed; `null` or `undefined` on success.
 * @param actual The actual output value on success.
 */
export type Done<Actual> = (
  error: Error | string | null | undefined,
  actual?: Actual,
) => void;

/**
 * A normalized, individual test case ready for execution.
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Options Custom options.
 */
export type UnitCase<Value, Expected, Options> = {
  /** The input value provided to the runner. */
  value: Value;
  /** The expected output value to verify. */
  expected?: Expected;
  /** The expected error (Error class, Error instance, or error message string). */
  error?: ErrorClass | Error | string | null | undefined;
  /** Optional custom options passed to the runner. */
  options?: Options;
};

//#endregion

//#region private types

/**
 * Internal execution context for an individual test case, including resolved name and promisified runner.
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Actual The actual output value type.
 * @template Options Custom options.
 * @param name
 * @param runner
 */
export type UnitCaseContext<Value, Expected, Actual, Options> = UnitCase<
  Value,
  Expected,
  Options
> & {
  /** Resolved test title string */
  name: string;
  /** Resolved case-specific test runner function. */
  runner: (value: Value, options: Options | undefined) => Promise<Actual>;
};

/**
 * A test case defining multiple sub-cases as pairs of `[value, expected]` or `{ value, expected }`.
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the runner.
 */
export type TestWithCases<Value, Expected, Actual, Options> = BaseCase<
  Value,
  Expected,
  Actual,
  Options
> & {
  /** Array of `{ value, expected }` objects or `[value, expected]` tuples. */
  cases:
    | Array<{
        value: Value;
        expected: Expected;
      }>
    | Array<[Value, Expected]>;
  /** Optional expected error for all sub-cases in this group. */
  error?: ErrorClass | Error | string | null | undefined;
};

/**
 * A test case defining multiple input values paired with a single expected value or an array of expected values.
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the runner.
 */
export type TestWithValues<Value, Expected, Actual, Options> = BaseCase<
  Value,
  Expected,
  Actual,
  Options
> & {
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
};

/**
 * A single test case defining one input value and one expected result or error.
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the runner.
 */
export type TestWithValue<Value, Expected, Actual, Options> = BaseCase<
  Value,
  Expected,
  Actual,
  Options
> & {
  /** The input value to test. */
  value: Value;
  /** The expected output value. */
  expected?: Expected;
  /** The expected error. */
  error?: ErrorClass | Error | string | null | undefined;
};

/**
 * Common configuration properties shared across all test case formats.
 *
 * @template Value The input value type.
 * @template Expected The expected output value type.
 * @template Actual The actual output value type.
 * @template Options Custom options passed to the runner.
 */
type BaseCase<Value, Expected, Actual, Options> = TestSwitch & {
  /** Test title template string (supports `{value}` and `{expected}` interpolation) or a resolver function. */
  name: string | TestNameResolver<Value, Expected, Options>;
  /** Case-specific test runner function. */
  runner?: TestRunner<Value, Actual, Options>;
  /** Explicitly flag whether this case's runner uses a callback (`done`). */
  errback?: boolean;
  /** Custom options passed to the runner for this case. */
  options?: Options;
};

/**
 * Flags for selective test execution.
 */
export type TestSwitch = {
  /** Run only the first case marked with `only`. */
  only?: boolean;
  /** Skip running this test case. */
  skip?: boolean;
};

/**
 * Represents an abstract or concrete Error class constructor.
 */
export type ErrorClass = abstract new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: ConstructorParameters<new (...args: any) => Error>
) => Error;
