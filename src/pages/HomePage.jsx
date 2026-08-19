import styles from "./HomePage.module.css";

import { useEffect, useRef, useState } from "react";
import { convertText } from "../api/gemini";

import StyleSelect from "../components/StyleSelect/StyleSelect";
import Ranking from "../components/Ranking/Ranking";
import { incrementCharacterUsage } from "../api/ranking";

import Footer from "../components/Footer/Footer";
import { addHistory } from "../api/history";
import VoiceInput from "../components/VoiceInput/VoiceInput";

// テキストエリアの初期値（ここを書き換えると初期表示テキストが変わる）
const INITIAL_INPUT = `こんにちは！今日は天気がいいね。
午後は友達とカフェに行く予定だから楽しみ！`;

export default function HomePage() {
    const [inputText, setInputText] = useState(INITIAL_INPUT);
    const [mode, setMode] = useState("honorific");
    const [resultText, setResultText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const textareaRef = useRef(null);

    // テキストエリアを入力量に合わせて自動で高さ調整（一定を超えたらスクロール）
    const autoGrow = (el) => {
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
    };

    // 初期値が入っている場合に、マウント時の高さを合わせる
    useEffect(() => {
        autoGrow(textareaRef.current);
    }, []);

    const handleChange = (e) => {
        setInputText(e.target.value);
        autoGrow(e.target);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            setInputText(text);
            requestAnimationFrame(() => autoGrow(textareaRef.current));
        } catch (e) {
            console.error("ペーストに失敗しました:", e);
        }
    };

    const handleClear = () => {
        setInputText("");
        setResultText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleCopy = async () => {
        if (!resultText) return;
        try {
            await navigator.clipboard.writeText(resultText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.error("コピーに失敗しました:", e);
        }
    };

    const handleTranslate = async () => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        setResultText("変換中...");

        try {
            const result = await convertText(inputText, mode);
            setResultText(result);

            // 変換に成功したら履歴をローカルストレージに保存する
            addHistory({ input: inputText, output: result, mode });

            // 変換に成功したらキャラクターの使用回数を +1（失敗しても変換結果には影響させない）
            incrementCharacterUsage(mode).catch((e) =>
                console.error("ランキングの更新に失敗しました:", e)
            );
        } catch (error) {
            console.error("Gemini API 呼び出しに失敗しました:", error);
            setResultText(
                `変換に失敗しました: ${error?.message ?? "不明なエラー"}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const speakText = (text) => {
        if (!text) return;
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
        } catch (e) {}
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ja-JP";
        u.rate = 1;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
    };

    return (
        <>
            <div className={styles.home}>
                <header className={styles.header}>
                    <h1 className={styles.title}>StyleShift</h1>
                    <p className={styles.subtitle}>
                        文章を、好きなスタイルへ。
                    </p>
                </header>

                <main className={styles.main}>
                    <div className={styles.field}>
                        <div className={styles.fieldHead}>
                            <span className={styles.fieldLabel}>変換したい文章</span>
                            <button
                                type="button"
                                className={styles.pasteButton}
                                onClick={handlePaste}
                            >
                                ペースト
                            </button>
                        </div>

                        <textarea
                            ref={textareaRef}
                            className={styles.sentenceInput}
                            placeholder="メッセージを入力..."
                            rows={1}
                            value={inputText}
                            onChange={handleChange}
                        />

                        <VoiceInput value={inputText} onChange={setInputText} textareaRef={textareaRef} />
                    </div>

                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>スタイル</span>
                        <StyleSelect
                            value={mode}
                            onChange={setMode}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.buttonContainer}>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={handleClear}
                            aria-label="入力をクリア"
                        >
                            ✕
                        </button>

                        <button
                            type="button"
                            className={styles.translateButton}
                            onClick={handleTranslate}
                            disabled={isLoading}
                        >
                            {isLoading ? "変換中..." : "翻訳する"}
                        </button>
                    </div>

                    <div className={styles.resultContainer}>
                        <p className={styles.resultText}>
                            {resultText || "ここに結果が表示されます。"}
                        </p>
                    </div>

                    <div className={styles.bottomButtonContainer}>
                        <button
                            type="button"
                            className={styles.retryButton}
                            onClick={handleTranslate}
                            disabled={isLoading || !inputText.trim()}
                            aria-label="もう一度変換"
                        >
                            ↻
                        </button>

                        <button
                            type="button"
                            className={styles.playButton}
                            onClick={() => speakText(resultText)}
                            disabled={!resultText}
                        >
                            読み上げ
                        </button>

                        <button
                            type="button"
                            className={styles.copyButton}
                            onClick={handleCopy}
                            disabled={!resultText}
                        >
                            {copied ? "コピーしました" : "コピー"}
                        </button>
                    </div>
                </main>

                <Ranking />
            </div>

            <Footer />
        </>
    );
}
