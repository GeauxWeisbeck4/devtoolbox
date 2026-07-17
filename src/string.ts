/**
 * This module supports case conversion and string sanitization.
 * 
 * @module string
 */


/**
 * Converts a string into a URL-friendly slug.
 * Removes special characters, converts spaces to hyphens, and downcases.
 *
 * @param str - The string to slugify.
 * @returns The slugified string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove diacritical marks
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric characters, spaces, and hyphens
    .trim()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // merge multiple hyphens
}

/**
 * Splits a string into words based on common separators (spaces, hyphens, underscores) and casing changes.
 *
 * @param str - The input string.
 * @returns An array of words.
 */
function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // handle camelCase boundaries
    .replace(/[^a-zA-Z0-9]/g, " ") // replace non-alphanumeric with spaces
    .trim()
    .split(/\s+/);
}

/**
 * Converts a string to camelCase.
 *
 * @param str - The input string.
 * @returns The camelCased string.
 */
export function camelCase(str: string): string {
  const words = toWords(str);
  if (words.length === 0 || words[0] === "") return "";
  return words[0].toLowerCase() +
    words.slice(1).map((w) =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join("");
}

/**
 * Converts a string to snake_case.
 *
 * @param str - The input string.
 * @returns The snake_cased string.
 */
export function snakeCase(str: string): string {
  const words = toWords(str);
  if (words.length === 0 || words[0] === "") return "";
  return words
    .map((w) => w.toLowerCase())
    .join("_");
}

/**
 * Truncates a string to a specified length, appending a suffix if it exceeds the limit.
 *
 * @param str - The string to truncate.
 * @param length - The maximum length of the output string (including the suffix).
 * @param suffix - The suffix to append. Defaults to "...".
 * @returns The truncated string.
 */
export function truncate(str: string, length: number, suffix = "..."): string {
  if (str.length <= length) return str;
  const cutoff = length - suffix.length;
  return str.slice(0, cutoff > 0 ? cutoff : 0) + suffix;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes special HTML characters in a string to prevent XSS.
 *
 * @param str - The string to escape.
 * @returns The HTML-escaped string.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
