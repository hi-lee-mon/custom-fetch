import { getToken } from "@/app/_lib/getToken";

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

async function parseErrorBody(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch<T>(
  input: RequestInfo | URL,
  options: ApiFetchOptions = {},
): Promise<{ response: Response; data: T }> {
  const { skipAuth, headers, ...rest } = options;

  const token = await getToken();
  const mergedHeaders = new Headers(headers);

  if (!skipAuth && token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }
  console.log("[リクエストをインターセプト]", rest.method ?? "GET", input);

  // TODO:Base URL実装
  const response = await fetch(`http://localhost:3000/api${input}`, {
    ...rest,
    headers: mergedHeaders,
  });

  console.log("[レスポンスをインターセプト]", response.status, input);

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);

    if (response.status === 401) {
      console.log("認証切れ");
    }

    throw new HttpError(response.status, errorBody);
  }

  const data = (await response.json()) as T;

  return { response, data };
}
