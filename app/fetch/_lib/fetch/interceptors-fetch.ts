import { getToken } from "@/app/_lib/getToken";
import { ApiFetchOptions } from "./type";

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
): Promise<Response> {
  // デフォルト5秒でタイムアウト
  const { skipAuth, headers, timeoutMs = 5000, ...rest } = options;

  const token = await getToken();
  const mergedHeaders = new Headers(headers);

  if (!skipAuth && token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }
  console.log("[リクエストをインターセプト]", rest.method ?? "GET", input);

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    // TODO:Base URL実装
    const response = await fetch(`http://localhost:3000/api${input}`, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    console.log("[レスポンスをインターセプト]", response.status, input);

    if (!response.ok) {
      const errorBody = await parseErrorBody(response);

      if (response.status === 401) {
        console.log("認証切れ");
      }

      throw new HttpError(response.status, errorBody);
    }

    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new TimeoutError();
    }
    console.error("Fetchエラー:", error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
