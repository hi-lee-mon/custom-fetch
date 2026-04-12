import { sleep } from "@/app/_lib/sleep";

export type User = {
  id: string;
  name: string;
  age: number;
};

export async function GET(request: Request) {
  await sleep(2000);

  if (!request.headers.get("Authorization")) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = {
    id: "1",
    name: "Yamada",
    age: 30,
  } satisfies User;

  return Response.json(res);
}
