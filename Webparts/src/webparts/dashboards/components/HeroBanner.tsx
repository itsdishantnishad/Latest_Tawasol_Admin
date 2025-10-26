import * as React from "react";
import styles from "./HeroBanner.module.scss";

interface Props { titleRed: string; titleBlack: string; subtitle?: string; }

const HeroBanner: React.FC<Props> = ({ titleRed, titleBlack, subtitle }) => (
  <section className={styles.banner} aria-label="Dashboards hero">
    <div className={styles.inner}>
      <h1 className={styles.title}>
        <span className={styles.red}>{titleRed}</span>
        <span className={styles.sep}> – </span>
        <span className={styles.black}>{titleBlack}</span>
      </h1>
      {subtitle && <p className={styles.sub}>{subtitle}</p>}
    </div>
  </section>
);

export default HeroBanner;
