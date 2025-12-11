import * as React from "react";
import styles from "./BeverageMenu.module.scss";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";

// SVG cards – full card artwork from Figma
const HotBeverageIcon: string = require("./assets/HotBeverage.svg");
const ColdBeverageIcon: string = require("./assets/ColdBeverage.svg");
const TeaMenuIcon: string = require("./assets/TeaMenu.svg");

interface BeverageCard {
  id: number;
  header: string;
  image: string;
  url: string;
}

const defaultBeverages: BeverageCard[] = [
  {
    id: 1,
    header: "Hot Beverages",
    image: HotBeverageIcon,
    url: "#",
  },
  {
    id: 2,
    header: "Cold Beverages",
    image: ColdBeverageIcon,
    url: "#",
  },
  {
    id: 3,
    header: "Tea Menu",
    image: TeaMenuIcon,
    url: "#",
  },
];

const BeverageMenu: React.FC = () => {
  const handleViewAll = () => {
    // TODO: navigate to full beverage menu page
    // window.location.href = "<your-url>";
  };

  return (
    <div className={styles.beverageMenu}>
      <div className={styles.cardsRow}>
        {defaultBeverages.map((bev, index) => {
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
        <PrimaryButton label="View All" onClick={handleViewAll} />
      </div>
    </div>
  );
};

export default BeverageMenu;
