import * as React from "react";
import styles from "./ProfileCard.module.scss";

export interface IProfileCardProps {
  displayName: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
  employeeId?: string;
  qrCodeUrl?: string; // dataURL
  qrVcard?: string;   // vCard payload (download fallback)
}

const DubaiIcon_URL: string = require("../assets/Dubaiicon.svg");
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
  const { displayName, jobTitle, department, photoUrl, employeeId, qrCodeUrl, qrVcard } = props;

  const subtitle = buildSubtitle(jobTitle, department);
  const initials = getInitials(displayName);

  const handleDownloadContact = React.useCallback(() => {
    if (!qrVcard) return;

    const safeName = (displayName || "contact")
      .trim()
      .replace(/[^a-z0-9 _-]/gi, "")
      .replace(/\s+/g, " ");

    const fileName = safeName ? `${safeName}.vcf` : "contact.vcf";

    const blob = new Blob([qrVcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [qrVcard, displayName]);

  return (

    <div className={styles.cardContainer}>
       <div className={styles.card} role="dialog" aria-label="Profile Card">
      <img className={styles.vectorA} src={VectorB_URL} alt="" aria-hidden="true" />
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

      {/* ✅ QR (click to download vcf if scanning fails) */}
      <div
        className={styles.qrOuter}
        title={qrVcard ? "Scan to save contact (or click to download .vcf)" : "Scan to save contact"}
        role={qrVcard ? "button" : undefined}
        tabIndex={qrVcard ? 0 : -1}
        onClick={() => {
          if (qrVcard) handleDownloadContact();
        }}
        onKeyDown={(e) => {
          if (!qrVcard) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleDownloadContact();
          }
        }}
      >
        <div className={styles.qrInner}>
          {qrCodeUrl ? (
            <img className={styles.qrImg} src={qrCodeUrl} alt="Scan to add contact" />
          ) : (
            <div className={styles.qrFallback}>QR not available</div>
          )}
        </div>
      </div>

      <div className={styles.empId}>
        <span className={styles.empLabel}>Emp. ID :</span>{" "}
        <span className={styles.empValue}>{(employeeId || "—").trim() || "—"}</span>
      </div>
    </div>
   </div>

  );
};

export default ProfileCard;
