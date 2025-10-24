import * as React from "react";
import { Pivot, PivotItem, Dropdown, SearchBox } from "@fluentui/react";
import styles from "./NewsView.module.scss";
import type { TabKey, ViewMode } from "./NewsView";

const gridViewToggleSvg = require("../assets/GridViewToggle.svg");
const listViewToggleSvg = require("../assets/ListViewToggle.svg");

export interface IFiltersBarProps {
  tab: TabKey;
  dept: string;
  q: string;
  view: ViewMode;
  deptOpts: { key: string; text: string }[];
  onTab: (t: TabKey) => void;
  onDept: (k: string) => void;
  onSearch: (q: string) => void;
  onView: (v: ViewMode) => void;
}

export default class FiltersBar extends React.Component<IFiltersBarProps> {
  private handleTabChange = (item?: PivotItem) =>
    this.props.onTab(((item?.props?.itemKey as TabKey) || "All") as TabKey);

  private handleDepartmentChange = (_e: any, option?: any) =>
    option && this.props.onDept(String(option.key));

  private handleSearchChange = (_e: any, value?: string) =>
    this.props.onSearch(value || "");

  public render(): React.ReactElement<IFiltersBarProps> {
    const {
      tab,
      dept: selectedDepartment,
      q: searchQuery,
      view: currentView,
      deptOpts: departmentOptions,
      onView: setViewMode,
    } = this.props;

    return (
      <div className={styles.controls}>
        <div className={styles.zoneTabs}>
          <Pivot selectedKey={tab} onLinkClick={this.handleTabChange}>
            <PivotItem headerText="All News" itemKey="All" />
            <PivotItem headerText="Announcements" itemKey="Announcements" />
          </Pivot>
        </div>

        <div className={styles.zoneFilters}>
          <Dropdown
            options={departmentOptions}
            selectedKey={selectedDepartment}
            onChange={this.handleDepartmentChange}
          />
          <SearchBox
            placeholder="Search News"
            value={searchQuery}
            onChange={this.handleSearchChange}
          />
        </div>

        <div className={styles.zoneToggle}>
          <div className={styles.viewToggle} role="group" aria-label="Toggle view">
            <button
              className={`${styles.toggleBtn} ${currentView === "grid" ? styles.active : ""}`}
              onClick={() => setViewMode("grid")}
              aria-pressed={currentView === "grid"}
              type="button"
            >
              <img src={gridViewToggleSvg} alt="" />
            </button>
            <button
              className={`${styles.toggleBtn} ${currentView === "list" ? styles.active : ""}`}
              onClick={() => setViewMode("list")}
              aria-pressed={currentView === "list"}
              type="button"
            >
              <img src={listViewToggleSvg} alt="" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
