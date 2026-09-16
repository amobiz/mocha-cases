import { describe, test as vitest } from "vitest";

import { prepare } from "../src/index";

const test = prepare(vitest);

describe("backward compatiblity", () => {
  /**
   * Tests backward compatiblity for deprecated api.
   */
  describe("dealing with backward compatiblity", () => {
    test({
      name: "should use passThru runner when no runner specified",
      value: 7,
      expected: 7,
    });
  });
});
