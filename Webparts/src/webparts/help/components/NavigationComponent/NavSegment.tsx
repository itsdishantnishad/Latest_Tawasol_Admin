import * as React from "react";
import styles from "./NavSegment.module.scss";

export type Option = "Important Numbers" | "FAQs";

export interface NavSegmentProps {
  value?: Option;                          
  defaultValue?: Option;                    
  onChange?: (val: Option) => void;         
  absolute?: boolean;                       
  className?: string;
  labels?: readonly Option[];             
}

const DEFAULT_OPTIONS: readonly Option[] = [
  "Important Numbers",
  "FAQs",
] as const;

const NavSegment: React.FC<NavSegmentProps> = ({
  value,
  defaultValue = "Important Numbers",
  onChange,
  absolute = false,
  className,
  labels = DEFAULT_OPTIONS,
}) => {
  const [internal, setInternal] = React.useState<Option>(defaultValue);
  const selected = value ?? internal;

  const handleClick = (opt: Option) => {
    if (value === undefined) setInternal(opt);  // uncontrolled usage
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
      aria-label="Leave tabs"
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