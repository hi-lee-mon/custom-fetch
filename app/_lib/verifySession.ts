import { cookies } from "next/headers";
import { getToken } from "./getToken";

export const verifySession = async () => {
  const token = await getToken();

  if (!token) {
    return null;
  }
  return token;
};
