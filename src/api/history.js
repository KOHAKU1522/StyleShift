import { CHARACTER_MAP } from "../data/characters";

// localStorage に履歴を保存するためのキー
const STORAGE_KEY = "styleshift_history";

// 保存する履歴の最大件数（古いものから削除）
const MAX_ITEMS = 100;

// 履歴を全件取得する（新しい順）。壊れたデータは空配列として扱う。
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("履歴の読み込みに失敗しました:", e);
    return [];
  }
}

// 変換履歴を1件追加する。
//   input  : 変換前の文章
//   output : 変換後の文章
//   mode   : 変換モード（キー）
export function addHistory({ input, output, mode }) {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input,
    output,
    mode,
    label: CHARACTER_MAP[mode]?.label ?? mode,
    createdAt: Date.now(),
  };

  // 新しいものを先頭に。上限を超えたら古いものを切り捨てる。
  const next = [item, ...getHistory()].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("履歴の保存に失敗しました:", e);
  }

  return item;
}

// 指定IDの履歴を1件削除する。
export function removeHistory(id) {
  const next = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

// 履歴をすべて削除する。
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
