import { apiFetch } from "./custom-fetch";
import { ApiJsonOptions, Hooks } from "../type";

export async function apiJson<T>(
  input: RequestInfo | URL,
  options: ApiJsonOptions = {},
  hooks: Hooks = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const mergedHeaders = new Headers(headers);

  if (body !== undefined) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  const response = await apiFetch(
    input,
    {
      ...rest,
      headers: mergedHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    hooks,
  );

  return response.json() as Promise<T>;
}
