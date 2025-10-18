import * as React from "react";
import styles from "./taskNavBtn.module.scss";

export type Option = "Services" | "Oracle" | "Salesforce";

export interface NavSegmentProps {
  value?: Option;                         
  defaultValue?: Option;                 
  onChange?: (val: Option) => void;
  absolute?: boolean;
  className?: string;
  labels?: readonly Option[];
}

const DEFAULT_OPTIONS: readonly Option[] = ["Services", "Oracle", "Salesforce"] as const;

const NavSegment: React.FC<NavSegmentProps> = ({
  value,
  defaultValue = "Salesforce",            
  onChange,
  absolute = true,
  className,
  labels = DEFAULT_OPTIONS,              
}) => {
  const [internal, setInternal] = React.useState<Option>(defaultValue);
  const selected = value ?? internal;

  const handleClick = (opt: Option) => {
    if (value === undefined) setInternal(opt); 
    onChange?.(opt);                           
  };

  return (
    <div
      className={[
        styles.segmentWrap,
        absolute ? styles.segmentWrapAbsolute : "",
        className ?? "",
      ].join(" ")}
      role="tablist"
      aria-label="Filter by system"
    >
      {labels.map((opt) => {
        const isActive = selected === opt;
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              styles.segmentBtn,
              isActive ? styles.segmentBtnActive : styles.segmentBtnIdle,
            ].join(" ")}
            onClick={() => handleClick(opt)}
          >
            <span className={styles.segmentText}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavSegment;
