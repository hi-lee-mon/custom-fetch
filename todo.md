# TODO

`article.md` の説明からは意図的に外しているが、本来の実装では考慮すべき点。

## API設計

- `apiFetch` が JSON 専用なのか、生の `Response` を返す汎用ラッパーなのかを分ける
- `204 No Content` や text レスポンス、blob レスポンスをどう扱うか決める
- `Content-Type` が `application/json` ではない成功レスポンスの扱いを決める
- `baseURL` を `localhost:3000` 直書きではなく環境変数や実行環境に応じて解決する
- 相対 URL と絶対 URL のどちらを許可するか決める
- `skipAuth` のような boolean が増えた時に `profile` や client factory に寄せるか検討する

## エラーハンドリング

- `HttpError` の `body` 型を `unknown` のままにするか、共通エラー型を定義するか決める
- ネットワークエラー、DNS エラー、タイムアウト、HTTP 4xx/5xx を分けて扱う
- `401` と `403` と `500` を UI 上でどう出し分けるか整理する
- エラーレスポンス本文が JSON でない場合のログ出力方針を決める
- エラー時に `response.headers` や `url` も保持するか検討する
- `console.error` だけでなく監視基盤へ送る想定を持つ

## 認証・認可

- token がない場合、期限切れの場合、権限不足の場合を分けて扱う
- cookie ベース認証と `Authorization` ヘッダーのどちらを正として扱うか明確にする
- `skipAuth` を許可するエンドポイントの範囲を整理する
- CSRF 対策が必要な構成か確認する
- token refresh が必要なら再試行戦略をどう組み込むか決める

## fetch固有の考慮

- `fetch` は HTTP エラーで throw しない前提を helper に閉じ込める
- `AbortController` による timeout/cancel の責務をどこに置くか決める
- `RequestInit.signal` を外から受け取る場合の合成方法を考える
- `fetch` のキャッシュ挙動を `cache`, `revalidate`, `tags` まで含めて整理する
- Next.js の Server Component で `fetch` を使う利点と、axios を使うケースを明確に分ける

## 型安全性

- `response.json() as T` の unchecked cast をどこまで許容するか決める
- 必要なら Zod などでランタイムバリデーションを入れる
- 成功レスポンス型と失敗レスポンス型を discriminated union にする
- `HttpError` の generic 化が必要か検討する
- 返り値を `{ response, data }` にするか `data` のみ返すか方針を決める

## 実装品質

- logging を `console.log` のままにせず logger に寄せる
- request/response ログに個人情報や token を出さないようにする
- 共通ヘッダーのマージ順を明確にする
- retry を入れる場合、再送してよいメソッドだけに制限する
- unit test と integration test をどこまで用意するか決める
- モックしやすいように `fetch` 注入や client factory の余地を残す

## Next.js文脈

- Server Component から内部 API を叩くのか、直接データ取得するのか使い分けを整理する
- `unauthorized()` / `forbidden()` / `redirect()` の使い分けを揃える
- `error.tsx` と expected error の責務分離を明確にする
- Route Handler を記事用のサンプルとして割り切るのか、実運用に近づけるのか決める
