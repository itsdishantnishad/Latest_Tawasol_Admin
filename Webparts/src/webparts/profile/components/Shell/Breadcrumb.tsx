import * as React from "react";
import styles from "./Breadcrumb.module.scss";

export type BreadcrumbOption = "Apply Leave" | "HR Letters" | "Holiday List";

export interface IBreadcrumbProps {
  onBack?: () => void;
  leftIconSrc?: string;
  rightIconSrc?: string;
  leftText?: string;
  trailStart?: string;
  selectedOption?: BreadcrumbOption;
}

const Breadcrumb: React.FC<IBreadcrumbProps> = ({
  onBack,
  leftIconSrc,
  rightIconSrc,
  leftText = "Back",
  trailStart = "Home",
  selectedOption = "Apply Leave",
}) => {
  
  const getTrailEnd = (): string => {
    switch (selectedOption) {
      case "Apply Leave":
        return "Leave Details";
      case "HR Letters":
        return "HR Letter";
      case "Holiday List":
        return "Holiday List Details";
      default:
        return "Leave Details";
    }
  };

  return (
    <div className={styles.breadcrumb}>
      <button type="button" className={styles.backBtn} onClick={onBack}>
        {leftIconSrc ? <img src={leftIconSrc} alt="" width={20} height={20} /> : null}
        <span>{leftText}</span>
      </button>

      <div className={styles.divider} />

      <span className={styles.taskText}>{trailStart}</span>

      {rightIconSrc ? <img src={rightIconSrc} alt="" width={20} height={20} /> : null}

      <span className={styles.detailsText}>{getTrailEnd()}</span>
    </div>
  );
};

export default Breadcrumb;