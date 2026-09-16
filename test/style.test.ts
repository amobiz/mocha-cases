/**
 * @fileoverview Test suite for `empirical-cases`.
 * Verifies single values, multiple values, tuples, object pairs,
 * string interpolation, synchronous/Promise/errback runners,
 * selective test execution, and README examples.
 */

import { describe, test as vitest } from "vitest";

import { prepare } from "../src/index";

const test = prepare(vitest);

describe("numerous test styles", () => {
  /**
   * Tests verifying single value execution and exception handling.
   */
  describe("dealing with single test value", () => {
    test([
      {
        name: "should handle single expected value",
        value: 7,
        expected: 14,
        runner: (value) => value * 2,
      },
      {
        name: "should match the expected error that runner throws",
        value: 7,
        error: Error,
        runner: (value) => {
          throw new Error(`${value}`);
        },
      },
    ]);
  });

  /**
   * Tests verifying an array of input values matching against a single shared expected value.
   */
  describe("dealing with multiple test values with single expected value", () => {
    test({
      name: "should handle single expected value",
      values: [2, 4, 6, 8, 10],
      expected: 0,
      runner: (value) => value % 2,
    });
  });

  /**
   * Tests verifying multiple test values each matching an element-by-element expected array.
   */
  describe("dealing with multiple expected values each with corresponding expected values", () => {
    test({
      name: "should handle multiple expected values",
      values: [3, 0, false, undefined, null, [], {}, ""],
      expected: [3, 0, false, undefined, null, [], {}, ""],
      runner: (value) => value,
    });
  });

  /**
   * Tests verifying multiple homogeneous input values.
   */
  describe("dealing with multiple test values of the same type", () => {
    test({
      name: "should handle test values of the same type",
      values: [2, 4, 6, 8, 10],
      expected: [0, 0, 0, 0, 0],
      runner: (value) => value % 2,
    });
  });

  /**
   * Tests verifying multiple heterogeneous input values across diverse JavaScript primitives and objects.
   */
  describe("dealing with multiple test values of different types", () => {
    test({
      name: "should handle multiple test values of different types",
      values: [3, 0, false, undefined, null, [], {}, ""],
      expected: [3, 0, false, undefined, null, [], {}, ""],
      runner: (value) => value,
    });
  });

  /**
   * Tests verifying cases specified as an array of `{ value, expected }` objects.
   */
  describe("dealing with multiple test cases as objects with {value, expected} properties", () => {
    test({
      name: "should handle array of pairs \\{ value: {value}, expected: {expected} \\}",
      cases: [
        {
          value: 2,
          expected: 0,
        },
        {
          value: 4,
          expected: 0,
        },
        {
          value: 3,
          expected: 1,
        },
      ],
      runner: (value) => value % 2,
    });
  });

  /**
   * Tests verifying cases specified as an array of `[value, expected]` tuples.
   */
  describe("dealing with multiple test cases as pairs of [value, expected]", () => {
    test({
      name: "should handle array of pairs [{value}, {expected}]",
      cases: [
        [2, 0],
        [4, 0],
        [3, 1],
      ],
      runner: (value) => value % 2,
    });
  });
});
