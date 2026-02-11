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

// ✅ Dubai logo (make sure file exists in: src/webparts/profilePageHeader/assets/)
const DubaiIcon_URL: string = require("../assets/Dubaiicon.svg");

// ✅ Background vectors
const VectorA_URL: string = require("../assets/VectorA.png");
const VectorB_URL: string = require("../assets/VectorB.png");

const getInitials = (name: string): string => {
  const cleaned = (name || "").trim().replace(/,/g, " ").replace(/\s+/g, " ");
  if (!cleaned) return "—";
  const parts = cleaned.split(" ").filter(Boolean);
  const first = (parts[0] || "").charAt(0);
  const last = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).charAt(0);
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
      {/* ✅ SWAPPED: vectorA position will show VectorB image */}
      <img className={styles.vectorA} src={VectorB_URL} alt="" aria-hidden="true" />

      {/* ✅ SWAPPED: vectorB position will show VectorA image */}
      <img className={styles.vectorB} src={VectorA_URL} alt="" aria-hidden="true" />

      <div className={styles.topLogoStrip}>
        <img className={styles.dubaiicon} src={DubaiIcon_URL} alt="Dubai Holding Real Estate" />
      </div>

      <div className={styles.avatarWrap} aria-label="User photo">
        {photoUrl ? (
          <img className={styles.avatarImg} src={photoUrl} alt={displayName} />
        ) : (
          <div className={styles.avatarFallback} aria-label="User initials">
            {initials}
          </div>
        )}
      </div>

      <div className={styles.name}>{displayName || "—"}</div>
      <div className={styles.subtitle}>{subtitle}</div>

      {/* <div className={styles.qrOuter}>
        <div className={styles.qrInner}>
          {qrCodeUrl ? (
            <img className={styles.qrImg} src={qrCodeUrl} alt="QR Code" />
          ) : (
            <div className={styles.qrFallback}>QR not available</div>
          )}
        </div>
      </div> */}

      <div className={styles.empId}>
        <span className={styles.empLabel}>Emp. ID :</span>{" "}
        <span className={styles.empValue}>{(employeeId || "—").trim() || "—"}</span>
      </div>
    </div>
  );
};

export default ProfileCard;
