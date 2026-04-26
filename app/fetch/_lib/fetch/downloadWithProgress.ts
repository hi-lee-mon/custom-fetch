import { apiFetch } from "./core/custom-fetch";
import { client } from "./client/client";
import { ApiFetchOptions, Hooks } from "./type";

export async function downloadWithProgress(
  url: string,
  onProgress: (progress: number) => void,
  options?: ApiFetchOptions,
  hooks?: Hooks,
) {
  const response = await client.fetch(url, options, hooks);

  if (!response.body) {
    throw new Error("ReadableStream not supported");
  }

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? Number(contentLength) : 0;

  // ネットワークから届いたデータをちょっとずつ処理する
  const stream = response.body;
  // readerを使ったストリームの読み取り
  const reader = stream.getReader();
  const chunks: BlobPart[] = [];

  let received = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break; // 読み取るデータなしで抜ける
    if (!value) continue;

    chunks.push(new Uint8Array(value));
    received += value.length;

    if (total > 0) {
      onProgress((received / total) * 100);
    }
  }

  return new Blob(chunks);
}
