import * as React from "react";
import styles from "./Offers.module.scss";

import ShuffledCards from "../../../widgets/ShuffledCards/ShuffledCards";
import ConditionalLink from "../../ConditionalLink/ConditionalLink";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";

const EmployeePrivilegesIcon = require("../assets/Employee-Privileges.png");
const MedicalInsuranceIcon = require("../assets/Medical-Insurance.png");
const EmployeeOffersIcon = require("../assets/Employee-Offers.png");

export interface IOffer {
  id: string;
  header: string;
  subHeader: string;
  url: string;
  backgroundImage: string;
}

export interface IOffersProps {
  offers?: IOffer[];
  onViewAll?: (seeAllURL: string) => void;
  seeAllURL?: string;
  context: any; // ✅ required for dynamic tenant+site URL build
}

const defaultOffers: IOffer[] = [
  {
    id: "1",
    header: "Medical Insurance",
    subHeader: "Comprehensive medical care made easy.",
    url: "#",
    backgroundImage: MedicalInsuranceIcon,
  },
  {
    id: "2",
    header: "Employee Privileges",
    subHeader: "Exclusive perks and workplace benefits.",
    url: "#",
    backgroundImage: EmployeePrivilegesIcon,
  },
  {
    id: "3",
    header: "Employee Offers",
    subHeader: "Special deals and discounts for employees.",
    url: "#",
    backgroundImage: EmployeeOffersIcon,
  },
];

export const Offers: React.FC<IOffersProps> = (props) => {
  const offers = props.offers || defaultOffers;

  // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();

    // ✅ Default page in current site (change if your default differs)
    const raw = configured || "SitePages/Offers-&-Benefits.aspx";

    // Absolute URL -> keep path but move to current tenant
    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    // Root-relative
    if (raw.startsWith("/")) return `${origin}${raw}`;

    // Web-relative
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  return (
    <div>
      <ShuffledCards cards={offers} />

      <div className={styles.ctaWrapper}>
        <ConditionalLink to={viewAllHref}>
          <PrimaryButton label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Offers;
