// src/webparts/Components/FeatureContent/BeverageMenu/BeverageMenu.tsx

import * as React from "react";
import styles from "./BeverageMenu.module.scss";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";

const HotBeverageIcon: string = require("./assets/HotBeverage.svg");
const ColdBeverageIcon: string = require("./assets/ColdBeverage.svg");
const TeaMenuIcon: string = require("./assets/TeaMenu.svg");

interface BeverageCard {
  id: number;
  header: string;
  image: string;
  url: string;
}

export interface IBeverageMenuProps {
  context: any;
  seeAllURL?: string;
}

const defaultBeverages: BeverageCard[] = [
  { id: 1, header: "Hot Beverages", image: HotBeverageIcon, url: "#" },
  { id: 2, header: "Cold Beverages", image: ColdBeverageIcon, url: "#" },
  { id: 3, header: "Tea Menu", image: TeaMenuIcon, url: "#" },
];

const BeverageMenu: React.FC<IBeverageMenuProps> = (props) => {
  const beverages = defaultBeverages;

  // --- DYNAMIC VIEW-ALL URL (same pattern as Dashboard) ---
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(
    /\/$/,
    ""
  );
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();
    const raw = configured || "SitePages/Beverage-Menu.aspx";

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    if (raw.startsWith("/")) {
      return `${origin}${raw}`;
    }

    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  return (
    <div className={styles.beverageMenu}>
      <div className={styles.cardsRow}>
        {beverages.map((bev, index) => {
          const tiltClass =
            index === 0
              ? styles.leftTilt
              : index === 1
              ? styles.centerCard
              : styles.rightTilt;

          return (
            <a
              key={bev.id}
              href={bev.url}
              className={`${styles.card} ${tiltClass}`}
            >
              <img
                src={bev.image}
                alt={bev.header}
                className={styles.cardImage}
              />
              <div className={styles.cardTitle}>{bev.header}</div>
            </a>
          );
        })}
      </div>

      <div className={styles.ctaWrapper}>
        <a href={viewAllHref} className={styles.viewAllLink}>
          <PrimaryButton label="View All" onClick={() => {}} />
        </a>
      </div>
    </div>
  );
};

export default BeverageMenu;
