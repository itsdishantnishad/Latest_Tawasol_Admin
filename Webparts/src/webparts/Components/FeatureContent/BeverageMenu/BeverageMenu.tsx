import * as React from "react";
import styles from "./BeverageMenu.module.scss";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";
import ShuffledCards from "../../../widgets/ShuffledCards/ShuffledCards";
import ConditionalLink from "../../ConditionalLink/ConditionalLink";

const HotBeverageIcon: string = require("../assets/Hot-Beverages.png");
const ColdBeverageIcon: string = require("../assets/Cold-Beverages.png");
const TeaMenuIcon: string = require("../assets/Tea-Menu.png");

interface BeverageCard {
  id: number;
  header: string;
  backgroundImage: string;
  url: string;
}

export interface IBeverageMenuProps {
  context: any;
  seeAllURL?: string;
}

const defaultBeverages: BeverageCard[] = [
  { id: 1, header: "Hot Beverages", backgroundImage: HotBeverageIcon, url: "#" },
  { id: 2, header: "Cold Beverages", backgroundImage: ColdBeverageIcon, url: "#" },
  { id: 3, header: "Tea Menu", backgroundImage: TeaMenuIcon, url: "#" },
];

const BeverageMenu: React.FC<IBeverageMenuProps> = (props) => {

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
    <div>
      <ShuffledCards cards={defaultBeverages} />

      <div className={styles.ctaWrapper}>
        <ConditionalLink to={viewAllHref}>
          <PrimaryButton label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default BeverageMenu;
