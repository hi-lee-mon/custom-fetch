"use server";

import { cookies } from "next/headers";

export async function setCookieAction() {
  const cookieStore = await cookies();

  cookieStore.set("token", "dummy-token");
}
