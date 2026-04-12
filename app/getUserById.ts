import "server-only";

import { User } from "./api/user/[id]/route";
import { server } from "./_lib/axios/server";

type Result = { isSuccess: true; user: User } | { isSuccess: false; user: null };

export const getUserById = async (id: string): Promise<Result> => {
  try {
    const res = await server.get<User>(`/user/${id}`);
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
