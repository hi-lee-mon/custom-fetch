"use client";
import { setCookieAction } from "./setCookie";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div>
      <h1>ログイン画面</h1>
      <button
        className="border px-2 py-1 rounded-2xl cursor-pointer"
        type="button"
        onClick={async () => {
          await setCookieAction();
          router.push("/");
        }}
      >
        ログイン
      </button>
    </div>
  );
}
