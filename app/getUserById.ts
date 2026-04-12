import "server-only";

import axios from "axios";
import { User } from "./api/user/[id]/route";

type Result = { isSuccess: true; user: User } | { isSuccess: false; user: null };

export const getUserById = async (id: string): Promise<Result> => {
  try {
    const res = await axios.get<User>(`http://localhost:3000/api/user/${id}`);
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
