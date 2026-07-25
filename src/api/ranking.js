import {
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CHARACTER_MAP } from "../data/characters";

const MAX_COUNT = 1000;

// Firestore のコレクション名。1キャラクター = 1ドキュメント（ドキュメントID = mode）。
const COLLECTION = "characterUsage";

// 連打防止用: 同じモードは COOLDOWN_MS の間に1回しかカウントしない。
const COOLDOWN_KEY = "styleshift_rank_cooldown";
const COOLDOWN_MS = 10000; // 10秒

// クールダウン中でないかを判定し、カウント可能なら最終時刻を更新して true を返す。
// localStorage が使えない環境では制限せず true（通常どおりカウント）。
function canCount(mode) {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const now = Date.now();

    if (now - (map[mode] ?? 0) < COOLDOWN_MS) return false;

    map[mode] = now;
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(map));
    return true;
  } catch (e) {
    console.error("クールダウン判定に失敗しました:", e);
    return true;
  }
}

// 指定した変換モードの使用回数を +1 する。
// ドキュメントが無ければ merge により自動作成される。
// 連打防止のため、同じモードは一定時間に1回だけカウントする。
export async function incrementCharacterUsage(mode) {
  // クールダウン中はランキングに加算しない（変換自体は通常どおり行われる）
  if (!canCount(mode)) return;

  const ref = doc(db, COLLECTION, mode);
  await setDoc(ref, { count: increment(1) }, { merge: true });

  // 荒らし対策: 加算後の実際の値を読み取り、100を超えていたら半分にする
  const snap = await getDoc(ref);
  const current = snap.data()?.count ?? 0;
  if (current > MAX_COUNT) {
    await setDoc(ref, { count: MAX_COUNT }, { merge: true });
  }
}

// 使用回数の変化をリアルタイムに購読する。
// callback には [{ mode, label, color, count }] の配列（count降順）が渡される。
// 戻り値は購読解除用の関数。
export function subscribeUsage(callback) {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    const list = snapshot.docs.map((d) => {
      const mode = d.id;
      const info = CHARACTER_MAP[mode];
      return {
        mode,
        label: info?.label ?? mode,
        color: info?.color ?? "#9aa0b4",
        count: d.data().count ?? 0,
      };
    });

    list.sort((a, b) => b.count - a.count);
    callback(list);
  });
}
