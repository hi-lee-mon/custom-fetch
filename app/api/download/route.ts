import { sleep } from "@/app/_lib/sleep";

const encoder = new TextEncoder();

const fileText = Array.from({ length: 1000 }, (_, index) => {
  const lineNumber = String(index + 1).padStart(4, "0");
  return `${lineNumber},fetch download progress sample\n`;
}).join("");

// 文字列をバイナリデータに変換
const fileBytes = encoder.encode(fileText);
// データの最大チャンクサイズを1KBに設定
const chunkSize = 1024;

export async function GET(request: Request) {
  if (!request.headers.get("Authorization")) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // offsetを使って開始位置を決定。開始位置がファイルサイズを超えたら終了(36000キロバイトのファイルなら36回で終了)
      for (let offset = 0; offset < fileBytes.length; offset += chunkSize) {
        controller.enqueue(fileBytes.slice(offset, offset + chunkSize));
        await sleep(100);
      }

      controller.close();
    },
  });

  // fetch APIはReadableStream の具体的なインスタンスをResponse オブジェクトの body プロパティを介して提供します
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Length": String(fileBytes.byteLength),
      "Content-Disposition": 'attachment; filename="sample.csv"',
      "Cache-Control": "no-store",
    },
  });
}
