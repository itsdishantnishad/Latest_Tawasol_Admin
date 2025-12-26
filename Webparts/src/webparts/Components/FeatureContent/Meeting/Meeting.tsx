import * as React from 'react';
import styles from './Meeting.module.scss';
import ConditionalLink from "../../ConditionalLink/ConditionalLink";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";

export interface IMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isFeatured?: boolean;
}

export interface IMeetingProps {
  meetings?: IMeeting[]; // still kept so parent props won't break
  onViewAll?: () => void;
  seeAllURL?: string;

  context: any; // (ideally WebPartContext)
}

// SVGs are in: src/webparts/Components/FeatureContent/assets
const meetingImg30: string = require('../assets/30.svg');
const meetingImg31: string = require('../assets/31.svg');
const meetingImg32: string = require('../assets/32.svg');
const meetingImg33: string = require('../assets/33.svg');

export const Meeting: React.FC<IMeetingProps> = (props) => {
  const images: string[] = [meetingImg30, meetingImg31, meetingImg32, meetingImg33];

  // ===== VIEW ALL FUNCTIONALITY (same as tumhara purana logic) =====
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();

    const raw = configured || "SitePages/Events-And-Trainings.aspx";


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

    // Web-relative (SitePages/Page.aspx)
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // ================================================================

  return (
    <div className={styles.meetingContainer}>
      {/* Just show 4 SVG images */}
      <div className={styles.imageGrid}>
        {images.map((src, index) => (
          <div key={index}>
            <img
              src={src}
              alt={`Meeting illustration ${index + 1}`}
              className={styles.meetingImage}
            />
          </div>
        ))}
      </div>

      {/* View All Button (uses dynamic viewAllHref) */}
      <div className={styles.buttonContainer}>
        <ConditionalLink to={viewAllHref}>
          <PrimaryButton label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Meeting;
