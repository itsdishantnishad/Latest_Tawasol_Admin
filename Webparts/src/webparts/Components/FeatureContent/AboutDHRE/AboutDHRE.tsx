import * as React from "react";
import styles from "./AboutDHRE.module.scss";

// // Local SVGs in: src/webparts/Components/FeatureContent/assets
const aboutImg1: string = require("../assets/about-dhre-1.svg");
const aboutImg2: string = require("../assets/about-dhre-2.svg");
const aboutImg3: string = require("../assets/about-dhre-3.svg");
const aboutImg4: string = require("../assets/about-dhre-4.svg");

export interface AboutDHREProps {
  context: any;
  seeAllURL?: string;
}

const AboutDHRE: React.FC<AboutDHREProps> = (props) => {
  // Current web URL (no trailing slash)
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  // --- DYNAMIC KNOW-MORE URL WITH DEFAULT ---
  const knowMoreHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();

    // Default page in current site:
    const raw = configured || "SitePages/About-DHRE.aspx";

    // Absolute URL -> keep path but move to current tenant
    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    // Root-relative (/sites/YourSite/SitePages/Page.aspx)
    if (raw.startsWith("/")) return `${origin}${raw}`;

    // Web-relative (SitePages/Page.aspx)
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  // ✅ Force HARD navigation (prevents SharePoint soft-nav shimmer stuck after deployments)
  const handleKnowMoreClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      window.location.assign(knowMoreHref);
    },
    [knowMoreHref]
  );

  return (
    <div className={styles.aboutDhreSection}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <img src={aboutImg1} alt="" className={styles.icon} />
          <span className={styles.title}>Authentically Principled</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>

        <div className={styles.card}>
          <img src={aboutImg2} alt="" className={styles.icon} />
          <span className={styles.title}>Sustainanble Features</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>

        <div className={styles.card}>
          <img src={aboutImg3} alt="" className={styles.icon} />
          <span className={styles.title}>Pioneering Growth</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>

        <div className={styles.card}>
          <img src={aboutImg4} alt="" className={styles.icon} />
          <span className={styles.title}>Uncompromised Discipline</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>
      </div>

      {/* Know More Button */}
      <div className={styles.buttonContainer}>
        <a
          href={knowMoreHref}
          className={styles.viewAllButton}
          data-interception="off"
          onClick={handleKnowMoreClick}
        >
          Know More
        </a>
      </div>
    </div>
  );
};

export default AboutDHRE;
