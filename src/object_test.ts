import { assertEquals } from "@std/assert";
import { deepClone, deepMerge, isObject, omit, pick } from "./object.ts";

Deno.test("object - isObject", () => {
  assertEquals(isObject({}), true);
  assertEquals(isObject({ a: 1 }), true);
  assertEquals(isObject([]), false);
  assertEquals(isObject(null), false);
  assertEquals(isObject(new Date()), false);
  assertEquals(isObject("string"), false);
});

Deno.test("object - deepClone basic", () => {
  const original = { a: 1, b: { c: 2, d: [3, 4] } };
  const clone = deepClone(original);

  assertEquals(clone, original); // identical value
  assertEquals(clone === original, false); // different reference
  assertEquals(clone.b === original.b, false); // different nested reference
  assertEquals(clone.b.d === original.b.d, false); // different array reference
});

Deno.test("object - deepClone specials", () => {
  const date = new Date(1600000000000);
  const regex = /abc/gi;
  const original = { date, regex };
  const clone = deepClone(original);

  assertEquals(clone.date.getTime(), date.getTime());
  assertEquals(clone.regex.source, "abc");
  assertEquals(clone.regex.flags, "gi");
  assertEquals(clone.date === date, false);
  assertEquals(clone.regex === regex, false);
});

Deno.test("object - deepMerge flat", () => {
  const obj1 = { a: 1, b: 2 };
  const obj2 = { b: 3, c: 4 };
  const merged = deepMerge(obj1, obj2);

  assertEquals(merged, { a: 1, b: 3, c: 4 });
  // check original not mutated
  assertEquals(obj1, { a: 1, b: 2 });
});

Deno.test("object - deepMerge nested", () => {
  const obj1 = { a: 1, b: { x: 10, y: 20 } };
  const obj2 = { b: { y: 30, z: 40 }, c: 5 };
  const merged = deepMerge(obj1, obj2);

  assertEquals(merged, { a: 1, b: { x: 10, y: 30, z: 40 }, c: 5 });
  assertEquals(obj1.b, { x: 10, y: 20 }); // not mutated
});

Deno.test("object - pick", () => {
  const obj = { a: 1, b: 2, c: 3 };
  assertEquals(pick(obj, ["a", "c"]), { a: 1, c: 3 });
  assertEquals(pick(obj, ["a", "d" as any]), { a: 1 });
});

Deno.test("object - omit", () => {
  const obj = { a: 1, b: 2, c: 3 };
  assertEquals(omit(obj, ["b"]), { a: 1, c: 3 });
  assertEquals(omit(obj, ["a", "c"]), { b: 2 });
});
