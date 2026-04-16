了解です。
その流れなら、**「最初はAxiosの便利さを新人くんが押し出す → シニアさんが“実は分解すると代替できる”と整理する → 各機能を順番に実装で崩していく → 最後にラッパー構成を収束させる」** という構成がかなりきれいです。

以下、**そのまま記事の土台にできる長編の会話形式**で整理します。

---

# Axiosって本当に必要？新人くんとシニアさんで、`fetch` / `XMLHttpRequest` 置き換えを本気で整理してみた

## はじめに

ある日、新人くんがこう言いました。

---

### 新人くん

「Axiosって便利ですよね。
だからやっぱり `fetch` には置き換えられないと思うんです。」

---

### シニアさん

「本当にそうかな。
一回、できることを分解してみようか。」

---

この記事では、そんな会話を通して、

- Axiosで何ができるのか
- それは本当にAxios固有なのか
- 実際どう実装すれば置き換えられるのか
- 最終的にどんな構成に落ち着くのか

を順番に整理していきます。

---

# まず、新人くんが思う「Axiosでできること」

### 新人くん

「まず、Axiosってこんなことできますよね。」

| 機能               | できること                               |
| ------------------ | ---------------------------------------- |
| interceptors       | リクエスト前後で共通処理を入れられる     |
| エラーハンドリング | HTTPエラーをまとめて扱いやすい           |
| timeout            | 一定時間で打ち切れる                     |
| cancel             | リクエストを中断できる                   |
| JSON送受信         | JSONを扱いやすい                         |
| 共通ヘッダー       | Authorizationなどを毎回自動で付けられる  |
| baseURL            | APIのURLをまとめられる                   |
| ダウンロード進捗   | 進捗を表示できる                         |
| アップロード進捗   | ファイルアップロード時の進捗を表示できる |

---

### 新人くん

「これだけできるなら、やっぱりAxiosを使う理由ありますよね？」

---

# シニアさんが整理する：「その機能、本当にAxiosにしかない？」

### シニアさん

「今の表、すごく大事。
でも次に見るべきなのはこれ。」

> **その機能がAxiosにしかないのか**
> それとも
> **単にAxiosが便利にまとめているだけなのか**

---

### シニアさん

「じゃあ表を更新してみよう。」

| 機能               | Axiosでできる | 代替できるか | どう考えるべきか                  |
| ------------------ | ------------- | ------------ | --------------------------------- |
| interceptors       | できる        | できる       | 共通処理を挟むだけ                |
| エラーハンドリング | できる        | できる       | HTTPエラーを自分でthrowすればよい |
| timeout            | できる        | できる       | 中断処理を時間で発火するだけ      |
| cancel             | できる        | できる       | リクエスト中断の仕組みで代替可能  |
| JSON送受信         | できる        | できる       | 共通化で吸収可能                  |
| 共通ヘッダー       | できる        | できる       | ラッパーで付与可能                |
| baseURL            | できる        | できる       | クライアント関数で吸収可能        |
| ダウンロード進捗   | できる        | できる       | 仕組みはある                      |
| アップロード進捗   | できる        | 一部注意     | ここだけ別の実装が現実的          |

---

### 新人くん

「え、ほぼ全部“できる”になってますけど……」

---

### シニアさん

「そう。
ここがこの記事の出発点。」

> Axiosが特別なのではなく、
> **便利な機能を最初からまとめて提供している**だけの部分が多い

---

# では順番に崩していこう。まずは interceptors

## 「interceptorsがあるからAxiosが必要」は本当か？

### 新人くん

「でも `interceptors` はAxiosの代表機能ですよね。
あれってかなり便利じゃないですか？」

---

### シニアさん

「便利なのはその通り。
でも、やっていることを分解するとシンプルなんだ。」

---

## Axiosでよくある例

```ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("[request]", config.method, config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("[response]", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("認証切れ");
    }

    return Promise.reject(error);
  },
);
```

---

### シニアさん

「ここでやっているのは、要するにこれだけ。」

- リクエスト前にトークンを付ける
- ログを出す
- レスポンス後にログを出す
- 401時に共通処理する

---

### 新人くん

「言われてみると、特別なことはしてないですね」

---

## 代替の考え方

### シニアさん

「じゃあ、通信の前後に処理を挟めばいい。
つまり“共通関数”を通せばいい。」

---

## 実装例

```ts
type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch(input: RequestInfo | URL, options: ApiFetchOptions = {}) {
  const { skipAuth, headers, ...rest } = options;

  // request interceptor 相当
  const token = localStorage.getItem("token");
  const mergedHeaders = new Headers(headers);

  if (!skipAuth && token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  console.log("[request]", rest.method ?? "GET", input);

  const response = await fetch(input, {
    ...rest,
    headers: mergedHeaders,
  });

  // response interceptor 相当
  console.log("[response]", response.status, input);

  if (response.status === 401) {
    console.log("認証切れ");
  }

  return response;
}
```

---

### 新人くん

「これ、かなりそれっぽいですね」

---

### シニアさん

「そう。
`interceptor` という名前のAPIがなくても、
**前後に処理を置ければ本質的には同じことができる。**」

---

# 次はHTTPエラーハンドリング

## 「Axiosはエラーをthrowしてくれるから便利」

### 新人くん

「Axiosって 404 とか 500 で `catch` に入ってくれるじゃないですか。
あれが便利なんですよね。」

---

### シニアさん

「ここはかなり大事。
実はAxiosが特別にすごいというより、**HTTPエラーを例外に変換している**だけなんだ。」

---

## 問題の整理

### シニアさん

「Axiosっぽい感覚だとこうなる。」

```ts
try {
  await axios.get("/api/user");
} catch (e) {
  console.log("エラー");
}
```

「でも、素朴な通信だと `404` や `500` でも通信自体は成功扱いになることがある。
だから自分で“HTTPとして失敗なら例外にする”必要がある。」

---

## 実装例

```ts
export class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, body?: unknown) {
    super(`HTTP Error: ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

async function parseErrorBody(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
```

```ts
export async function apiFetch(input: RequestInfo | URL, options: ApiFetchOptions = {}) {
  const { skipAuth, headers, ...rest } = options;

  const token = localStorage.getItem("token");
  const mergedHeaders = new Headers(headers);

  if (!skipAuth && token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  console.log("[request]", rest.method ?? "GET", input);

  const response = await fetch(input, {
    ...rest,
    headers: mergedHeaders,
  });

  console.log("[response]", response.status, input);

  if (!response.ok) {
    const body = await parseErrorBody(response);

    if (response.status === 401) {
      console.log("認証切れ");
    }

    throw new HttpError(response.status, body);
  }

  return response;
}
```

---

### 新人くん

「なるほど。
Axiosの“便利さ”を自分で明示的に書いてるだけなんですね。」

---

# 次は timeout と cancel

## 「Axiosはtimeoutやcancelが簡単」

### 新人くん

「これもよく聞きます。」

```ts
await axios.get("/api/user", {
  timeout: 5000,
});
```

「あと、中断もできますよね。」

---

### シニアさん

「ここも本質はシンプル。
**一定時間後に中断する**、それだけ。」

---

## 実装例

```ts
export class TimeoutError extends Error {
  constructor() {
    super("Request timeout");
    this.name = "TimeoutError";
  }
}
```

```ts
type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  timeoutMs?: number;
};
```

```ts
export async function apiFetch(input: RequestInfo | URL, options: ApiFetchOptions = {}) {
  const { skipAuth, timeoutMs = 5000, headers, ...rest } = options;

  const token = localStorage.getItem("token");
  const mergedHeaders = new Headers(headers);

  if (!skipAuth && token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    console.log("[request]", rest.method ?? "GET", input);

    const response = await fetch(input, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    console.log("[response]", response.status, input);

    if (!response.ok) {
      const body = await parseErrorBody(response);
      throw new HttpError(response.status, body);
    }

    return response;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new TimeoutError();
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

### 新人くん

「中断も timeout も、結局同じ“止める”仕組みで整理できるんですね」

---

### シニアさん

「そう。
だから別々のすごい機能というより、**1つの中断の仕組みをどう使うか**の話なんだ。」

---

# 次はJSON送受信

## 「JSONを扱うなら専用の関数が欲しい」

### 新人くん

「でも、JSONって毎回ちょっと面倒ですよね。」

---

### シニアさん

「そこは専用の薄い関数を1枚用意するときれいになる。」

---

## 実装例

```ts
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type ApiJsonOptions = Omit<ApiFetchOptions, "body"> & {
  body?: JsonValue;
};
```

```ts
export async function apiJson<T>(
  input: RequestInfo | URL,
  options: ApiJsonOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const mergedHeaders = new Headers(headers);

  if (body !== undefined) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  const response = await apiFetch(input, {
    ...rest,
    headers: mergedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return response.json() as Promise<T>;
}
```

---

### 新人くん

「これはかなり使いやすいですね。」

---

### シニアさん

「そう。
ここで大事なのは、これは**必須の仕組みではない**こと。」

> コアは `apiFetch`
> `apiJson` はJSONを楽に扱うための薄い補助

---

# 次は baseURL や共通設定

## 「axios.create() みたいなこともしたい」

### 新人くん

「baseURLも欲しいです。」

---

### シニアさん

「そこはファクトリ関数に寄せればいい。」

---

## 実装例

```ts
type ClientConfig = {
  baseURL: string;
  defaultOptions?: ApiFetchOptions;
};

export function createApiClient(config: ClientConfig) {
  return {
    fetch(path: string, options: ApiFetchOptions = {}) {
      return apiFetch(`${config.baseURL}${path}`, {
        ...config.defaultOptions,
        ...options,
        headers: {
          ...(config.defaultOptions?.headers ?? {}),
          ...(options.headers ?? {}),
        },
      });
    },

    json<T>(path: string, options: ApiJsonOptions = {}) {
      return apiJson<T>(`${config.baseURL}${path}`, {
        ...config.defaultOptions,
        ...options,
        headers: {
          ...(config.defaultOptions?.headers ?? {}),
          ...(options.headers ?? {}),
        },
      });
    },
  };
}
```

---

### 新人くん

「ここまでくると、かなりAxiosの使い心地に近いですね」

---

### シニアさん

「そう。
ただ、この記事の本題は“そっくり再現すること”ではなくて、
**必要な機能は分解すると十分作れる**、という点。」

---

# 次はダウンロード進捗

## 「進捗表示はどうするんですか？」

### 新人くん

「ダウンロードの進捗表示って便利ですよね。」

---

### シニアさん

「ここは少しだけ実装が長くなるけど、考え方は素朴。」

> 受け取ったデータ量を少しずつ数える

---

## 実装例

```ts
export async function downloadWithProgress(url: string, onProgress: (progress: number) => void) {
  const response = await apiFetch(url);

  if (!response.body) {
    throw new Error("ReadableStream not supported");
  }

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? Number(contentLength) : 0;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];

  let received = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;
    if (!value) continue;

    chunks.push(value);
    received += value.length;

    if (total > 0) {
      onProgress((received / total) * 100);
    }
  }

  return new Blob(chunks);
}
```

---

### 新人くん

「できるけど、これは確かにちょっと面倒ですね」

---

### シニアさん

「そう。
“できない”ではなく、“少し手で書く必要がある”が正しい。」

---

# 最後の難所：アップロード進捗

## 「アップロードも同じですか？」

### 新人くん

「ファイルアップロードの進捗も同じ感じでいけますか？」

---

### シニアさん

「ここはちゃんと正直に言おう。」

> ここだけは、別の手段を使うのが現実的

---

### 新人くん

「つまり？」

---

### シニアさん

「アップロード進捗は、**専用のイベントを持つ実装を使う**のが分かりやすい。」

---

## 実装例

```ts
export function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress((event.loaded / event.total) * 100);
    };

    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(new Error("Upload failed"));

    const formData = new FormData();
    formData.append("file", file);

    xhr.send(formData);
  });
}
```

---

### 新人くん

「なるほど。
全部を1つの仕組みで無理やりやるんじゃなくて、ここだけ分けるんですね。」

---

### シニアさん

「そう。
記事としてもここは大事。」

> 何でも1つに押し込めるのではなく、
> **向いている実装を使い分ける**方が自然

---

# ここまでを整理しよう

### 新人くん

「ここまで色々実装してきたので、逆に混乱してきました。
結局、何個必要なんですか？」

---

### シニアさん

「ここで収束させよう。
教育のために分けて説明してきたけど、最終的な構成はかなりシンプルになる。」

---

## 最終的な整理

| 役割                              | 何を担当するか                                          | 実装                                          |
| --------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| コア                              | 共通ヘッダー、認証、エラー、timeout、中断、共通前後処理 | `apiFetch`                                    |
| JSON専用                          | JSONの送受信を楽にする                                  | `apiJson`                                     |
| 進捗付きアップロード/ダウンロード | 進捗イベントが必要な処理                                | `downloadWithProgress` / `uploadWithProgress` |

---

### 新人くん

「つまり、たくさんの小さいラッパーが必要なんじゃなくて……」

---

### シニアさん

「そう。
最終的にはこう考えればいい。」

> **1. コア**
> **2. JSON専用**
> **3. 進捗系（必要なら）**

---

# 最後に、記事として一番言いたいこと

### シニアさん

「Axiosの便利さを否定したいわけじゃない。
でも、理解しておきたいのはこれ。」

> Axiosは“魔法のライブラリ”ではない
> 多くの便利機能は、分解すると自分たちで整理できる

---

### 新人くん

「たしかに、“Axiosにしかできない”と思っていたものが、
実はかなり整理できることが分かりました。」

---

# まとめ

この会話を通して見えてきたことを整理すると、こうなります。

| ポイント           | 結論                                       |
| ------------------ | ------------------------------------------ |
| interceptors       | 共通関数で代替できる                       |
| エラーハンドリング | HTTPエラーを自分でthrowすればよい          |
| timeout / cancel   | 中断の仕組みでまとめて扱える               |
| JSON送受信         | 専用関数を1枚足せば十分                    |
| ダウンロード進捗   | 実装可能                                   |
| アップロード進捗   | ここだけ別実装が現実的                     |
| 最終構成           | コア / JSON専用 / 進捗系 の3つに整理できる |

---

# 結論

> 最初はAxiosの便利さが目に入る。
> でも一つずつ分解していくと、必要なものは意外と少ない。
>
> 最終的には、
>
> - **コア**
> - **JSON専用**
> - **進捗系**
>
> の3つに整理できる。

そして大事なのは、**Axiosを使うかどうか**ではなく、
**自分たちが何を必要としているかを分解して理解すること**です。

---

必要なら次に、この内容をさらに整えて
**「Qiita/Zennにそのまま貼れる完成版」** にします。
