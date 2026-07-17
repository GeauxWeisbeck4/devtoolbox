import { assertEquals } from "@std/assert";
import { classNames, copyToClipboard, isBrowser } from "./dom.ts";

Deno.test("dom - isBrowser", () => {
  // In Deno, isBrowser should yield false
  assertEquals(isBrowser(), false);
});

Deno.test("dom - classNames strings", () => {
  assertEquals(classNames("foo", "bar"), "foo bar");
  assertEquals(
    classNames("foo", false, "bar", null, undefined, "baz"),
    "foo bar baz",
  );
});

Deno.test("dom - classNames arrays", () => {
  assertEquals(classNames(["foo", "bar"], "baz"), "foo bar baz");
  assertEquals(classNames(["foo", ["bar", false]], "baz"), "foo bar baz");
});

Deno.test("dom - classNames objects", () => {
  assertEquals(classNames({ foo: true, bar: false, baz: true }), "foo baz");
  assertEquals(
    classNames("prefix", { foo: true, bar: false }, ["nested"]),
    "prefix foo nested",
  );
});

Deno.test("dom - copyToClipboard in non-browser env", async () => {
  // In non-browser (Deno), should resolve to false without throwing
  const result = await copyToClipboard("hello");
  assertEquals(result, false);
});
