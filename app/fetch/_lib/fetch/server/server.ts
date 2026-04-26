import { getToken } from "@/app/_lib/getToken";
import { createApiClient } from "../core/create-api-client";

// サーバーサイドで使用するAPIクライアントを作成
export const server = createApiClient({
  baseURL: "http://localhost:3000/api/",
  hooks: {
    beforeRequest: [
      async (request) => {
        const mergedHeaders = new Headers(request.headers);
        const token = await getToken();
        if (token) {
          mergedHeaders.set("Authorization", `Bearer ${token}`);
        }
        return new Request(request, { headers: mergedHeaders });
      },
    ],
  },
});
