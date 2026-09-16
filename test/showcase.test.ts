import { describe, test as vitest } from "vitest";

import { prepare } from "../src/index";

import type { Done } from "../src/index";

const test = prepare(vitest);

/**
 * Tests showcasing real-world examples documented in README.md.
 */
describe("readme showcases", () => {
  function sum(...nums: number[]) {
    return nums.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);
  }

  describe("simple test cases", () => {
    test(
      {
        // the name of test you want to run
        name: "sum of {value} equals to {expected}",
        // the cases you want to test
        cases: [
          {
            // the value passed to runner
            value: [1776, 250],
            // the expected output to compare with
            expected: 2026,
          },
          {
            value: [1911, 1949, 1989, 2026, 936, 89, 64],
            expected: 8964,
          },
          {
            value: [1, 2, 3, 4, 5],
            expected: 15,
          },
        ],
      },
      // the runner wrapping your function
      (value) => sum(...value),
    );
  });

  describe("template interpolation", () => {
    test(
      {
        name: "{value.a} + {value.b} equals to {expected.result}",
        value: { a: 5, b: 7 },
        expected: { result: 12 },
      },
      (value) => ({ result: sum(value.a, value.b) }),
      {
        prefix: "sum(): ",
      },
    );
  });

  describe("name resolver", () => {
    test(
      {
        name: ({ value, expected, options }) => {
          const timestamp = options?.timestamp
            ? ` (${String(Date.now())})`
            : "";
          return `${value.a} + ${value.b} equals to ${expected!.result}.${timestamp}`;
        },
        value: { a: 5, b: 7 },
        expected: { result: 12 },
        options: {
          timestamp: true,
        },
      },
      (value) => ({ result: sum(value.a, value.b) }),
      {
        prefix: "sum(): ",
      },
    );
  });

  /**
   * Determines whether a given number is prime.
   *
   * @param num The number to check.
   * @returns True if `num` is a prime number, false otherwise.
   */
  function isPrime(num: number): boolean {
    if (!Number.isInteger(num) || num < 0) {
      throw new Error(`${num} is not an natural number`);
    }

    // Primes must be greater than 1
    if (num <= 1) return false;

    // 2 is the only even prime number
    if (num === 2) return true;

    // Exclude all other even numbers
    if (num % 2 === 0) return false;

    // Check odd factors up to the square root of the number
    const boundary = Math.sqrt(num);
    for (let i = 3; i <= boundary; i += 2) {
      if (num % i === 0) return false;
    }

    return true;
  }

  describe("map each one value to one expected", () => {
    test(
      [
        {
          name: "Is {value} a prime number? → {expected}",
          value: 2,
          expected: true,
        },
        {
          name: "Is {value} a prime number? → {expected}",
          value: 4,
          expected: false,
        },
      ],
      isPrime,
    );
  });

  describe("map multiple values to single expected", () => {
    test(
      [
        {
          name: "Is {value} a prime number? → {expected}",
          values: [2, 3, 5, 7],
          expected: true,
        },
        {
          name: "Is {value} a prime number? → {expected}",
          values: [4, 9, 15, 27],
          expected: false,
        },
      ],
      isPrime,
    );
  });

  describe("pair multiple given values and expected values using `values` keyword", () => {
    test(
      {
        name: "Is {value} a prime number? → {expected}",
        values: [2, 4, 6, 8],
        expected: [true, false, false, false],
      },
      isPrime,
    );
  });

  describe("pair multiple given values and expected values using `cases` keyword", () => {
    test(
      {
        name: "Is {value} a prime number? → {expected}",
        cases: [
          { value: 2, expected: true },
          { value: 4, expected: false },
          { value: 5, expected: true },
        ],
      },
      isPrime,
    );
  });

  describe("pair multiple given values and expected values using `cases` keyword", () => {
    test(
      {
        name: "Is {value} a prime number? → {expected}",
        cases: [
          [2, true],
          [4, false],
          [5, true],
        ],
      },
      isPrime,
    );
  });

  describe("expect error", () => {
    test(
      {
        name: "should throw if value is not an natural number",
        value: 3.14,
        error: Error,
      },
      isPrime,
    );
  });

  async function isPrimeAsync(value: number) {
    return isPrime(value);
  }

  describe("asynchronous runner using async function", () => {
    test(
      {
        name: "Is {value} a prime number? → {expected}",
        value: 6,
        expected: false,
      },
      isPrimeAsync,
    );
  });

  function isPrimePromise(value: number) {
    return new Promise((resolve) => {
      resolve(isPrime(value));
    });
  }

  describe("asynchronous runner using Promise", () => {
    test(
      {
        name: "Is {value} a prime number? → {expected}",
        value: 3,
        expected: true,
      },
      isPrimePromise,
    );
  });

  function isPrimeCallback(
    value: number,
    _options: unknown,
    done: Done<boolean>,
  ) {
    setTimeout(() => {
      try {
        done(undefined, isPrime(value));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        done(error);
      }
    }, 10);
  }

  describe("asynchronous runner using errback (callback)", () => {
    test(
      {
        name: "Is {value} a prime number? → {expected}",
        value: 3,
        expected: true,
      },
      isPrimeCallback,
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function isPrimeCallbackWithRestParameter(...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [value, _options, done] = args;
    setTimeout(() => {
      done(null, isPrime(value));
    }, 10);
  }

  describe("asynchronous runner using errback (callback) with rest parameter", () => {
    test(
      {
        name: "Is {value} a prime number ? → {expected}",
        value: 3,
        expected: true,
      },
      {
        runner: isPrimeCallbackWithRestParameter,
        errback: true,
      },
    );
  });

  describe("per-case runner", () => {
    test([
      {
        name: "Is {value} a prime number? → {expected}",
        cases: [
          { value: 2, expected: true },
          { value: 4, expected: false },
          { value: 5, expected: true },
        ],
        runner: isPrime,
      },
      {
        name: "Is {value} a prime number? → {expected}",
        cases: [
          { value: 2, expected: true },
          { value: 4, expected: false },
          { value: 5, expected: true },
        ],
        runner: isPrimeCallbackWithRestParameter,
        errback: true,
      },
    ]);
  });
});
