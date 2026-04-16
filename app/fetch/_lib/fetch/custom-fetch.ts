import { createApiClient } from "./create-api-client";

export const customFetch = createApiClient({
  baseURL: "http://localhost:3000/api/",
});
