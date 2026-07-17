/**
 * This module supports deep cloning, deep merging, and subset selection helper functions.
 * 
 * @module object
 */


/**
 * Checks if a value is a plain object.
 *
 * @param val - The value to check.
 * @returns True if value is a plain object, false otherwise.
 */
export function isObject(val: unknown): val is Record<string | symbol, any> {
  return typeof val === "object" && val !== null && !Array.isArray(val) &&
    Object.getPrototypeOf(val) === Object.prototype;
}

/**
 * Creates a deep clone of a value. Uses structuredClone if available,
 * falling back to custom recursive cloning for compatibility.
 *
 * @param val - The value to clone.
 * @returns The deep cloned value.
 */
export function deepClone<T>(val: T): T {
  if (typeof val !== "object" || val === null) {
    return val;
  }

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(val);
    } catch (_err) {
      // Fallback if it contains non-cloneable elements (like functions)
    }
  }

  if (val instanceof Date) {
    return new Date(val.getTime()) as unknown as T;
  }

  if (val instanceof RegExp) {
    return new RegExp(val.source, val.flags) as unknown as T;
  }

  if (Array.isArray(val)) {
    return val.map(deepClone) as unknown as T;
  }

  // Handle plain objects
  const clone = Object.create(Object.getPrototypeOf(val));
  for (const key of Reflect.ownKeys(val)) {
    const desc = Object.getOwnPropertyDescriptor(val, key);
    if (desc) {
      Object.defineProperty(clone, key, {
        ...desc,
        value: deepClone((val as any)[key]),
      });
    }
  }
  return clone;
}

/**
 * Deeply merges two or more objects into a new object.
 * Subsequent objects overwrite preceding ones.
 *
 * @param target - The target object.
 * @param sources - Source objects to merge.
 * @returns A new deeply merged object.
 */
export function deepMerge(
  target: Record<string, any>,
  ...sources: Record<string, any>[]
): Record<string, any> {
  const output = deepClone(target) as Record<string, any>;

  for (const source of sources) {
    if (!isObject(source)) continue;
    for (const key of Object.keys(source)) {
      if (isObject(source[key])) {
        if (!output[key] || !isObject(output[key])) {
          output[key] = {};
        }
        output[key] = deepMerge(output[key], source[key]);
      } else {
        output[key] = deepClone(source[key]);
      }
    }
  }
  return output;
}

/**
 * Creates a new object composed of the picked object properties.
 *
 * @param obj - The source object.
 * @param keys - The keys to pick.
 * @returns The new object.
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates a new object composed of properties not in the omit list.
 *
 * @param obj - The source object.
 * @param keys - The keys to omit.
 * @returns The new object.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}
