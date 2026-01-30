import * as React from "react";
import styles from "./ProfileCard.module.scss";

export interface IProfileCardProps {
  displayName: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
  employeeId?: string;
  qrCodeUrl?: string; // can be dataURL OR normal URL
}

// [PROFILECARD] ✅ Dubai logo (make sure the file name matches exactly in assets)
const Dubaiicon_URL: string = require("../assets/Dubaiicon.png");

// [PROFILECARD] ✅ Background vectors (make sure these exist in assets folder)
const VectorA_URL: string = require("../assets/VectorA.png");
const VectorB_URL: string = require("../assets/VectorB.png");

const getInitials = (name: string): string => {
  const cleaned = (name || "").trim().replace(/,/g, " ").replace(/\s+/g, " ");
  if (!cleaned) return "—";
  const parts = cleaned.split(" ").filter(Boolean);
  const first = (parts[0] || "").charAt(0);
  const last = (parts.length > 1 ? parts[parts.length - 1] : parts[parts.length - 1]).charAt(0);
  return (first + last).toUpperCase();
};

const buildSubtitle = (jobTitle?: string, department?: string): string => {
  const jt = (jobTitle || "").trim();
  const dep = (department || "").trim();
  if (jt && dep) return `${jt} • ${dep}`;
  return jt || dep || "—";
};

const ProfileCard: React.FC<IProfileCardProps> = (props) => {
  const { displayName, jobTitle, department, photoUrl, employeeId, qrCodeUrl } = props;

  const subtitle = buildSubtitle(jobTitle, department);
  const initials = getInitials(displayName);

  return (
    <div className={styles.card} role="dialog" aria-label="Profile Card">
      {/* [PROFILECARD] Background vectors */}
      <img className={styles.vectorA} src={VectorA_URL} alt="" aria-hidden="true" />
      <img className={styles.vectorB} src={VectorB_URL} alt="" aria-hidden="true" />

      {/* [PROFILECARD] Top Dubai logo strip */}
      <div className={styles.topLogoStrip}>
        <img className={styles.dubaiicon} src={Dubaiicon_URL} alt="Dubai Holding Real Estate" />
      </div>

      {/* [PROFILECARD] Avatar */}
      <div className={styles.avatarWrap} aria-label="User photo">
        {photoUrl ? (
          <img className={styles.avatarImg} src={photoUrl} alt={displayName} />
        ) : (
          <div className={styles.avatarFallback} aria-label="User initials">
            {initials}
          </div>
        )}
      </div>

      {/* [PROFILECARD] Name */}
      <div className={styles.name}>{displayName || "—"}</div>

      {/* [PROFILECARD] Subtitle */}
      <div className={styles.subtitle}>{subtitle}</div>

      {/* [PROFILECARD] QR Box */}
      <div className={styles.qrOuter}>
        <div className={styles.qrInner}>
          {qrCodeUrl ? (
            <img className={styles.qrImg} src={qrCodeUrl} alt="QR Code" />
          ) : (
            <div className={styles.qrFallback}>QR not available</div>
          )}
        </div>
      </div>

      {/* [PROFILECARD] Employee ID */}
      <div className={styles.empId}>
        <span className={styles.empLabel}>Emp. ID :</span>{" "}
        <span className={styles.empValue}>{(employeeId || "—").trim() || "—"}</span>
      </div>
    </div>
  );
};

export default ProfileCard;
