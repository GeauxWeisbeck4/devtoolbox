/**
 * Custom HTTP Error class representing non-2xx responses.
 */
export class HttpError extends Error {
  status: number;
  statusText: string;
  response: Response;

  constructor(response: Response, message?: string) {
    const status = response.status;
    const statusText = response.statusText;
    super(message || `HTTP Error ${status}: ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

export interface FetchWrapperOptions extends RequestInit {
  baseURL?: string;
  headers?: HeadersInit;
  /** Custom handler for non-2xx responses. If returns true, doesn't throw HttpError. */
  handleError?: (response: Response) => boolean | Promise<boolean>;
}

export interface FetchClient {
  (url: string, init?: RequestInit): Promise<Response>;
  get<T = any>(url: string, init?: RequestInit): Promise<T>;
  post<T = any>(url: string, body?: any, init?: RequestInit): Promise<T>;
  put<T = any>(url: string, body?: any, init?: RequestInit): Promise<T>;
  patch<T = any>(url: string, body?: any, init?: RequestInit): Promise<T>;
  delete<T = any>(url: string, init?: RequestInit): Promise<T>;
}

/**
 * Creates a customizable fetch wrapper for executing requests.
 * Standardizes JSON content-type handling and HTTP error throwing.
 *
 * @param options - Default initialization parameters.
 * @returns A structured FetchClient API wrapper.
 */
export function createFetchWrapper(
  options: FetchWrapperOptions = {},
): FetchClient {
  const { baseURL = "", handleError, ...defaultInit } = options;

  const client = async (
    url: string,
    init: RequestInit = {},
  ): Promise<Response> => {
    const fullURL = url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

    const headers = new Headers(defaultInit.headers);
    if (init.headers) {
      const initHeaders = new Headers(init.headers);
      for (const [key, val] of initHeaders.entries()) {
        headers.set(key, val);
      }
    }

    const mergedInit: RequestInit = {
      ...defaultInit,
      ...init,
      headers,
    };

    const response = await fetch(fullURL, mergedInit);

    if (!response.ok) {
      let skipThrow = false;
      if (handleError) {
        skipThrow = await handleError(response);
      }
      if (!skipThrow) {
        throw new HttpError(response);
      }
    }

    return response;
  };

  const requestJson = async <T>(
    url: string,
    init: RequestInit = {},
  ): Promise<T> => {
    const res = await client(url, init);
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await res.json() as T;
    }
    return await res.text() as unknown as T;
  };

  client.get = <T = any>(url: string, init?: RequestInit) =>
    requestJson<T>(url, { ...init, method: "GET" });

  client.post = <T = any>(url: string, body?: any, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const hasJsonBody = body !== undefined && typeof body === "object" &&
      !(body instanceof FormData) && !(body instanceof Blob);

    if (hasJsonBody && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return requestJson<T>(url, {
      ...init,
      method: "POST",
      headers,
      body: hasJsonBody ? JSON.stringify(body) : body,
    });
  };

  client.put = <T = any>(url: string, body?: any, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const hasJsonBody = body !== undefined && typeof body === "object" &&
      !(body instanceof FormData) && !(body instanceof Blob);

    if (hasJsonBody && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return requestJson<T>(url, {
      ...init,
      method: "PUT",
      headers,
      body: hasJsonBody ? JSON.stringify(body) : body,
    });
  };

  client.patch = <T = any>(url: string, body?: any, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const hasJsonBody = body !== undefined && typeof body === "object" &&
      !(body instanceof FormData) && !(body instanceof Blob);

    if (hasJsonBody && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return requestJson<T>(url, {
      ...init,
      method: "PATCH",
      headers,
      body: hasJsonBody ? JSON.stringify(body) : body,
    });
  };

  client.delete = <T = any>(url: string, init?: RequestInit) =>
    requestJson<T>(url, { ...init, method: "DELETE" });

  return client as FetchClient;
}

/**
 * Converts a flat object of key-value pairs into a URL-encoded query string.
 * Automatically handles arrays by repeating keys (e.g. `a=[1,2]` -> `a=1&a=2`).
 * Filters out nullish values (null/undefined), but keeps 0 and false.
 *
 * @param params - Object containing query parameters.
 * @returns The query string (without the leading '?').
 */
export function toQueryString(params: Record<string, any>): string {
  const parts: string[] = [];

  for (const key of Object.keys(params)) {
    const val = params[key];
    if (val === null || val === undefined) {
      continue;
    }

    if (Array.isArray(val)) {
      for (const item of val) {
        if (item !== null && item !== undefined) {
          parts.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
          );
        }
      }
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`,
      );
    }
  }

  return parts.join("&");
}
