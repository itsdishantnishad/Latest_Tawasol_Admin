import * as React from "react";
import styles from "./SideNavPills.module.scss";

export interface ISideNavPillsProps {
  items: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default class SideNavPills extends React.Component<ISideNavPillsProps> {
  public render(): React.ReactElement {
    const { items, activeIndex, onSelect } = this.props;

    return (
      <nav className={styles.sideNav} aria-label="Dashboard categories">
        {items.map((label, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.pill} ${i === activeIndex ? styles.active : ""}`}
            onClick={() => onSelect(i)}
            aria-current={i === activeIndex ? "true" : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
    );
  }
}
