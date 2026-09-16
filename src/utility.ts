import type { ErrorClass } from "./types";

/**
 * Represents a single value or an array of values.
 */
export type MaybeArray<T> = T | T[];

/**
 * Type‑safe check whether a value is an instance of a supplied Error constructor.
 *
 * @template T Error class constructor type.
 * @param value The value to check.
 * @param type The Error constructor function.
 * @returns True if `value` is an instance of `type`.
 */
export function instanceOf<T extends ErrorClass>(
  value: unknown,
  type: T,
): value is InstanceType<T> {
  return value instanceof type;
}

/**
 * Normalizes a single value or an array of values into an array.
 *
 * @template T Item type.
 * @param value A single item or an array of items.
 * @returns An array containing the item(s).
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Creates a mapping function from a value or array of values.
 * If given an array, maps index `i` to `values[i]`. Otherwise, returns the single value for any index.
 *
 * @template T Item type.
 * @param values Single value or array of values.
 * @returns Mapper function returning the value for a given index.
 */
export function toMapper<T>(values: T | T[]): (index: number) => T {
  if (Array.isArray(values)) {
    return (index: number) => values[index];
  }
  return () => values;
}
