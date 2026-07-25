// Netlify Function: Gemini API を中継する。
// APIキー(GEMINI_API_KEY)はサーバー側の環境変数から読むため、ブラウザには一切露出しない。
// フロントは組み立て済みの prompt と temperature を送るだけ。

const MODEL = "gemini-flash-lite-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(500, { error: "サーバーに GEMINI_API_KEY が設定されていません。" });
  }

  let prompt;
  let temperature;
  try {
    ({ prompt, temperature } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { error: "リクエストの形式が不正です。" });
  }

  if (typeof prompt !== "string" || !prompt.trim()) {
    return json(400, { error: "prompt がありません。" });
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: typeof temperature === "number" ? temperature : 0.5,
    },
  };

  // 503(混雑)は一時的なので少しリトライ（Netlify無料枠の実行時間内に収まる範囲）
  const maxRetries = 2;
  let lastError = "不明なエラー";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p) => p.text ?? "")
            .join("") ?? "";
        return json(200, { text });
      }

      lastError = data?.error?.message ?? `HTTP ${res.status}`;

      if (res.status === 503 && attempt < maxRetries) {
        await sleep(800 * 2 ** attempt);
        continue;
      }
      return json(res.status, { error: lastError });
    } catch (e) {
      lastError = e?.message ?? "通信エラー";
      if (attempt < maxRetries) {
        await sleep(800 * 2 ** attempt);
        continue;
      }
    }
  }

  return json(502, { error: lastError });
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
