import * as React from "react";
import styles from "./NavTabs.module.scss";

export interface NavTabsOption<K extends string = string> {
  key: K;
  label: string;
}

export interface NavTabsProps<K extends string = string> {
  tabs: NavTabsOption<K>[];
  value: K;
  onChange: (key: K) => void;
  className?: string; // optional wrapper class
  tabClassName?: string; // optional per-tab extra class
}

/**
 * Generic, accessible tab-like nav built with buttons.
 * - Uses CSS modules (NavTab.module.scss)
 * - Keeps semantics simple: buttons with aria-pressed
 */
function NavTabs<K extends string = string>({
  tabs,
  value,
  onChange,
  className = "",
  tabClassName = "",
}: NavTabsProps<K>) {
  return (
    <div className={`${styles.navTabs} ${className}`.trim()}>
      {tabs.map((tab) => {
        const isActive = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${isActive ? styles.active : ""} ${tabClassName}`.trim()}
            aria-pressed={isActive}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default NavTabs;
