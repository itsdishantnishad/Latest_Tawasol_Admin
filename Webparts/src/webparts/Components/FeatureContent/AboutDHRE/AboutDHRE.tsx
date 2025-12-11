import * as React from 'react';
import styles from './AboutDHRE.module.scss';

// If you want strict typing, replace `any` with WebPartContext
// import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface AboutDHREProps {
  // context: WebPartContext;
  context: any;
  seeAllURL?: string;
}

const AboutDHRE: React.FC<AboutDHREProps> = (props) => {
  // Current web URL (no trailing slash)
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, '');
  const origin: string = new URL(webUrl).origin;

  // --- DYNAMIC KNOW-MORE URL WITH DEFAULT ---
  const knowMoreHref = React.useMemo(() => {
    const configured = (props.seeAllURL || '').trim();

    // If nothing configured, default to a page in the current site:
    //   /sites/ThisSite/SitePages/About-DHRE.aspx
    const raw = configured || 'SitePages/About-DHRE.aspx';

    // Absolute URL from anywhere -> keep path but move to current tenant
    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    // Root-relative (/sites/YourSite/SitePages/Page.aspx)
    if (raw.startsWith('/')) {
      return `${origin}${raw}`;
    }

    // Web-relative (SitePages/Page.aspx)
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  return (
    <div className={styles.aboutDhreSection}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <img
            src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png"
            alt=""
            className={styles.icon}
          />
          <span className={styles.title}>Authentically Principled</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>

        <div className={styles.card}>
          <img
            src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png"
            alt=""
            className={styles.icon}
          />
          <span className={styles.title}>Authentically Principled</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>

        <div className={styles.card}>
          <img
            src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png"
            alt=""
            className={styles.icon}
          />
          <span className={styles.title}>Authentically Principled</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>

        <div className={styles.card}>
          <img
            src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png"
            alt=""
            className={styles.icon}
          />
          <span className={styles.title}>Authentically Principled</span>
          <div className={styles.description}>
            <p>We create and manage training initiatives that enhance employee</p>
          </div>
        </div>
      </div>

      {/* Know More Button */}
      <div className={styles.buttonContainer}>
        <a href={knowMoreHref} className={styles.viewAllButton}>
          Know More
        </a>
      </div>
    </div>
  );
};

export default AboutDHRE;
