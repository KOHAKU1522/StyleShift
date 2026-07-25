import { instructions } from "./instructions";

// Gemini は Netlify Function 経由で呼び出す（APIキーはサーバー側に隠す）。
const CONVERT_ENDPOINT = "/.netlify/functions/convert";

// Gemini に対する共通の前提プロンプト（システムプロンプト）。
// ※ 詳細な設定は後でこちらで追記する想定の簡易版。
const SYSTEM_PROMPT = `
あなたは文章変換専用AIです。

ユーザーの文章を、指定されたスタイルに従って自然な文章へ変換してください。

【基本方針】
- 元の意味や意図をできるだけ維持する
- スタイル指示が最優先
- 内容を勝手に追加しない
- 不必要に長くしない
- 人名・日時・数値などは保持する
- 実際に人間が使う自然な表現にする

【文体の維持】
- 入力文の敬語・タメ口・話し方の雰囲気はできるだけ維持する
- スタイル指示で明示されていない限り、勝手に敬語化・タメ口化しない
- 一人称・二人称・視点を勝手に変更しない

【出力ルール】
- 変換後の文章のみを出力する
- 解説、前置き、補足は禁止
- Markdownは禁止
- 複数案は禁止
- 「変換結果」などの文言は禁止
- 必要最低限の改行のみ許可

【変換時の注意】
- 入力文に対する返答、共感、感想、アドバイスを追加しない
- ユーザーに話しかける文章にしない
- 「〜だよね」「〜なんですね」「気持ちが分かるよ」などの対話形式は禁止
- ただし、指定されたスタイルの再現に必要な場合はこの限りではない
- 元の文章そのものを書き換えることに集中する
- 元の文章に存在しない情報、感情、設定を追加しない
- 主語や視点を変更しない

【補足】
- 意味が曖昧でも推測して変換する
- スタイルによっては感情やニュアンスの変更を許可する

【入力が特殊な場合】
- 意味が不明な文章でも、推測できる範囲で自然に変換する
- 一単語のみの場合も変換を試みる
- 空文字の場合は空文字を返す
`;

// instructions.js の examples（few-shot 例文）をプロンプト用の文字列に変換する。
// 例文が未登録（空配列）の場合は空文字を返す。
function buildExamples(examples) {
  if (!examples || examples.length === 0) return "";

  const body = examples
    .map((ex) => `入力:\n${ex.input}\n出力:\n${ex.output}`)
    .join("\n\n");

  return `\n\n# 例\n${body}`;
}

// instructions.js の dictionary（変換辞書）をプロンプト用の文字列に変換する。
// 辞書は { "変換前の語": "変換後の語" } のオブジェクト。
// 未登録（空）の場合は無視して空文字を返す。
function buildDictionary(dictionary) {
  if (!dictionary) return "";

  const entries = Object.entries(dictionary);
  if (entries.length === 0) return "";

  const body = entries.map(([from, to]) => `「${from}」→「${to}」`).join("\n");

  return `\n\n# 変換辞書（以下の語が現れたら必ずこの通りに置き換える）\n${body}`;
}

export async function convertText(text, style) {
  const config = instructions[style];

  // ルールの指定がない場合は「「スタイル」風に変換してください。」という簡易ルールを使う
  const rule = config?.rule ?? `「${style}」風に変換してください。`;
  const examples = buildExamples(config?.examples);
  const dictionary = buildDictionary(config?.dictionary);
  const temperature = config?.temperature ?? 0.5;

  // Gemini に渡すプロンプトを組み立てる
  const prompt = `${SYSTEM_PROMPT}

# 変換ルール
${rule}${dictionary}${examples}

# 入力
${text}`;

  // 30秒でタイムアウト（無限ロード防止）
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  let res;
  try {
    res = await fetch(CONVERT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, temperature }),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    if (e?.name === "AbortError") {
      throw new Error("タイムアウトしました。時間をおいて再度お試しください。");
    }
    throw new Error("変換サーバーに接続できませんでした。");
  }
  clearTimeout(timer);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error ?? `変換に失敗しました (HTTP ${res.status})`);
  }

  return data.text ?? "";
}
