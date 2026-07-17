import { assertEquals, assertRejects } from "@std/assert";
import { debounce, delay, retry, throttle, timeout } from "./async.ts";

Deno.test("async - delay", async () => {
  const start = Date.now();
  await delay(50);
  const elapsed = Date.now() - start;
  assertEquals(elapsed >= 45, true);
});

Deno.test("async - delay abort", async () => {
  const controller = new AbortController();
  const promise = delay(100, { signal: controller.signal });
  controller.abort();
  await assertRejects(() => promise, DOMException, "aborted");
});

Deno.test("async - debounce", async () => {
  let count = 0;
  const fn = debounce(() => {
    count++;
  }, 30);

  fn();
  fn();
  fn();
  assertEquals(count, 0);

  await delay(50);
  assertEquals(count, 1);
});

Deno.test("async - throttle", async () => {
  let count = 0;
  const fn = throttle(() => {
    count++;
  }, 30);

  fn(); // 1st: runs immediately
  fn(); // 2nd: throttled
  fn(); // 3rd: throttled
  assertEquals(count, 1);

  await delay(50);
  assertEquals(count, 2);
});

Deno.test("async - retry succeeds", async () => {
  let attempts = 0;
  const result = await retry(() => {
    attempts++;
    if (attempts < 3) {
      throw new Error("fail");
    }
    return "success";
  }, { retries: 3, delayMs: 5 });

  assertEquals(result, "success");
  assertEquals(attempts, 3);
});

Deno.test("async - retry fails", async () => {
  let attempts = 0;
  await assertRejects(
    () =>
      retry(() => {
        attempts++;
        throw new Error("fail");
      }, { retries: 2, delayMs: 5 }),
    Error,
    "fail",
  );
  assertEquals(attempts, 3); // 1 initial + 2 retries
});

Deno.test("async - timeout resolves", async () => {
  const promise = delay(10).then(() => "done");
  const result = await timeout(promise, 50);
  assertEquals(result, "done");
});

Deno.test("async - timeout rejects", async () => {
  const promise = delay(50).then(() => "done");
  await assertRejects(
    () => timeout(promise, 10),
    Error,
    "Operation timed out",
  );
});
