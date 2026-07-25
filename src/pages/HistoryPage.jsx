import styles from "./HistoryPage.module.css";

import { useEffect, useState } from "react";
import Footer from "../components/Footer/Footer";
import { getHistory, removeHistory, clearHistory } from "../api/history";

// タイムスタンプを「YYYY/MM/DD HH:mm」形式に整形
function formatDate(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(
        d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HistoryPage() {
    const [history, setHistory] = useState([]);

    // 初回マウント時に localStorage から履歴を読み込む
    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleRemove = (id) => {
        setHistory(removeHistory(id));
    };

    const handleClear = () => {
        if (!window.confirm("履歴をすべて削除しますか？")) return;
        clearHistory();
        setHistory([]);
    };

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1 className={styles.title}>変換履歴</h1>
                    {history.length > 0 && (
                        <button
                            className={styles.clearButton}
                            onClick={handleClear}
                        >
                            すべて削除
                        </button>
                    )}
                </header>

                {history.length === 0 ? (
                    <p className={styles.empty}>
                        まだ履歴がありません。ホームで文章を変換すると、ここに保存されます。
                    </p>
                ) : (
                    <ul className={styles.list}>
                        {history.map((item) => (
                            <li key={item.id} className={styles.item}>
                                <div className={styles.itemHead}>
                                    <span className={styles.badge}>
                                        {item.label}
                                    </span>
                                    <span className={styles.date}>
                                        {formatDate(item.createdAt)}
                                    </span>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => handleRemove(item.id)}
                                        aria-label="この履歴を削除"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className={styles.textBlock}>
                                    <span className={styles.textLabel}>変換前</span>
                                    <p className={styles.textInput}>
                                        {item.input}
                                    </p>
                                </div>

                                <div className={styles.arrow}>↓</div>

                                <div className={styles.textBlock}>
                                    <span className={styles.textLabel}>変換後</span>
                                    <p className={styles.textOutput}>
                                        {item.output}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Footer />
        </div>
    );
}
