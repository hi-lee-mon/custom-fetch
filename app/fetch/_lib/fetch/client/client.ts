import { getToken } from "@/app/_lib/getToken";
import { createApiClient } from "../core/create-api-client";

// クライアントサイドで使用するAPIクライアントを作成
export const client = createApiClient({
  baseURL: "http://localhost:3000/api/",
  hooks: {
    beforeRequest: [
      async (request) => {
        const mergedHeaders = new Headers(request.headers);
        document.cookie.split(";").forEach((cookie) => {
          const [name, value] = cookie.trim().split("=");
          if (name === "token") {
            mergedHeaders.set("Authorization", `Bearer ${value}`);
          }
        });

        return new Request(request, { headers: mergedHeaders });
      },
    ],
  },
});
