import * as React from "react";
import styles from "./Dashboards.module.scss";

interface DashboardItem { title: string; image?: string; desc?: string; }
interface Props { item: DashboardItem; active: boolean; onClick: () => void; }

const BLANK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

const DashboardCard: React.FC<Props> = ({ item, active, onClick }) => {
  const title = item.title || "Dashboard";
  const src = (item.image && item.image.trim()) ? item.image : BLANK;

  return (
    <button
      type="button"
      className={`${styles.card} ${active ? styles.active : ""}`}
      onClick={onClick}
      title={title}
      aria-pressed={active}
    >
      <div className={styles.cardThumbWrap}>
        <img className={styles.cardThumb} src={src} alt={title} />
      </div>

      <div className={styles.cardTitleRow}>
        <div className={styles.cardTitle}>{title}</div>
        <span className={styles.chev} aria-hidden>›</span>
      </div>

      {item.desc && <div className={styles.cardDesc}>{item.desc}</div>}
    </button>
  );
};

export default DashboardCard;






