import assert from "node:assert/strict";
import { describe, test as vitest } from "vitest";

import { prepare } from "../src/index";

import type { TestCase } from "../src/index";

const test = prepare(vitest);

describe("interpolation", () => {
  /**
   * Tests verifying prefix handling and value/expected placeholder interpolation in test titles.
   */
  describe("dealing with prefixing and value interpolating", () => {
    const cases: TestCase<
      unknown,
      unknown,
      unknown,
      { transformed: string }
    >[] = [
      {
        name: "prefix title",
        value: 520,
        options: {
          transformed: "should prefix title",
        },
      },
      {
        name: "resolve top level value: {value}",
        value: 520,
        options: {
          transformed: "should resolve top level value: 520",
        },
      },
      {
        name: "resolve nested value: {value.nested}",
        value: { nested: 1024 },
        options: {
          transformed: "should resolve nested value: 1024",
        },
      },
      {
        name: "not replace if value not resolved: {value.not.resolvable}",
        value: {},
        options: {
          transformed:
            "should not replace if value not resolved: {value.not.resolvable}",
        },
      },
      {
        name: "resolve top level expected value: {expected}",
        value: undefined,
        expected: 333,
        options: {
          transformed: "should resolve top level expected value: 333",
        },
      },
      {
        name: "resolve nested expected value: {expected.nested}",
        value: undefined,
        expected: { nested: 999 },
        options: {
          transformed: "should resolve nested expected value: 999",
        },
      },
      {
        name: "not replace if expected value not resolved: {expected.not.resolvable}",
        value: undefined,
        expected: {},
        options: {
          transformed:
            "should not replace if expected value not resolved: {expected.not.resolvable}",
        },
      },
      {
        name: "handle brace characters escaping with valid value interpolating: \\{{ value }\\} \\{{ value}\\} \\{{value }\\} \\{{value}\\}",
        value: 520,
        expected: {},
        options: {
          transformed:
            "should handle brace characters escaping with valid value interpolating: {520} {520} {520} {520}",
        },
      },
      {
        name: "handle brace characters escaping with invalid value interpolating: \\{{value\\}} {\\{value}\\} {\\{value\\}} \\{value} {value\\} \\{\\} \\{} {\\} { \\} {\\ }",
        value: 520,
        expected: {},
        options: {
          transformed:
            "should handle brace characters escaping with invalid value interpolating: {{value}} {{value}} {{value}} {value} {value} {} {} {} { } {\\ }",
        },
      },
      {
        name: "ignore invalid index: value={val}, expected={exp}, error={err}, options={opt}",
        value: 520,
        expected: {},
        options: {
          transformed:
            "should ignore invalid index: value={val}, expected={exp}, error={err}, options={opt}",
        },
      },
    ];

    cases.forEach((testCase) => {
      test(testCase, {
        it: (actualName) => {
          vitest(actualName, () => {
            assert.deepEqual(actualName, testCase.options!.transformed);
          });
        },
        prefix: "should ",
      });
    });
  });
});
