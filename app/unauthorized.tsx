import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main>
      <p>ログインしてください</p>
      <Link href="/login">ログインページに進む</Link>
    </main>
  );
}
