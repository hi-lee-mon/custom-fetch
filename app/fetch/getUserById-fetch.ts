import "server-only";
import { User } from "../api/user/[id]/route";
import { apiFetch } from "./_lib/fetch/interceptors-fetch";

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
    return {
      isSuccess: false,
      user: null,
    };
  }
};
