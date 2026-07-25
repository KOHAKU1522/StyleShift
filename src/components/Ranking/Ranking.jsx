import { useEffect, useMemo, useState } from "react";
import styles from "./Ranking.module.css";
import { subscribeUsage } from "../../api/ranking"

export default function Ranking() {
    // [{ mode, label, color, count }] （count降順）
    const [usage, setUsage] = useState([]);

    useEffect(() => {
        // Firestore の使用回数をリアルタイム購読。アンマウント時に解除。
        const unsubscribe = subscribeUsage(setUsage);
        return () => unsubscribe();
    }, []);

    // 実際に使われた（count>0）キャラクターだけを対象にする
    const used = useMemo(() => usage.filter((u) => u.count > 0), [usage]);

    const total = useMemo(
        () => used.reduce((sum, u) => sum + u.count, 0),
        [used]
    );

    const top5 = used.slice(0, 5);

    // 割合（%）を付与
    const withPercent = useMemo(
        () =>
            used.map((u) => ({
                ...u,
                percent: total > 0 ? (u.count / total) * 100 : 0,
            })),
        [used, total]
    );

    // conic-gradient 用の色停止位置を組み立てる
    const pieBackground = useMemo(() => {
        if (total === 0) return "var(--surface-muted)";

        let acc = 0;
        const stops = withPercent.map((u) => {
            const start = acc;
            acc += u.percent;
            return `${u.color} ${start}% ${acc}%`;
        });
        return `conic-gradient(${stops.join(", ")})`;
    }, [withPercent, total]);

    return (
        <div className={styles.ranking}>
            <h2 className={styles.heading}>変換ランキング</h2>

            {total === 0 ? (
                <p className={styles.empty}>
                    まだ変換されていません。変換するとここに集計されます。
                </p>
            ) : (
                <div className={styles.layout}>
                    {/* 左：トップ5 */}
                    <section className={styles.rankSection}>
                        <h3 className={styles.subHeading}>トップ5</h3>
                        <ol className={styles.rankList}>
                            {top5.map((u, i) => (
                                <li key={u.mode} className={styles.rankItem}>
                                    <span
                                        className={styles.rankNo}
                                        data-rank={i + 1}
                                    >
                                        {i + 1}
                                    </span>
                                    <span
                                        className={styles.dot}
                                        style={{ background: u.color }}
                                    />
                                    <span className={styles.rankLabel}>
                                        {u.label}
                                    </span>
                                    <span className={styles.rankCount}>
                                        {u.count}回
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* 右：割合の円グラフ */}
                    <section className={styles.chartSection}>
                        <h3 className={styles.subHeading}>使用割合</h3>
                        <div className={styles.chartArea}>
                            <div
                                className={styles.pie}
                                style={{ background: pieBackground }}
                                role="img"
                                aria-label="キャラクター使用割合の円グラフ"
                            >
                                <div className={styles.pieHole}>
                                    <span className={styles.pieTotal}>
                                        {total}
                                    </span>
                                    <span className={styles.pieTotalLabel}>
                                        回
                                    </span>
                                </div>
                            </div>

                            <ul className={styles.legend}>
                                {withPercent.map((u) => (
                                    <li key={u.mode} className={styles.legendItem}>
                                        <span
                                            className={styles.dot}
                                            style={{ background: u.color }}
                                        />
                                        <span className={styles.legendLabel}>
                                            {u.label}
                                        </span>
                                        <span className={styles.legendPercent}>
                                            {u.percent.toFixed(1)}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
