import type { TestFunction } from "./frameworks";
import { getGlobalTestFunction } from "./frameworks";
import { iterateUnitCases } from "./generator";
import { createUnitCaseRunner } from "./runner";
import type {
  TestSuite,
  TestSuiteOptions,
  TestRunner,
  TestSwitch,
} from "./types";
import { toArray } from "./utility";

export interface TestInterface {
  /**
   * Runs test cases using vitest (or Jest/Mocha/compatible runner) with optional suite options.
   *
   * @template Value Type of test input value.
   * @template Expected Type of expected output.
   * @template Actual Type of actual output.
   * @template Options Type of custom options.
   * @param aTestSuite The test case or array of test cases to verify.
   * @param aTestSuiteOptions Optional suite-level configuration options.
   */
  <Value, Expected, Actual = Expected, Options = unknown>(
    aTestSuite: TestSuite<Value, Expected, Actual, Options>,
    aTestSuiteOptions?: TestSuiteOptions<Value, Actual, Options>,
  ): void;
  /**
   * Runs test cases using vitest (or Jest/Mocha/compatible runner) with a specified runner function and optional suite options.
   *
   * @template Value Type of test input value.
   * @template Expected Type of expected output.
   * @template Actual Type of actual output.
   * @template Options Type of custom options.
   * @param aTestSuite The test case or array of test cases to verify.
   * @param aTestRunner Runner function to execute for each test case.
   * @param aTestSuiteOptions Optional suite-level configuration options.
   */
  <Value, Expected, Actual = Expected, Options = unknown>(
    aTestSuite: TestSuite<Value, Expected, Actual, Options>,
    aTestRunner: TestRunner<Value, Actual, Options>,
    aTestSuiteOptions?: TestSuiteOptions<Value, Actual, Options>,
  ): void;
}

export function prepare(aTestFunction: TestFunction): TestInterface {
  return <Value, Expected, Actual, Options>(
    aTestSuite: TestSuite<Value, Expected, Actual, Options>,
    aTestRunnerOrOptions?:
      | TestRunner<Value, Actual, Options>
      | TestSuiteOptions<Value, Actual, Options>,
    aTestSuiteOptions?: TestSuiteOptions<Value, Actual, Options>,
  ) =>
    testSuite(
      aTestSuite,
      aTestRunnerOrOptions,
      aTestSuiteOptions,
      aTestFunction,
    );
}

export const test: TestInterface = testSuite;

function testSuite<Value, Expected, Actual, Options>(
  aTestSuite: TestSuite<Value, Expected, Actual, Options>,
  aTestRunnerOrOptions?:
    | TestRunner<Value, Actual, Options>
    | TestSuiteOptions<Value, Actual, Options>,
  aTestSuiteOptions?: TestSuiteOptions<Value, Actual, Options>,
  aTestFunction?: TestFunction,
): void {
  const suiteRunner =
    typeof aTestRunnerOrOptions === "function"
      ? aTestRunnerOrOptions
      : passThru;
  const suiteOptions =
    aTestSuiteOptions ||
    (typeof aTestRunnerOrOptions === "function"
      ? undefined
      : aTestRunnerOrOptions) ||
    {};

  const runTest = createUnitCaseRunner(
    suiteOptions.it || aTestFunction || getGlobalTestFunction(),
  );
  const iterator = iterateUnitCases(
    filterCases(toArray(aTestSuite)),
    suiteRunner,
    suiteOptions,
  );

  for (const testCase of iterator) {
    runTest(testCase);
  }
}

/**
 * Filters test cases respecting `only` and `skip` flags.
 *
 * @template T Test case switch type.
 * @param items Array of test cases to filter.
 * @returns Filtered array of test cases to run.
 */
function filterCases<T extends TestSwitch>(items: Array<T>) {
  return filter(only) || filter(skip) || [];

  function filter(fn: (testCase: T) => boolean) {
    const filtered = items.filter(fn);

    if (filtered.length > 0) {
      return filtered;
    }
  }

  function only(item: T) {
    return !!item.only;
  }

  function skip(item: T) {
    return !item.skip;
  }
}

/**
 * Default pass-through runner used when no runner is specified on the case or suite.
 *
 * @param value The input value.
 * @returns The value unchanged as expected output.
 */
function passThru<Value, Actual>(value: Value): Actual {
  return value as unknown as Actual;
}
