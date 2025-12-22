
import * as React from "react";
import styles from "./NavSegment.module.scss";

export type Option = "Image Gallery" | "Inside Scoop" | "Let's Meet";

export interface NavSegmentProps {
  value?: Option;
  defaultValue?: Option;
  onChange?: (val: Option) => void;

  className?: string;
  labels?: readonly Option[];
}

const DEFAULT_OPTIONS: readonly Option[] = ["Image Gallery", "Inside Scoop", "Let's Meet"] as const;

const NavSegment: React.FC<NavSegmentProps> = ({
  value,
  defaultValue = "Let's Meet",
  onChange,
  className,
  labels = DEFAULT_OPTIONS,
}) => {
  const [internal, setInternal] = React.useState<Option>(defaultValue);
  const selected = value ?? internal;

  const setSelected = (opt: Option) => {
    if (value === undefined) setInternal(opt);
    onChange?.(opt);
  };

 
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    e.preventDefault();
    const idx = labels.indexOf(selected);
    if (idx < 0) return;

    const nextIdx =
      e.key === "ArrowRight"
        ? (idx + 1) % labels.length
        : (idx - 1 + labels.length) % labels.length;

    setSelected(labels[nextIdx]);
  };

  return (
    <div
      className={[styles.segmentWrap, className ?? ""].join(" ")}
      role="tablist"
      aria-label="Top navigation tabs"
      onKeyDown={onKeyDown}
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
            onClick={() => setSelected(opt)}
          >
            <span className={styles.segmentText}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavSegment;
