import { assertEquals } from "@std/assert";
import {
  camelCase,
  escapeHtml,
  slugify,
  snakeCase,
  truncate,
} from "./string.ts";

Deno.test("string - slugify", () => {
  assertEquals(slugify("Hello World!"), "hello-world");
  assertEquals(slugify("  Lots   of  spaces  "), "lots-of-spaces");
  assertEquals(slugify("Café & Restaurant"), "cafe-restaurant");
  assertEquals(slugify("Unicode (äöü) test!"), "unicode-aou-test");
});

Deno.test("string - camelCase", () => {
  assertEquals(camelCase("hello world"), "helloWorld");
  assertEquals(camelCase("Hello-World"), "helloWorld");
  assertEquals(camelCase("hello_world"), "helloWorld");
  assertEquals(camelCase("helloWorld"), "helloWorld");
});

Deno.test("string - snakeCase", () => {
  assertEquals(snakeCase("hello world"), "hello_world");
  assertEquals(snakeCase("Hello-World"), "hello_world");
  assertEquals(snakeCase("helloWorld"), "hello_world");
});

Deno.test("string - truncate", () => {
  assertEquals(truncate("hello world", 15), "hello world");
  assertEquals(truncate("hello world", 5), "he...");
  assertEquals(truncate("hello world", 8, "!!!"), "hello!!!");
  assertEquals(truncate("hi", 1, ""), "h");
});

Deno.test("string - escapeHtml", () => {
  assertEquals(
    escapeHtml("<div>Hello & Welcome</div>"),
    "&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;",
  );
  assertEquals(
    escapeHtml("'Quote' and \"Double\""),
    "&#39;Quote&#39; and &quot;Double&quot;",
  );
});
