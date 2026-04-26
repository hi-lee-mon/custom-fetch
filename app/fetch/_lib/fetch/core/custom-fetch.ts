import { ApiFetchOptions, Hooks } from "../type";

export class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, body?: unknown) {
    super(`HTTP Error: ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("Request timeout");
    this.name = "TimeoutError";
  }
}

async function parseErrorBody(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiFetch(
  input: RequestInfo | URL,
  options: ApiFetchOptions = {},
  hooks: Hooks = {},
): Promise<Response> {
  const { headers, timeoutMs = 5000, ...rest } = options;

  const mergedHeaders = new Headers(headers);
  let request = new Request(`${input}`, {
    ...rest,
    headers: mergedHeaders,
  });

  // beforeRequest hooks を実行(インターセプトは呼び出し側で実装する)
  for (const hook of hooks.beforeRequest ?? []) {
    const result = await hook(request);
    if (result instanceof Request) {
      request = result;
    }
  }

  // タイムアウトの実装
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(request, { signal: controller.signal });

    // afterResponse hooks を実行
    let finalResponse = response;
    for (const hook of hooks.afterResponse ?? []) {
      const result = await hook(request, finalResponse);
      if (result instanceof Response) {
        finalResponse = result;
      }
    }

    if (!finalResponse.ok) {
      const errorBody = await parseErrorBody(finalResponse);

      if (finalResponse.status === 401) {
        console.error("認証エラー: トークンが無効か期限切れの可能性があります。");
      }

      let error: Error = new HttpError(finalResponse.status, errorBody);

      // beforeError hooks を実行
      for (const hook of hooks.beforeError ?? []) {
        const result = await hook(error);
        if (result instanceof Error) {
          error = result;
        }
      }
      console.error("HTTPエラー:", error);
      throw error;
    }

    return finalResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("リクエストがタイムアウトしました");
      throw new TimeoutError();
    }
    console.error("Fetchエラー:", error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
