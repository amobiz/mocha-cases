import { interpolate } from "./interpolation";
import type {
  TestCase,
  TestNameResolver,
  TestRunner,
  TestSuiteOptions,
  TestWithCases,
  UnitCase,
  UnitCaseContext,
} from "./types";
import { toMapper } from "./utility";

/**
 * Generator function that flattens test suite cases into individual unit case execution contexts.
 *
 * @param suiteCases The array of test cases to expand.
 * @param suiteRunner Runner function to execute for each test case.
 * @param suiteOptions Suite-level configuration options.
 * @yields UnitCaseContext for each individual test unit to execute.
 */
export function* iterateUnitCases<Value, Expected, Actual, Options>(
  suiteCases: TestCase<Value, Expected, Actual, Options>[],
  suiteRunner: TestRunner<Value, Actual, Options>,
  suiteOptions: TestSuiteOptions<Value, Actual, Options>,
): Generator<UnitCaseContext<Value, Expected, Actual, Options>> {
  for (const theCase of suiteCases) {
    const runner = theCase.runner || suiteOptions.runner || suiteRunner;
    const errback =
      theCase.errback || suiteOptions.errback || runner.length >= 3;
    const prefix = suiteOptions.prefix || "";

    for (const unitCase of normalizeCase(theCase)) {
      yield resolveContext(unitCase, prefix, theCase.name, runner, errback);
    }
  }
}

/**
 * Normalizes any test case variant (`cases`, `values`, or single `value`)
 * into a uniform sequence of {@link UnitCase} objects.
 */
function* normalizeCase<Value, Expected, Actual, Options>(
  theCase: TestCase<Value, Expected, Actual, Options>,
): Generator<UnitCase<Value, Expected, Options>> {
  const getError = toMapper(theCase.error);

  if ("cases" in theCase) {
    for (const [index, data] of theCase.cases.entries()) {
      yield {
        ...toCasePair(data),
        error: getError(index),
        options: theCase.options,
      };
    }
  } else if ("values" in theCase) {
    const getExpected = toMapper(theCase.expected);
    for (const [index, value] of theCase.values.entries()) {
      yield {
        value,
        expected: getExpected(index),
        error: getError(index),
        options: theCase.options,
      };
    }
  } else {
    yield {
      value: theCase.value,
      expected: theCase.expected,
      error: theCase.error,
      options: theCase.options,
    };
  }
}

/**
 * Constructs a UnitCaseContext by resolving the test title and promisifying the runner.
 *
 * @param unitCase The unit case data.
 * @param prefix Prefix string prepended to the title.
 * @param templateOrResolver Title template string or name resolver function.
 * @param runner The test runner function.
 * @param errback Whether the runner expects a callback (`done`).
 * @returns A fully resolved unit case context ready for execution.
 */
function resolveContext<Value, Expected, Actual, Options>(
  unitCase: UnitCase<Value, Expected, Options>,
  prefix: string,
  templateOrResolver: string | TestNameResolver<Value, Expected, Options>,
  runner: TestRunner<Value, Actual, Options>,
  errback: boolean,
): UnitCaseContext<Value, Expected, Actual, Options> {
  return {
    ...unitCase,
    name: `${prefix}${resolveTestName(unitCase, templateOrResolver)}`,
    runner: promisify(runner, errback),
  };
}

/**
 * Resolves the test title by invoking a custom resolver function or interpolating placeholders.
 *
 * @param unitCase The unit case data.
 * @param templateOrResolver Title template string or resolver function.
 * @returns The formatted title string.
 */
function resolveTestName<Value, Expected, Options>(
  unitCase: UnitCase<Value, Expected, Options>,
  templateOrResolver: string | TestNameResolver<Value, Expected, Options>,
): string {
  if (typeof templateOrResolver === "string") {
    return interpolate(templateOrResolver, unitCase);
  }

  if (typeof templateOrResolver === "function") {
    return templateOrResolver(unitCase);
  }

  throw new TypeError(
    `Expected 'name' to be a string or function, but got ${typeof templateOrResolver}`,
  );
}

/**
 * Normalizes a case entry from a tuple `[value, expected]` to object `{ value, expected }`.
 *
 * @param cases The tuple or object case representation.
 * @returns An object with `value` and `expected` properties.
 */
function toCasePair<Value, Expected>(
  cases: TestWithCases<Value, Expected, unknown, unknown>["cases"][number],
): { value: Value; expected: Expected } {
  return Array.isArray(cases) ? { value: cases[0], expected: cases[1] } : cases;
}

/**
 * Adapts a synchronous, Promise-returning, or callback-taking runner into a unified Promise-returning function.
 *
 * @param runner The runner function to adapt.
 * @param errback Whether the runner uses callback/errback style.
 * @returns A promisified runner function.
 */
function promisify<Value, Actual, Options>(
  runner: TestRunner<Value, Actual, Options>,
  errback: boolean,
) {
  if (errback) {
    return function callback(value: Value, options?: Options) {
      return new Promise<Actual>((resolve, reject) => {
        try {
          runner(value, options, (error, actual) => {
            if (error) {
              reject(error);
            } else {
              resolve(actual as Actual);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    };
  }
  return async function returning(value: Value, options?: Options) {
    return runner(value, options, () => {
      throw new Error(
        "A non‑callback runner must not invoke the `done` callback.",
      );
    }) as Actual;
  };
}
