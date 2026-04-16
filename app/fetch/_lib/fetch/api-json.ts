import { apiFetch } from "./interceptors-fetch";
import { ApiJsonOptions } from "./type";

export async function apiJson<T>(
  input: RequestInfo | URL,
  options: ApiJsonOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const mergedHeaders = new Headers(headers);

  if (body !== undefined) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  const response = await apiFetch(input, {
    ...rest,
    headers: mergedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return response.json() as Promise<T>;
}
