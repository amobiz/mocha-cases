import assert from "node:assert/strict";

import type { UnitCaseContext } from "./types";
import { instanceOf } from "./utility";
import { TestFunction } from "./frameworks";

/** Registers and executes a single test case context using the given test framework runner. */
export function createUnitCaseRunner(run: TestFunction) {
  /**
   * Registers and executes a single test case context using the given or active test framework runner (`it` or `test`).
   *
   * @param ctx The unit case execution context.
   */
  return function runTest<Value, Expected, Actual, Options>(
    ctx: UnitCaseContext<Value, Expected, Actual, Options>,
  ): void {
    run(ctx.name, async function () {
      let actual: Actual | undefined = undefined;
      let thrown: unknown = undefined;
      let didThrow = false;
      try {
        actual = await ctx.runner(ctx.value, ctx.options);
      } catch (error) {
        didThrow = true;
        thrown = error;
      }

      if (ctx.error) {
        if (!didThrow) {
          throw new Error(
            `Unexpected value "${actual}" returned while error "${toErrorMessage(ctx.error)}" expected.`,
          );
        }
        if (typeof ctx.error === "function") {
          assert(
            instanceOf(thrown, ctx.error),
            `Expected error to be an instance of ${ctx.error.name}, but got ${thrown}`,
          );
        } else {
          assert.deepEqual(thrown, ctx.error);
        }
      } else {
        if (didThrow) {
          throw thrown instanceof Error
            ? thrown
            : new Error(`Unexpected error thrown: ${thrown}`);
        }
        assert.deepEqual(actual, ctx.expected);
      }
    });
  };
}

/**
 * Extracts a human-readable message from an error instance, constructor function, or raw value.
 *
 * @param error The thrown error or error descriptor.
 * @returns The extracted error message string.
 */
function toErrorMessage(error: unknown) {
  return instanceOf(error, Error)
    ? error.message
    : typeof error === "function"
      ? error.name
      : String(error);
}
