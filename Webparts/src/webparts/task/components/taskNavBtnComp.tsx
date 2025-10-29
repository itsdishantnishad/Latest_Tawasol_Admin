import * as React from "react";
import styles from "./taskNavBtn.module.scss";
import { TAB_ACTIVE_SVG } from "../../assets/constants";

export type SystemFilterOption = "All" | "Oracle" | "Salesforce";

export interface NavSegmentProps {
  value?: SystemFilterOption;
  defaultValue?: SystemFilterOption;
  onChange?: (newValue: SystemFilterOption) => void;
  absolute?: boolean;
  className?: string;
  labels?: readonly SystemFilterOption[];
}

const DEFAULT_OPTIONS: readonly SystemFilterOption[] = ["All", "Oracle", "Salesforce"] as const;

const NavSegment: React.FC<NavSegmentProps> = ({
  value,
  defaultValue = "All",
  onChange,
  absolute = false,
  className,
  labels = DEFAULT_OPTIONS,
}) => {
  const [internalSelectedValue, setInternalSelectedValue] = React.useState<SystemFilterOption>(defaultValue);
  const selectedValue: SystemFilterOption = value ?? internalSelectedValue;

  const handleSegmentClick = (newOption: SystemFilterOption) => {
    if (value === undefined) setInternalSelectedValue(newOption);
    onChange?.(newOption);
  };

  return (
    <div
      className={[styles.segmentWrap, absolute ? styles.segmentWrapAbsolute : "", className ?? ""].join(" ")}
      role="tablist"
      aria-label="Filter by system"
    >
      {labels.map((optionLabel) => {
        const isActive = selectedValue === optionLabel;
        return (
          <button
            key={optionLabel}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[styles.segmentBtn, isActive ? styles.segmentBtnActive : styles.segmentBtnIdle].join(" ")}
            onClick={() => handleSegmentClick(optionLabel)}
          >
            {isActive && (
              <span className={styles.activeBg} dangerouslySetInnerHTML={{ __html: TAB_ACTIVE_SVG }} />
            )}
            <span className={styles.segmentText}>{optionLabel}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavSegment;
