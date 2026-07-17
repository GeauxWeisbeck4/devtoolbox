# @geauxweisbeck4/devtoolbox

A modern, light, and robust utilities package optimized for Deno, TypeScript,
and web development.

It features complete sub-path exports, enabling tree-shakable clean imports for
both frontend and backend modules.

## Installation

Install using JSR:

```bash
# Deno
deno add jsr:@geauxweisbeck4/devtoolbox

# npm (using npx)
npx jsr add @geauxweisbeck4/devtoolbox

# yarn
yarn dlx jsr add @geauxweisbeck4/devtoolbox

# pnpm
pnpm dlx jsr add @geauxweisbeck4/devtoolbox
```

## Modules

The package contains five submodules:

### 1. Async Utilities (`/async`)

Utilities for handling async operations.

```typescript
import {
  debounce,
  delay,
  retry,
  throttle,
  timeout,
} from "@geauxweisbeck4/devtoolbox/async";

// Delay with optional AbortSignal abort logic
await delay(1000);

// Retry an operation
const data = await retry(async () => {
  return await fetch("...").then((res) => res.json());
}, { retries: 3, delayMs: 500 });
```

### 2. String Utilities (`/string`)

Case conversion and string sanitization.

```typescript
import {
  camelCase,
  escapeHtml,
  slugify,
  snakeCase,
  truncate,
} from "@geauxweisbeck4/devtoolbox/string";

slugify("Hello World!"); // "hello-world"
camelCase("hello-world"); // "helloWorld"
snakeCase("helloWorld"); // "hello_world"
truncate("very long string here", 15); // "very long st..."
escapeHtml("<script>alert(1)</script>"); // "&lt;script&gt;alert(1)&lt;/script&gt;"
```

### 3. Object Utilities (`/object`)

Deep cloning, deep merging, and subset selection helper functions.

```typescript
import {
  deepClone,
  deepMerge,
  omit,
  pick,
} from "@geauxweisbeck4/devtoolbox/object";

const clone = deepClone({ a: 1, b: { c: 2 } });
const merged = deepMerge({ a: 1 }, { b: 2 }, { a: 3 }); // { a: 3, b: 2 }
const subset = pick({ a: 1, b: 2, c: 3 }, ["a", "c"]); // { a: 1, c: 3 }
const rest = omit({ a: 1, b: 2, c: 3 }, ["b"]); // { a: 1, c: 3 }
```

### 4. DOM Utilities (`/dom`)

Client-side and SSR-friendly DOM helper utilities.

```typescript
import {
  classNames,
  copyToClipboard,
  isBrowser,
} from "@geauxweisbeck4/devtoolbox/dom";

if (isBrowser()) {
  await copyToClipboard("Copied text!");
}

// Join classNames conditionally
const className = classNames("btn", { "btn-primary": true, "disabled": false }); // "btn btn-primary"
```

### 5. HTTP Utilities (`/http`)

Query string formatting and lightweight customizable Fetch Client API wrappers.

```typescript
import {
  createFetchWrapper,
  toQueryString,
} from "@geauxweisbeck4/devtoolbox/http";

// Format parameters
const query = toQueryString({ page: 2, limit: 10, tags: ["js", "ts"] });
// "page=2&limit=10&tags=js&tags=ts"

// Create standard API Client
const api = createFetchWrapper({ baseURL: "https://api.github.com" });
const repos = await api.get("/users/geauxweisbeck4/repos");
```

## Running Tests

Run the test suite in the workspace:

```bash
deno task test
```

## License

MIT
