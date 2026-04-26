import { unauthorized } from "next/navigation";
import { verifySession } from "../_lib/verifySession";
import { getUserByIdFetch } from "./getUserById-fetch";
import DownloadView from "./conponents/download-view";

export default async function Home() {
  const session = await verifySession();

  if (!session) {
    // app/unauthorized.tsxを表示するnextの実験的機能
    unauthorized();
  }

  const res = await getUserByIdFetch("1");

  if (!res.isSuccess) {
    return (
      <div>
        <p>ユーザの情報の取得に失敗しました。しばらく経ってから再度お試しください。</p>
      </div>
    );
  }

  return (
    <div>
      <ul>
        <li>ID: {res.user.id}</li>
        <li>Name: {res.user.name}</li>
        <li>Age: {res.user.age}</li>
      </ul>
      <DownloadView />
    </div>
  );
}
