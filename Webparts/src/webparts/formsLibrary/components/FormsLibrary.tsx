import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { Text, IconButton, Checkbox, MessageBar, MessageBarType, DefaultButton } from "@fluentui/react";

import styles from "./FormsLibrary.module.scss";

export interface IFormsLibraryProps {
  context: WebPartContext;
  libraryTitle: string;
  searchText?: string;
}

interface IFormItem {
  id: number;
  title: string;
  department: string;
  modified: string;
  modifiedBy: string;
  fileUrl: string;
  powerAppsUrl?: string;
}

interface IFormsLibraryState {
  grouped: { [dept: string]: IFormItem[] };
  expanded: { [dept: string]: boolean };
  selectAll: { [dept: string]: boolean };
  selectedItems: { [id: number]: boolean };
  isLoading: boolean;
  selectedItem?: IFormItem;
  viewMode: { [dept: string]: "list" | "grid" };

  // ✅ same as ViewPage
  initialError: string | null;
}

const ARROW_ICON_URL = require("../assets/ArrowDown.svg");
const FOLDER_ICON_URL = require("../assets/folderIcon.svg");
const PDF_ICON_URL = require("../assets/pdfIcon.svg");
const GRIDLINE_ICON_URL = require("../assets/gridLineIcon.svg");
const EXPORT_ICON_URL = require("../assets/exportToCSVIcon.svg");
const GROUP_ICON_URL = require("../assets/GroupIcon.svg");
const AIRPLAY_ICON_URL = require("../assets/airplayIcon.svg");

export default class FormsLibrary extends React.Component<IFormsLibraryProps, IFormsLibraryState> {
  constructor(props: IFormsLibraryProps) {
    super(props);
    this.state = {
      grouped: {},
      expanded: {},
      selectAll: {},
      selectedItems: {},
      isLoading: true,
      selectedItem: undefined,
      viewMode: {},
      initialError: null
    };
  }

  public componentDidMount(): void {
    this._loadItems();
  }

  private _setViewMode = (dept: string, mode: "list" | "grid"): void => {
    this.setState((p) => ({
      viewMode: { ...p.viewMode, [dept]: mode }
    }));
  };

  private _formatModifiedDate(value: string): string {
    const dt = new Date(value);
    return dt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  // ------------------ TAXONOMY RESOLVER (LIBRARY SAFE) ------------------
  private _resolveTaxonomyLabel(value: any, taxCatchAll?: any[]): string {
    if (taxCatchAll && taxCatchAll.length > 0) {
      const term = taxCatchAll.find((t) => typeof t.Term === "string" && t.Term.trim().length > 0);
      if (term) return term.Term;
    }
    if (value?.Label) return value.Label;

    if (typeof value === "string") {
      return value.replace(/^\d+;#/, "").split("|")[0].trim();
    }

    return "Other";
  }
  // --------------------------------------------------------------------

  private async _loadItems(): Promise<void> {
    // ✅ same behavior as ViewPage: show shimmer while loading + clear error
    this.setState({ isLoading: true, initialError: null });

    try {
      const webUrl = this.props.context.pageContext.web.absoluteUrl;
      const listTitle = this.props.libraryTitle;

      const endpoint =
        `${webUrl}/_api/web/lists/GetByTitle('${encodeURIComponent(listTitle)}')/items?` +
        `$select=Id,Title,` +
        `TIRDepartment,` +
        `TaxCatchAll/Term,TaxCatchAll/ID,` +
        `TIRPowerAppLink,Modified,Editor/Title,FileRef,FileLeafRef` +
        `&$expand=Editor,TaxCatchAll&$top=200`;

      const res: SPHttpClientResponse = await this.props.context.spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1
      );

      const data = await res.json();

      const grouped: { [dept: string]: IFormItem[] } = {};

      (data.value || []).forEach((i: any) => {
        const dept = this._resolveTaxonomyLabel(i.TIRDepartment, i.TaxCatchAll);

        if (!grouped[dept]) grouped[dept] = [];

        grouped[dept].push({
          id: i.Id,
          title: i.Title || i.FileLeafRef,
          department: dept,
          modified: this._formatModifiedDate(i.Modified),
          modifiedBy: i.Editor?.Title || "",
          fileUrl: i.FileRef,
          powerAppsUrl: i.TIRPowerAppLink?.Url || ""
        });
      });

      const expanded: any = {};
      const selectAll: any = {};
      const viewMode: any = {};

      Object.keys(grouped).forEach((d) => {
        expanded[d] = false;
        selectAll[d] = false;
        viewMode[d] = "list";
      });

      this.setState({
        grouped,
        expanded,
        selectAll,
        viewMode,
        selectedItems: {},
        isLoading: false,
        initialError: null
      });
    } catch (e: any) {
      console.error("Error loading forms", e);

      this.setState({
        grouped: {},
        expanded: {},
        selectAll: {},
        selectedItems: {},
        viewMode: {},
        isLoading: false,
        initialError: e?.message || "Failed to load forms."
      });
    }
  }

  private _toggleDept = (dept: string): void => {
    this.setState((p) => ({
      expanded: { ...p.expanded, [dept]: !p.expanded[dept] }
    }));
  };

  private _toggleSelectAll = (dept: string, checked?: boolean): void => {
    const items = this.state.grouped[dept] || [];
    const selectedItems = { ...this.state.selectedItems };
    const newVal = !!checked;

    items.forEach((i) => (selectedItems[i.id] = newVal));

    this.setState({
      selectedItems,
      selectAll: { ...this.state.selectAll, [dept]: newVal }
    });
  };

  private _toggleItemSelection = (itemId: number, dept: string, checked?: boolean): void => {
    const { grouped, selectedItems, selectAll } = this.state;
    const items = grouped[dept] || [];
    const newVal = checked !== undefined ? checked : !selectedItems[itemId];

    const newSelectedItems = {
      ...selectedItems,
      [itemId]: newVal
    };

    const allSelected = items.length > 0 && items.every((item) => newSelectedItems[item.id]);

    this.setState({
      selectedItems: newSelectedItems,
      selectAll: { ...selectAll, [dept]: allSelected }
    });
  };

  private _onRowClick = (item: IFormItem): void => {
    this.setState({ selectedItem: item });
  };

  private _exportDeptToCsv = (dept: string): void => {
    const { grouped, selectedItems } = this.state;
    const items = (grouped[dept] || []).filter((i) => selectedItems[i.id]);

    if (!items.length) {
      alert("Please select at least one item to export.");
      return;
    }

    const csv =
      "Title,Department,Modified By,Modified\n" +
      items
        .map(
          (i) =>
            `"${i.title.replace(/"/g, '""')}","${i.department}","${i.modifiedBy}","${i.modified}"`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${dept.replace(/\s+/g, "_")}_forms.csv`;
    a.click();
  };

  private _openPowerApps = (item: IFormItem, e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    if (!item.powerAppsUrl) {
      alert("PowerAppsFormURL is empty for this file.");
      return;
    }
    window.open(item.powerAppsUrl, "_blank", "noopener,noreferrer");
  };

  // ✅ SAME shimmer as ViewPage
  private _renderInitialShimmer(): React.ReactNode {
    return (
      <div className={styles.initialShimmerWrap} aria-label="Loading forms">
        <div className={styles.initialShimmerGrid}>
          {/* LEFT: list skeleton */}
          <div className={styles.shimmerPanel}>
            <div className={styles.shimmerPanelPad}>
              <div className={`${styles.shimmerBlock} ${styles.shimmerLine} ${styles.shimmerTitle}`} />
              <div className={`${styles.shimmerBlock} ${styles.shimmerLineSm} ${styles.shimmerSub} ${styles.shimmerGapSm}`} />

              <div className={`${styles.shimmerList} ${styles.shimmerGapMd}`}>
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className={styles.shimmerRow}>
                    <div className={`${styles.shimmerBlock} ${styles.shimmerIcon}`} />
                    <div>
                      <div className={`${styles.shimmerBlock} ${styles.shimmerLine} ${styles.shimmerTitle}`} />
                      <div className={`${styles.shimmerBlock} ${styles.shimmerLineSm} ${styles.shimmerSub} ${styles.shimmerGapSm}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: preview skeleton */}
          <div className={styles.shimmerPanel}>
            <div className={styles.shimmerPanelPad}>
              <div className={`${styles.shimmerBlock} ${styles.shimmerLine} ${styles.shimmerPreviewHeader}`} />
              <div className={`${styles.shimmerPreviewLines} ${styles.shimmerGapMd}`}>
                <div className={`${styles.shimmerBlock} ${styles.shimmerLine} ${styles.shimmerPreviewLineA}`} />
                <div className={`${styles.shimmerBlock} ${styles.shimmerLine} ${styles.shimmerPreviewLineB}`} />
                <div className={`${styles.shimmerBlock} ${styles.shimmerLine} ${styles.shimmerPreviewLineC}`} />
                <div className={`${styles.shimmerBlock} ${styles.shimmerLine} ${styles.shimmerPreviewLineD}`} />
              </div>

              <div className={`${styles.shimmerBlock} ${styles.shimmerPreviewFrame} ${styles.shimmerGapMd}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  public render(): React.ReactElement<IFormsLibraryProps> {
    const { grouped, isLoading, initialError } = this.state;
    const departments = Object.keys(grouped);

    // same logic as ViewPage
    const showInitialShimmer = isLoading || (!!initialError && departments.length === 0);

    return (
      <div className={styles.formsLibraryRoot}>
        {initialError ? (
          <div className={styles.initialErrorBar}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
              {initialError}
              <span className={styles.errorBarActions}>
                <DefaultButton text="Retry" onClick={() => this._loadItems()} />
              </span>
            </MessageBar>
          </div>
        ) : null}

        {showInitialShimmer ? (
          this._renderInitialShimmer()
        ) : (
          <>
            <div className={styles.leftPane}>
              {departments.map((dept) => this._renderDeptSection(dept))}
            </div>

            <div className={styles.rightPane}>{this._renderPreview()}</div>
          </>
        )}
      </div>
    );
  }

  private _renderDeptSection(dept: string): JSX.Element {
    const { grouped, expanded, selectAll, selectedItems, viewMode } = this.state;

    const isGrid = viewMode[dept] === "grid";
    const items = grouped[dept] || [];

    const q = (this.props.searchText || "").toLowerCase().trim();
    const filteredItems = q
      ? items.filter(
          (i) =>
            (i.title || "").toLowerCase().includes(q) ||
            (i.modifiedBy || "").toLowerCase().includes(q) ||
            (i.department || "").toLowerCase().includes(q)
        )
      : items;

    let isOpen = !!expanded[dept];
    if (q) isOpen = filteredItems.length > 0;

    return (
      <div key={dept} className={styles.deptSection}>
        <div className={styles.deptHeader} onClick={() => this._toggleDept(dept)}>
          <div className={styles.deptHeaderLeft}>
            <img
              src={ARROW_ICON_URL}
              className={isOpen ? styles.arrowIconOpen : styles.arrowIconCollapsed}
              alt="Toggle"
            />
            <img src={FOLDER_ICON_URL} className={styles.folderIcon} alt="Folder" />
            <Text variant="mediumPlus" className={styles.deptTitle}>
              {dept}
            </Text>
          </div>

          <div className={styles.deptHeaderRight}>
            <IconButton
              className={styles.listIcon}
              iconProps={{ iconName: "BulletedList" }}
              title="List view"
              ariaLabel="List view"
              onClick={(e) => {
                e.stopPropagation();
                this._setViewMode(dept, "list");
              }}
              style={{ opacity: isGrid ? 0.4 : 1 }}
            />

            <IconButton
              className={styles.gridIcon}
              title="Grid View"
              ariaLabel="Grid View"
              onClick={(e) => {
                e.stopPropagation();
                this._setViewMode(dept, "grid");
              }}
              style={{ opacity: isGrid ? 1 : 0.4 }}
            >
              <img src={GRIDLINE_ICON_URL} alt="Grid View" style={{ width: 16, height: 16 }} />
            </IconButton>
          </div>
        </div>

        {isOpen && (
          <div className={styles.deptBody}>
            <div className={styles.controlRow}>
              <div className={styles.selectAllContainer}>
                <Checkbox
                  checked={selectAll[dept] || false}
                  onChange={(_, checked) => this._toggleSelectAll(dept, !!checked)}
                />
                <Text className={styles.selectAllText}>Select all</Text>
              </div>

              <button className={styles.exportButtonCustom} onClick={() => this._exportDeptToCsv(dept)}>
                <img src={EXPORT_ICON_URL} alt="Export" className={styles.exportIcon} />
                <span>Export</span>
              </button>
            </div>

            <div className={isGrid ? styles.formsGrid : styles.formsList}>
              {filteredItems.map((item) =>
                isGrid ? (
                  <div key={item.id} className={styles.formCard} onClick={() => this._onRowClick(item)}>
                    <div className={styles.formCardTop}>
                      <img src={PDF_ICON_URL} className={styles.cardFileIcon} alt="PDF" />

                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems[item.id] || false}
                          onChange={(_, checked) => {
                            this._toggleItemSelection(item.id, dept, !!checked);
                            this._onRowClick(item);
                          }}
                        />
                      </div>
                    </div>

                    <div className={styles.cardTitleWrap}>
                      <Text className={styles.cardTitle} title={item.title}>
                        {item.title}
                      </Text>
                    </div>

                    <Text className={styles.cardMeta}>
                      {item.modifiedBy} · {item.modified}
                    </Text>

                    {item.powerAppsUrl && (
                      <div className={styles.digitalizedChip} onClick={(e) => this._openPowerApps(item, e)}>
                        <img src={AIRPLAY_ICON_URL} className={styles.airplayIcon} />
                        <span>Digitalized</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={item.id} className={styles.formRow} onClick={() => this._onRowClick(item)}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems[item.id] || false}
                        onChange={(_, checked) => {
                          this._toggleItemSelection(item.id, dept, !!checked);
                          this._onRowClick(item);
                        }}
                        className={styles.formCheckbox}
                      />
                    </div>

                    <img src={PDF_ICON_URL} className={styles.pdfIcon} alt="PDF" />

                    <div className={styles.formRowContent}>
                      <Text className={styles.formTitle}>{item.title}</Text>
                      <Text className={styles.formMeta}>
                        Modified by {item.modifiedBy} · Modified on {item.modified}{" "}
                      </Text>
                    </div>

                    <div className={styles.formRowRight}>
                      {item.powerAppsUrl && (
                        <div className={styles.digitalizedChip} onClick={(e) => this._openPowerApps(item, e)}>
                          <img src={AIRPLAY_ICON_URL} className={styles.airplayIcon} />
                          <span>Digitalized</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {!filteredItems.length && (
                <Text className={styles.emptyText}>
                  {items.length ? "No matching forms found." : "No forms available for this department."}
                </Text>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  private _renderPreview(): JSX.Element {
    const { selectedItem } = this.state;

    if (!selectedItem) {
      return (
        <div className={styles.previewPlaceholder}>
          <img src={GROUP_ICON_URL} className={styles.previewIcon} alt="Placeholder" />
          <Text className={styles.previewTitle}>Select an item in the list to view it here.</Text>
        </div>
      );
    }

    const serverRelativeUrl = selectedItem.fileUrl;
    const libraryUrl = serverRelativeUrl.substring(0, serverRelativeUrl.lastIndexOf("/"));
    const src =
      `${libraryUrl}/Forms/AllItems.aspx?id=${encodeURIComponent(serverRelativeUrl)}` +
      `&parent=${encodeURIComponent(libraryUrl)}`;

    return <iframe title={selectedItem.title} src={src} className={styles.previewFrame} />;
  }
}
