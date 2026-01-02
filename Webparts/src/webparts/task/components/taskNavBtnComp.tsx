import * as React from "react";
import styles from "./taskNavBtn.module.scss";

export type SystemFilterOption = "Tahweel" | "Salesforce" | "ServiceNow";

export interface TabDefinition {
  key: SystemFilterOption;
  label: string;
  count: number;
  iconSvg: string;
}

export interface NavSegmentProps {
  value: SystemFilterOption;
  onChange: (newValue: SystemFilterOption) => void;
  className?: string;
  tabs: readonly TabDefinition[];
}

const formatCount = (n: number): string => {
  const num = typeof n === "number" && !isNaN(n) ? n : 0;
  return num < 10 ? "0" + num : String(num);
};

const NavSegment: React.FC<NavSegmentProps> = ({ value, onChange, className, tabs }) => {
  return (
    <div
      className={[styles.segmentWrap, className ?? ""].join(" ")}
      role="tablist"
      aria-label="Task system filter"
    >
      {tabs.map((tab) => {
        const isActive = value === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              styles.segmentBtn,
              isActive ? styles.segmentBtnActive : styles.segmentBtnIdle,
            ].join(" ")}
            onClick={() => onChange(tab.key)}
          >
            <span className={styles.tabInner}>
              <span className={styles.iconWrap}>
                <span
                  className={styles.iconSvg}
                  dangerouslySetInnerHTML={{ __html: tab.iconSvg }}
                />
              </span>

              <span className={styles.segmentText}>{tab.label}</span>
              <span className={styles.countText}>{formatCount(tab.count)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default NavSegment;
