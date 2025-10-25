import * as React from "react";
import { Pivot, PivotItem, Dropdown, SearchBox, IDropdownOption } from "@fluentui/react";
import styles from "./NewsView.module.scss";
import type { TabKey, ViewMode } from "./NewsView";

const gridViewIconSrc = require("../assets/GridViewToggle.svg");
const listViewIconSrc = require("../assets/ListViewToggle.svg");

export interface IFiltersBarProps {
  tab: TabKey;
  dept: string;
  q: string;
  view: ViewMode;
  deptOpts: { key: string; text: string }[];
  onTab: (tab: TabKey) => void;
  onDept: (deptKey: string) => void;
  onSearch: (query: string) => void;
  onView: (mode: ViewMode) => void;
}

export default class FiltersBar extends React.Component<IFiltersBarProps> {
  private handleTabChange = (clickedItem?: PivotItem) => {
    const nextTab = (clickedItem?.props?.itemKey as TabKey) || "All";
    this.props.onTab(nextTab);
  };

  private handleDepartmentChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) this.props.onDept(String(option.key));
  };

  private handleSearchChange = (_event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
    this.props.onSearch(newValue || "");
  };

  public render(): React.ReactElement<IFiltersBarProps> {
    const {
      tab: activeTab,
      dept: selectedDepartment,
      q: searchQuery,
      view: currentViewMode,
      deptOpts: departmentOptions,
      onView: setViewMode,
    } = this.props;

    return (
      <div className={styles.controls}>
        <div className={styles.zoneTabs}>
          <Pivot selectedKey={activeTab} onLinkClick={this.handleTabChange}>
            <PivotItem headerText="All News" itemKey="All" />
            <PivotItem headerText="Announcements" itemKey="Announcements" />
          </Pivot>
        </div>

        <div className={styles.zoneFilters}>
          <Dropdown
            options={departmentOptions}
            selectedKey={selectedDepartment}
            onChange={this.handleDepartmentChange}
            ariaLabel="Filter by department"
          />
          <SearchBox
            placeholder="Search News"
            value={searchQuery}
            onChange={this.handleSearchChange}
            ariaLabel="Search news"
          />
        </div>

        <div className={styles.zoneToggle}>
          <div className={styles.viewToggle} role="group" aria-label="Toggle view">
            <button
              className={`${styles.toggleBtn} ${currentViewMode === "grid" ? styles.active : ""}`}
              onClick={() => setViewMode("grid")}
              aria-pressed={currentViewMode === "grid"}
              type="button"
            >
              <img src={gridViewIconSrc} alt="Grid view" />
            </button>
            <button
              className={`${styles.toggleBtn} ${currentViewMode === "list" ? styles.active : ""}`}
              onClick={() => setViewMode("list")}
              aria-pressed={currentViewMode === "list"}
              type="button"
            >
              <img src={listViewIconSrc} alt="List view" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
