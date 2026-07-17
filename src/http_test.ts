import { assertEquals, assertRejects } from "@std/assert";
import { createFetchWrapper, HttpError, toQueryString } from "./http.ts";

Deno.test("http - toQueryString", () => {
  assertEquals(toQueryString({ a: 1, b: "hello" }), "a=1&b=hello");
  assertEquals(
    toQueryString({ a: [1, 2], b: null, c: false }),
    "a=1&a=2&c=false",
  );
  assertEquals(
    toQueryString({ "special char": "&=" }),
    "special%20char=%26%3D",
  );
});

Deno.test("http - fetch wrapper integration", async () => {
  const controller = new AbortController();

  const server = Deno.serve({
    port: 0, // pick random free port
    signal: controller.signal,
    onListen: () => {},
  }, async (req: Request) => {
    const url = new URL(req.url);
    if (url.pathname === "/json" && req.method === "POST") {
      const body = await req.json();
      return Response.json({ echoed: body });
    }
    if (url.pathname === "/error") {
      return new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }
    return Response.json({ ok: true });
  });

  const { port } = server.addr;
  const client = createFetchWrapper({ baseURL: `http://localhost:${port}` });

  try {
    // Test base client / GET
    const getRes = await client.get<{ ok: boolean }>("/");
    assertEquals(getRes.ok, true);

    // Test POST json
    const jsonRes = await client.post<{ echoed: any }>("/json", {
      test: "data",
    });
    assertEquals(jsonRes.echoed, { test: "data" });

    // Test 404 error threw HttpError
    await assertRejects(
      () => client.get("/error"),
      HttpError,
      "HTTP Error 404: Not Found",
    );
  } finally {
    controller.abort();
    await server.finished;
  }
});
