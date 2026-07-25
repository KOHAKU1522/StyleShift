// ランキング・セレクトで扱う「キャラクター（変換モード）」の一覧。
//
// 表示名(label)は instructions.js を唯一の情報源として取り出す（名前の一元管理）。
// ここでは表示上のメタ情報だけを持つ:
//   mode  : 変換モードのキー（instructions.js のキー・Firestore のID・convertText に渡す値）
//   genre : ジャンル（セレクトの区切り用）
//   color : 円グラフ／ランキングで使う色
import { instructions } from "../api/instructions";

// ジャンル定義（セレクトの表示順・見出しに使う）
export const GENRES = [
  { key: "rewrite", label: "言い換え" },
  { key: "translate", label: "翻訳" },
  { key: "fun", label: "ネタ" },
];

// mode → genre / color（label は持たない）
const META = [
  { mode: "soften", genre: "rewrite", color: "#4f6ef7" },
  { mode: "honorific", genre: "rewrite", color: "#2fb27a" },
  { mode: "business", genre: "rewrite", color: "#f59e0b" },
  { mode: "casual", genre: "rewrite", color: "#ef5b6b" },
  { mode: "summary", genre: "rewrite", color: "#8b5cf6" },
  { mode: "beginner", genre: "rewrite", color: "#06b6d4" },
  { mode: "child", genre: "rewrite", color: "#f472b6" },

  { mode: "japanese", genre: "translate", color: "#10b981" },
  { mode: "english", genre: "translate", color: "#3b82f6" },
  { mode: "chinese", genre: "translate", color: "#ef4444" },
  { mode: "korean", genre: "translate", color: "#a855f7" },

  { mode: "ai", genre: "fun", color: "#14b8a6" },
  { mode: "kansai", genre: "fun", color: "#f97316" },
  { mode: "ojisan", genre: "fun", color: "#eab308" },
  { mode: "mesugaki", genre: "fun", color: "#ec4899" },
  { mode: "sarcastic", genre: "fun", color: "#64748b" },
  { mode: "engineer", genre: "fun", color: "#0ea5e9" },
  { mode: "code", genre: "fun", color: "#22c55e" },
];

// label を instructions.js から補完したキャラクター一覧
export const CHARACTERS = META.map((m) => ({
  ...m,
  label: instructions[m.mode]?.label ?? m.mode,
}));

// mode をキーにして { genre, color, label } を引ける辞書
export const CHARACTER_MAP = Object.fromEntries(
  CHARACTERS.map((c) => [c.mode, c])
);

// ジャンルごとにまとめた配列 [{ key, label, items: [...] }]（セレクトの区切り表示用）
export const CHARACTERS_BY_GENRE = GENRES.map((g) => ({
  ...g,
  items: CHARACTERS.filter((c) => c.genre === g.key),
}));
