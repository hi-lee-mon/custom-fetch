import "server-only";
import { User } from "../api/user/[id]/route";
import { apiFetch, HttpError } from "./_lib/fetch/interceptors-fetch";

type Result = { isSuccess: true; user: User } | { isSuccess: false; user: null };

export const getUserByIdFetch = async (id: string): Promise<Result> => {
  try {
    const res = await apiFetch<User>(`/user/${id}`, {
      method: "GET",
    });
    return {
      isSuccess: true,
      user: res.data,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`HTTPエラー: ${error.status} ${error.body}`);
    }

    return {
      isSuccess: false,
      user: null,
    };
  }
};
