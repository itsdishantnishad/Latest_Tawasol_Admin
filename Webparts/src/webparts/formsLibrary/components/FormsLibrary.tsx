import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import {
  Text,
  IconButton,
  Checkbox
} from '@fluentui/react';

import styles from './FormsLibrary.module.scss';

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
}

const ARROW_ICON_URL = require("../assets/ArrowDown.svg");
const FOLDER_ICON_URL = require("../assets/folderIcon.svg");
const PDF_ICON_URL = require("../assets/pdfIcon.svg");
const GRIDLINE_ICON_URL = require("../assets/gridLineIcon.svg");
const EXPORT_ICON_URL = require("../assets/exportToCSVIcon.svg");
const GROUP_ICON_URL = require("../assets/GroupIcon.svg");
const AIRPLAY_ICON_URL = require("../assets/airplayIcon.svg");

export default class FormsLibrary
  extends React.Component<IFormsLibraryProps, IFormsLibraryState> {

  constructor(props: IFormsLibraryProps) {
    super(props);
    this.state = {
      grouped: {},
      expanded: {},
      selectAll: {},
      selectedItems: {},
      isLoading: true,
      selectedItem: undefined
    };
  }

  public componentDidMount(): void {
    this._loadItems();
  }

  // ------------------ TAXONOMY RESOLVER (LIBRARY SAFE) ------------------
  private _resolveTaxonomyLabel(
    value: any,
    taxCatchAll?: any[]
  ): string {
    
    if (taxCatchAll && taxCatchAll.length > 0) {
      const term = taxCatchAll.find(
        t => typeof t.Term === "string" && t.Term.trim().length > 0
      );
      if (term) {
        return term.Term;
      }
    }
    if (value?.Label) {
      return value.Label;
    }
    if (typeof value === "string") {
      return value
        .replace(/^\d+;#/, "")
        .split("|")[0]
        .trim();
    }

    return "Other";
  }
 // --------------------------------------------------------------------

  private async _loadItems(): Promise<void> {
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

      const res: SPHttpClientResponse =
        await this.props.context.spHttpClient.get(
          endpoint,
          SPHttpClient.configurations.v1
        );

      const data = await res.json();

      const grouped: { [dept: string]: IFormItem[] } = {};

      (data.value || []).forEach((i: any) => {
        const dept = this._resolveTaxonomyLabel(
          i.TIRDepartment,
          i.TaxCatchAll
        );

        if (!grouped[dept]) grouped[dept] = [];

        grouped[dept].push({
          id: i.Id,
          title: i.Title || i.FileLeafRef,
          department: dept,
          modified: new Date(i.Modified).toLocaleDateString(),
          modifiedBy: i.Editor?.Title || '',
          fileUrl: i.FileRef,
          powerAppsUrl: i.TIRPowerAppLink?.Url || ''
        });
      });

      const expanded: any = {};
      const selectAll: any = {};
      Object.keys(grouped).forEach(d => {
        expanded[d] = false;
        selectAll[d] = false;
      });

      this.setState({
        grouped,
        expanded,
        selectAll,
        selectedItems: {},
        isLoading: false
      });

    } catch (e) {
      console.error('Error loading forms', e);
      this.setState({ isLoading: false });
    }
  }

  private _toggleDept = (dept: string): void => {
    this.setState(p => ({
      expanded: { ...p.expanded, [dept]: !p.expanded[dept] }
    }));
  };

  private _toggleSelectAll = (dept: string, checked?: boolean): void => {
    const items = this.state.grouped[dept] || [];
    const selectedItems = { ...this.state.selectedItems };
    const newVal = !!checked;

    items.forEach(i => selectedItems[i.id] = newVal);

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

    const allSelected =
      items.length > 0 && items.every(item => newSelectedItems[item.id]);

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
    const items = (grouped[dept] || []).filter(i => selectedItems[i.id]);

    if (!items.length) {
      alert('Please select at least one item to export.');
      return;
    }

    const csv =
      'Title,Department,Modified By,Modified\n' +
      items.map(i =>
        `"${i.title.replace(/"/g, '""')}","${i.department}","${i.modifiedBy}","${i.modified}"`
      ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${dept.replace(/\s+/g, '_')}_forms.csv`;
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

  public render(): React.ReactElement<IFormsLibraryProps> {
    const { grouped, isLoading } = this.state;
    const departments = Object.keys(grouped);

    return (
      <div className={styles.formsLibraryRoot}>
        <div className={styles.leftPane}>
          {isLoading && <Text>Loading forms…</Text>}
          {!isLoading && departments.map(dept => this._renderDeptSection(dept))}
        </div>
        <div className={styles.rightPane}>
          {this._renderPreview()}
        </div>
      </div>
    );
  }

  private _renderDeptSection(dept: string): JSX.Element {
    const { grouped, expanded, selectAll, selectedItems } = this.state;
    const items = grouped[dept] || [];

    const q = (this.props.searchText || "").toLowerCase().trim();
    const filteredItems = q
      ? items.filter(i =>
          (i.title || "").toLowerCase().includes(q) ||
          (i.modifiedBy || "").toLowerCase().includes(q) ||
          (i.department || "").toLowerCase().includes(q)
        )
      : items;

    let isOpen = !!expanded[dept];
    if (q) {
      isOpen = filteredItems.length > 0;
    }

    return (
      <div key={dept} className={styles.deptSection}>
        <div
          className={styles.deptHeader}
          onClick={() => this._toggleDept(dept)}
        >
          <div className={styles.deptHeaderLeft}>
            <img
              src={ARROW_ICON_URL}
              className={isOpen ? styles.arrowIconOpen : styles.arrowIconCollapsed}
              alt="Toggle"
            />
            <img src={FOLDER_ICON_URL} className={styles.folderIcon} alt="Folder" />
            <Text variant="mediumPlus" className={styles.deptTitle}>{dept}</Text>
          </div>
          <div className={styles.deptHeaderRight}>
            <IconButton
              className={styles.listIcon}
              iconProps={{ iconName: 'BulletedList' }}
              title="List view"
              ariaLabel="List view"
            />
            <IconButton className={styles.gridIcon} title="Grid View" ariaLabel="Grid View">
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

              <button
                className={styles.exportButtonCustom}
                onClick={() => this._exportDeptToCsv(dept)}
              >
                <img src={EXPORT_ICON_URL} alt="Export" className={styles.exportIcon} />
                <span>Export</span>
              </button>
            </div>

            <div className={styles.formsList}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={styles.formRow}
                  onClick={() => this._onRowClick(item)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems[item.id] || false}
                      onChange={(_, checked) =>
                        this._toggleItemSelection(item.id, dept, !!checked)
                      }
                      className={styles.formCheckbox}
                    />
                  </div>

                  <img src={PDF_ICON_URL} className={styles.pdfIcon} alt="PDF" />

                  <div className={styles.formRowContent}>
                    <Text className={styles.formTitle}>{item.title}</Text>
                    <Text className={styles.formMeta}>
                      Modified by {item.modifiedBy} · Modified on {item.modified}
                    </Text>
                  </div>

                  <div className={styles.formRowRight}>
                    
                      {item.powerAppsUrl && (
                    <div
                      className={styles.digitalizedChip}
                      onClick={(e) => this._openPowerApps(item, e)}
                    >
                      <img src={AIRPLAY_ICON_URL} className={styles.airplayIcon} />
                      <span>Digitalized</span>
                    </div>
                  )}
                    
                  </div>
                </div>
              ))}

              {!filteredItems.length && (
                <Text className={styles.emptyText}>
                  {items.length
                    ? "No matching forms found."
                    : "No forms available for this department."}
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
          <Text className={styles.previewTitle}>
            Select an item in the list to view it here.
          </Text>
        </div>
      );
    }

    const serverRelativeUrl = selectedItem.fileUrl;
    const libraryUrl = serverRelativeUrl.substring(0, serverRelativeUrl.lastIndexOf('/'));
    const src =
      `${libraryUrl}/Forms/AllItems.aspx?id=${encodeURIComponent(serverRelativeUrl)}` +
      `&parent=${encodeURIComponent(libraryUrl)}`;

    return (
      <iframe
        title={selectedItem.title}
        src={src}
        className={styles.previewFrame}
      />
    );
  }
}
