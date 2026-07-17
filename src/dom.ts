/**
 * Safely checks if the current runtime environment is a browser.
 *
 * @returns True if running in a browser, false otherwise.
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Conditionally joins class names together.
 * Supports strings, arrays, objects, and falsy values.
 *
 * @param args - The class name values.
 * @returns A consolidated className string.
 */
export function classNames(...args: any[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      if (arg.length > 0) {
        const inner = classNames(...arg);
        if (inner) classes.push(inner);
      }
    } else if (typeof arg === "object") {
      for (const key of Object.keys(arg)) {
        if (arg[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
}

/**
 * Safely copies text to the system clipboard.
 * Fallback to standard DOM methods if clipboard API is not available.
 * Returns a promise resolving to true if copying succeeded, false otherwise.
 *
 * @param text - The text to copy to the clipboard.
 * @returns A promise resolving to true if successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) {
    return false;
  }

  // Modern clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_err) {
      // Fallback
    }
  }

  // Fallback to document.execCommand
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (_err) {
    return false;
  }
}
