import assert from "node:assert/strict";
import { describe, test as vitest } from "vitest";

import { prepare } from "../src/index";

const test = prepare(vitest);

/**
 * Main test suite for empirical-cases runner functionality.
 */
describe("errback", () => {
  const errorInstance = new RangeError();

  /**
   * Tests verifying errback (callback) test runners with done callback.
   */
  describe("dealing with errbacks", () => {
    test([
      {
        name: "should handle successful result",
        value: "the value",
        expected: "the value",
        runner: (value, _, done) => {
          process.nextTick(() => {
            process.nextTick(() => {
              done(undefined, value);
            });
          });
        },
      },
      {
        name: "should handle error result",
        value: "the value",
        error: new Error("rejected"),
        runner: (_, __, done) => {
          process.nextTick(() => {
            done(new Error("rejected"));
          });
        },
      },
      {
        name: "should handle error class",
        value: "the value",
        error: Error,
        runner: (_, __, done) => {
          process.nextTick(() => {
            done(errorInstance);
          });
        },
      },
      {
        name: "should handle error instance",
        value: "the value",
        error: errorInstance,
        runner: (_, __, done) => {
          process.nextTick(() => {
            done(errorInstance);
          });
        },
      },
      {
        name: "should capture when errback runner throws",
        value: "the value",
        error: Error,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        runner: (_values, _options, _done) => {
          throw new Error();
        },
      },
      {
        name: "should handle default parameter runner with explicit errback flag",
        value: "the value",
        expected: "the value",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        runner: (value, _options = {}, done) => {
          process.nextTick(() => {
            done(undefined, value);
          });
        },
        errback: true,
      },
      {
        name: "should throw when handling default parameter runner without explicit errback flag",
        value: "the value",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        runner: (value, _options = {}, done) => {
          process.nextTick(() => {
            assert.throws(() => {
              done(undefined, value);
            });
          });
        },
      },
      {
        name: "should handle rest parameter runner with explicit errback flag",
        value: "the value",
        expected: "the value",
        runner: (...args) => {
          const [value, , done] = args;
          process.nextTick(() => {
            done(undefined, value);
          });
        },
        errback: true,
      },
      {
        name: "should throw when handling rest parameter runner without explicit errback flag",
        value: "the value",
        runner: (...args) => {
          const [value, , done] = args;
          process.nextTick(() => {
            assert.throws(() => {
              done(undefined, value);
            });
          });
        },
      },
    ]);
  });
});
