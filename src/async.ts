/**
 * Resolves a promise after a given number of milliseconds.
 * Supports cancelling via AbortSignal.
 *
 * @param ms - The number of milliseconds to delay.
 * @param options - Optional settings including an AbortSignal.
 * @returns A promise that resolves after the delay.
 */
export function delay(
  ms: number,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (options?.signal?.aborted) {
      return reject(
        options.signal.reason ||
          new DOMException("Delay aborted", "AbortError"),
      );
    }

    const timer = setTimeout(() => {
      if (options?.signal) {
        options.signal.removeEventListener("abort", onAbort);
      }
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(
        options?.signal?.reason ||
          new DOMException("Delay aborted", "AbortError"),
      );
    }

    if (options?.signal) {
      options.signal.addEventListener("abort", onAbort);
    }
  });
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after `delayMs` milliseconds have elapsed since the last time the debounced
 * function was invoked.
 *
 * @param fn - The function to debounce.
 * @param delayMs - The number of milliseconds to delay.
 * @returns A new debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return function (...args: Parameters<T>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

/**
 * Creates a throttled function that only invokes the provided function at most once
 * per every `limitMs` milliseconds.
 *
 * @param fn - The function to throttle.
 * @param limitMs - The throttle limit in milliseconds.
 * @returns A new throttled function.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limitMs: number,
): (...args: Parameters<T>) => void {
  let lastRan: number | null = null;
  let timeoutId: number | undefined;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (lastRan === null) {
      fn(...args);
      lastRan = now;
    } else {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      const remaining = limitMs - (now - lastRan);
      if (remaining <= 0) {
        fn(...args);
        lastRan = now;
      } else {
        timeoutId = setTimeout(() => {
          fn(...args);
          lastRan = Date.now();
        }, remaining);
      }
    }
  };
}

/**
 * Options for the retry function.
 */
export interface RetryOptions {
  /** Maximum number of retries before failing. Defaults to 3. */
  retries?: number;
  /** Delay between retries in milliseconds. Defaults to 500ms. */
  delayMs?: number;
  /** Exponential backoff multiplier. Defaults to 1 (linear delay). */
  backoff?: number;
}

/**
 * Retries an asynchronous function a specified number of times with optional delay and backoff.
 *
 * @param fn - The asynchronous function to retry.
 * @param options - Configuration for retries.
 * @returns A promise that resolves to the result of the function.
 */
export async function retry<T>(
  fn: () => Promise<T> | T,
  options: RetryOptions = {},
): Promise<T> {
  const { retries = 3, delayMs = 500, backoff = 1 } = options;
  let attempt = 0;
  let currentDelay = delayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries) {
        throw error;
      }
      await delay(currentDelay);
      currentDelay *= backoff;
    }
  }
}

/**
 * Rejects a promise if it does not resolve within the specified timeout in milliseconds.
 *
 * @param promise - The promise to wrap.
 * @param ms - The timeout limit in milliseconds.
 * @param message - Custom error message for the timeout.
 * @returns A promise that rejects with a timeout error or resolves with the original value.
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  message = "Operation timed out",
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
