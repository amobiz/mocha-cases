/** Regex used to find interpolation placeholders like {value} or escaped braces */
const INTERPOLATE = /\\{|\\}|{\s*([.\w]+?)\s*}/gm;

/**
 * Interpolates a template string using the provided context object.
 * Supports escaped braces ({{ and }}) which are replaced with a single brace.
 */
export function interpolate(
  template: string,
  ctx: Record<string, unknown>,
): string {
  return template.replace(INTERPOLATE, (match, path) => {
    switch (match) {
      case "\\{":
        return "{";
      case "\\}":
        return "}";
      default:
        // `path` may be undefined for escaped braces; fall back to original match.
        return get(ctx, path) ?? `{${path}}`;
    }
  });
}

/**
 * Resolves a dot-separated property path on an object and serializes the result as a JSON string.
 * Safely handles null or undefined intermediate properties and circular structures.
 *
 * @param values The object to read properties from.
 * @param path The dot-separated property path (e.g. `"value.nested"`).
 * @returns The JSON-stringified value, or undefined if the path cannot be resolved.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get<const T extends Record<string, any>>(values: T, path: string) {
  let node = values;

  for (const segment of path.split(".")) {
    if (node == null) {
      return undefined; // Safely aborts on intermediate nulls (e.g. value.nested when value is null)
    }
    node = node[segment];
  }

  if (typeof node === "undefined") {
    return undefined;
  }

  try {
    return JSON.stringify(node);
  } catch {
    return String(node); // Handles circular references gracefully
  }
}
