import axios from "axios";
import { getToken } from "../getToken";

export const server = axios.create({
  baseURL: "http://localhost:3000/api",
});

server.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("[リクエストをインターセプト]", config.method, config.url);
  return config;
});

server.interceptors.response.use(
  (response) => {
    console.log("[レスポンスをインターセプト]", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("認証切れ");
    }

    return Promise.reject(error);
  },
);
