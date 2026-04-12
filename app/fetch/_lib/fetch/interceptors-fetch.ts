import { getToken } from "@/app/_lib/getToken";

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

  if (response.status === 401) {
    console.log("認証切れ");
  }

  const data = (await response.json()) as T;

  return { response, data };
}
