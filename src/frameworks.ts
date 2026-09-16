// Shared type definitions for compatibility with Mocha, Jest, and similar test frameworks.

export type TestFunction = (
  title: string,
  fn: TestFn,
  timeout?: number,
) => void;

type TestFn =
  | PromiseReturningTestFn
  | GeneratorReturningTestFn
  | DoneTakingTestFn;

type DoneTakingTestFn = (
  this: TestContext,
  done: DoneFn,
) => ValidTestReturnValues;
type DoneFn = (reason?: Error) => void;

type PromiseReturningTestFn = (this: TestContext) => TestReturnValue;
type TestReturnValue = ValidTestReturnValues | TestReturnValuePromise;
type ValidTestReturnValues = void | undefined;
type TestReturnValuePromise = Promise<unknown>;

type GeneratorReturningTestFn = (this: TestContext) => TestReturnValueGenerator;
type TestReturnValueGenerator = Generator<void, unknown, void>;

type TestContext = Record<string, unknown>;

declare global {
  var it: TestFunction | undefined;
  var test: TestFunction | undefined;
}

/**
 * Detects the globally available test function (`it` for Mocha/BDD, `test` for  vitest or Jest/TDD).
 *
 * @throws {ReferenceError} If neither `it` nor `test` is defined in global scope.
 * @returns The global test function.
 */
export function getGlobalTestFunction(): TestFunction {
  if (typeof globalThis.test === "function") {
    return globalThis.test as TestFunction;
  }
  if (typeof globalThis.it === "function") return globalThis.it as TestFunction;
  throw new ReferenceError(
    "empirical-cases requires global `it` or `test` to be defined globally or passed via options.it or prepared by calling prepare()",
  );
}
