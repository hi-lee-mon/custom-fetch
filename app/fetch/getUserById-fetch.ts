import "server-only";
import { User } from "../api/user/[id]/route";
import { apiFetch, HttpError, TimeoutError } from "./_lib/fetch/interceptors-fetch";
import { apiJson } from "./_lib/fetch/api-json";

type Result = { isSuccess: true; user: User } | { isSuccess: false; user: null };

export const getUserByIdFetch = async (id: string): Promise<Result> => {
  try {
    const res = await apiJson<User>(`/user/${id}`, {
      method: "GET",
      timeoutMs: 5000,
    });
    return {
      isSuccess: true,
      user: res,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`HTTPエラー: ${error.status} ${error.body}`);
    }

    if (error instanceof TimeoutError) {
      console.error(error.toString());
    }

    return {
      isSuccess: false,
      user: null,
    };
  }
};
