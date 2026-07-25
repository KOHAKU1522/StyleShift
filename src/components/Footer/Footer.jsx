import { NavLink } from "react-router-dom";
import styles from "./Footer.module.css";
import { ROUTES } from "../../const.js";

// ---- SVG アイコン ----
function HomeIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M3 10.5 12 3l9 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M3.5 12a8.5 8.5 0 1 0 2.5-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6 3v3.5h3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 8v4l2.5 1.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// フッターのナビゲーション項目
const NAV_ITEMS = [
    { to: ROUTES.HOME, label: "ホーム", Icon: HomeIcon, end: true },
    { to: ROUTES.HISTORY, label: "履歴", Icon: HistoryIcon, end: false },
];

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <nav className={styles.nav}>
                {NAV_ITEMS.map(({ to, label, Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            isActive
                                ? `${styles.link} ${styles.active}`
                                : styles.link
                        }
                    >
                        <span className={styles.icon}>
                            <Icon />
                        </span>
                        <span className={styles.label}>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </footer>
    );
}
