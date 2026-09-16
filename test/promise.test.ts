import { describe, test as vitest } from "vitest";

import { prepare } from "../src/index";

const test = prepare(vitest);

/**
 * Main test suite for empirical-cases runner functionality.
 */
describe("promises", () => {
  /**
   * Tests verifying Promise-returning asynchronous test runners.
   */
  describe("dealing with promises", () => {
    test([
      {
        name: "should eventually capture fulfilled result",
        value: "the fulfilled value",
        expected: "the fulfilled value",
        runner: (value) => Promise.resolve(value),
      },
      {
        name: "should eventually capture rejected result",
        value: "rejected",
        error: Error,
        runner: () => Promise.reject(new Error()),
      },
      {
        name: "should eventually capture throw as rejected result",
        value: "any value",
        error: Error,
        runner: () => {
          return new Promise(() => {
            throw new Error();
          });
        },
      },
    ]);
  });
});
