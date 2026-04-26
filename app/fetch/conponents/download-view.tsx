"use client";

import { useEffect, useState } from "react";
import { downloadWithProgress } from "../_lib/fetch/downloadWithProgress";

export default function DownloadView() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    downloadWithProgress("download", setProgress).catch((error) => {
      console.error("ダウンロード中にエラーが発生しました:", error);
    });
  }, []);

  return (
    <div>
      <hr />
      <h1>ファイルダウンロード</h1>
      {progress}%
    </div>
  );
}
