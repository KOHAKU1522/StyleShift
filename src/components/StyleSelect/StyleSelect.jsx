import { useEffect, useRef, useState } from "react";
import styles from "./StyleSelect.module.css";
import { CHARACTERS_BY_GENRE, CHARACTER_MAP } from "../../data/characters";

// ジャンルごとに区切られた、スクロール可能なカスタムセレクト。
export default function StyleSelect({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const selected = CHARACTER_MAP[value];

    // 外側クリック・Escape で閉じる
    useEffect(() => {
        if (!open) return;

        const onDocClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const handleSelect = (mode) => {
        onChange(mode);
        setOpen(false);
    };

    return (
        <div className={styles.root} ref={rootRef}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((o) => !o)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span
                    className={styles.dot}
                    style={{ background: selected?.color }}
                />
                <span className={styles.triggerLabel}>
                    {selected?.label ?? "スタイルを選択"}
                </span>
                <svg
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <div className={styles.panel} role="listbox">
                    {CHARACTERS_BY_GENRE.map((genre) => (
                        <div key={genre.key} className={styles.group}>
                            <div className={styles.groupLabel}>{genre.label}</div>
                            {genre.items.map((c) => {
                                const active = c.mode === value;
                                return (
                                    <button
                                        key={c.mode}
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        className={`${styles.option} ${
                                            active ? styles.optionActive : ""
                                        }`}
                                        onClick={() => handleSelect(c.mode)}
                                    >
                                        <span
                                            className={styles.dot}
                                            style={{ background: c.color }}
                                        />
                                        <span className={styles.optionLabel}>
                                            {c.label}
                                        </span>
                                        {active && (
                                            <span className={styles.check}>
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
