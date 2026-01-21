import * as React from "react";
import { Checkbox, IconButton } from "@fluentui/react";
import styles from "./ViewPage.module.scss";

import ViewPageListServices from "../../../services/PoliciesAndProcedures/ViewPageListServices";
import type { FavouriteIndex, IPoliciesAndProceduresItem } from "../../../services/PoliciesAndProcedures/ViewPageListTypes";
export type { IPoliciesAndProceduresItem } from "../../../services/PoliciesAndProcedures/ViewPageListTypes";

import {
  ICON_DOC_FOLDER_GRID,
  ICON_DOC_FOLDER_LIST,
  ICON_EXPORT_TO_CSV,
  ICON_FOLDER,
  ICON_ARROW_UP,
  ICON_ARROW_DOWN,
  ICON_TAG,
  ICON_HEART,
  ICON_HEART_SAVED,
  ICON_DOWNLOAD
} from "../../../assets/constants";

export interface IPoliciesAndProceduresListProps {
  items: IPoliciesAndProceduresItem[];
  activeId?: string;
  onOpenFile: (fileItem: IPoliciesAndProceduresItem) => void;
  onClearPreview?: () => void;
  onToggleFolder: (folderItem: IPoliciesAndProceduresItem) => void;
  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;
  onSwitchFolderView: (folderId: string, mode: "list" | "grid") => void;
  getFolderViewMode: (folderId: string) => "list" | "grid";
  favouriteIndex?: FavouriteIndex;
  onToggleFavourite?: (file: IPoliciesAndProceduresItem) => void;
  dmsLibraryRoot?: string;
}

type State = {
  selectedIds: Record<string, Set<string>>;
  expandedFolderIds: Set<string>;
};

export default class PoliciesAndProceduresList extends React.Component<
  IPoliciesAndProceduresListProps,
  State
> {
  public state: State = {
    selectedIds: {},
    expandedFolderIds: new Set()
  };

  private readonly _utils = new ViewPageListServices();
  private _lastRoot?: string;

  // ---------- selection helpers ----------
  private getScopeKey = (folderId?: string) => folderId || "root";

  private isSelected = (itemId: string, folderId?: string) =>
    this.state.selectedIds[this.getScopeKey(folderId)]?.has(itemId) ?? false;

  private setSelectedBulk = (itemIds: string[], checked: boolean, folderId?: string) => {
    const scopeKey = this.getScopeKey(folderId);
    this.setState(prev => {
      const next = new Set(prev.selectedIds[scopeKey] ?? []);
      if (checked) itemIds.forEach(id => next.add(id));
      else itemIds.forEach(id => next.delete(id));
      return { ...prev, selectedIds: { ...prev.selectedIds, [scopeKey]: next } };
    });
  };

  private toggleOne = (itemId: string, folderId?: string) => {
    const scopeKey = this.getScopeKey(folderId);
    this.setState(prev => {
      const next = new Set(prev.selectedIds[scopeKey] ?? []);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return { ...prev, selectedIds: { ...prev.selectedIds, [scopeKey]: next } };
    });
  };

  // ---------- folder expand helpers ----------
  private isFolderExpanded = (folderId: string) => this.state.expandedFolderIds.has(folderId);

  private expandFolder = async (folder: IPoliciesAndProceduresItem): Promise<void> => {
    if (!this.props.expandedChildren[folder.id] && folder.serverRelativeUrl) {
      await this.props.onToggleFolder(folder);
    }
    this.setState(prev => {
      const next = new Set(prev.expandedFolderIds);
      next.add(folder.id);
      return { ...prev, expandedFolderIds: next };
    });
  };

  private collapseFolder = (folderId: string): void => {
    this.setState(prev => {
      const next = new Set(prev.expandedFolderIds);
      next.delete(folderId);
      return { ...prev, expandedFolderIds: next };
    });
  };

  private toggleFolderUi = async (
    folder: IPoliciesAndProceduresItem,
    e?: React.MouseEvent<HTMLElement>
  ): Promise<void> => {
    e?.stopPropagation();
    if (this.isFolderExpanded(folder.id)) return this.collapseFolder(folder.id);
    await this.expandFolder(folder);
  };

  private openFolderInViewMode = async (
    folder: IPoliciesAndProceduresItem,
    mode: "list" | "grid",
    e?: React.MouseEvent<any>
  ): Promise<void> => {
    e?.stopPropagation();
    this.props.onSwitchFolderView(folder.id, mode);

    if (!this.isFolderExpanded(folder.id)) {
      await this.expandFolder(folder);
      return;
    }

    if (!this.props.expandedChildren[folder.id] && folder.serverRelativeUrl) {
      await this.props.onToggleFolder(folder);
    }
  };

  // ---------- list row ----------
  private renderFileRow = (item: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string) => {
    const checked = this.isSelected(item.id, folderId);
    const meta = this._utils.getRowMeta(item, this.props.favouriteIndex);

    return (
      <div key={item.id} className={`${styles.row} ${isActive ? styles.rowActive : ""}`}>
        <div>
          <Checkbox
            checked={checked}
            onChange={(ev, isChecked) => {
              ev?.stopPropagation();
              this.toggleOne(item.id, folderId);
              if (isChecked) this.props.onOpenFile(item);
              else if (this.props.activeId === item.id) this.props.onClearPreview?.();
            }}
          />
        </div>
        <div>
          <button type="button" className={styles.openBtn} aria-label={item.name} onClick={e => e.stopPropagation()}>
            <img className={styles.typeIcon} src={meta.fileIcon} alt="" />
          </button>
        </div>
        <div className={styles.cellName}>
          <button
            type="button"
            className={`${styles.nameStrong} ${styles.openBtn}`}
            onClick={e => e.stopPropagation()}
          >
            {item.name}
          </button>

          <div className={styles.meta}>
            Modified by : {item.modifiedBy || "-"} &nbsp;•&nbsp;
            Modified on : {item.modifiedOn ? item.modifiedOn.toLocaleDateString() : "-"}
          </div>
        </div>

        {/* Category (same green icon as Boards.tsx) */}
        <div>
          <span className={styles.tagPill}>
            <img src={ICON_TAG} alt="" className={styles.tagIcon} />
            {meta.categoryLabel}
          </span>
        </div>

        <div className={styles.cellDept}>{item.department || ""}</div>

        {/* Actions: Favourite + Download */}
        <div>
          {!item.isFolder && !!item.serverRelativeUrl && (
            <button
              type="button"
              className={styles.favBtn}
              title={meta.isFavourite ? "Remove from favourites" : "Add to favourites"}
              onClick={e => {
                e.stopPropagation();
                this.props.onToggleFavourite?.(item);
              }}
            >
              <img
                src={meta.isFavourite ? ICON_HEART_SAVED : ICON_HEART}
                alt=""
                className={styles.favIcon}
              />
            </button>
          )}

          {!item.isFolder && !!meta.downloadUrl && (
            <a
              className={styles.favBtn}
              href={meta.downloadUrl}
              title="Download"
              onClick={e => e.stopPropagation()}
            >
              <img src={ICON_DOWNLOAD} alt="" className={styles.favIcon} />
            </a>
          )}
        </div>
      </div>
    );
  };

  // ---------- grid card ----------
  private renderGridCard = (item: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string) => {
    const checked = this.isSelected(item.id, folderId);
    const meta = this._utils.getRowMeta(item, this.props.favouriteIndex);

    return (
      <div key={item.id} className={`${styles.card} ${isActive ? styles.cardActive : ""}`}>
        <div className={styles.cardThumb}>
          <button type="button" className={styles.openBtn} aria-label={item.name} onClick={e => e.stopPropagation()}>
            <img className={styles.typeIcon} src={meta.fileIcon} alt="" />
          </button>
        </div>

        {/* keep existing wrapper (no new SCSS class like cardCategoryRow) */}
        <div className={styles.cardFavWrap}>
          {!item.isFolder && !!item.serverRelativeUrl && (
            <button
              type="button"
              className={styles.favBtn}
              title={meta.isFavourite ? "Remove from favourites" : "Add to favourites"}
              onClick={e => {
                e.stopPropagation();
                this.props.onToggleFavourite?.(item);
              }}
            >
              <img
                src={meta.isFavourite ? ICON_HEART_SAVED : ICON_HEART}
                alt=""
                className={styles.favIcon}
              />
            </button>
          )}

          {!item.isFolder && !!meta.downloadUrl && (
            <a className={styles.favBtn} href={meta.downloadUrl} title="Download" onClick={e => e.stopPropagation()}>
              <img src={ICON_DOWNLOAD} alt="" className={styles.favIcon} />
            </a>
          )}
        </div>

        <div className={styles.cardTitle}>
          <button type="button" className={styles.openBtn} onClick={e => e.stopPropagation()}>
            {item.name}
          </button>
        </div>

        <div className={styles.cardMetaRow}>
          <span className={styles.meta}>{item.modifiedBy || "-"}</span>
          <span className={styles.meta}>{item.modifiedOn ? item.modifiedOn.toLocaleDateString() : "-"}</span>
        </div>

        {/* Category shown using existing tag pill style */}
        <div>
          <span className={styles.tagPill}>
            <img src={ICON_TAG} alt="" className={styles.tagIcon} />
            {meta.categoryLabel}
          </span>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.cardDept}>{item.department || ""}</span>
        </div>

        <div className={styles.cardCheckboxWrap}>
          <Checkbox
            checked={checked}
            onChange={(ev, isChecked) => {
              ev?.stopPropagation();
              this.toggleOne(item.id, folderId);
              if (isChecked) this.props.onOpenFile(item);
              else if (this.props.activeId === item.id) this.props.onClearPreview?.();
            }}
          />
        </div>
      </div>
    );
  };

  private renderFolderChildrenRecursive = (folderId: string): React.ReactNode => {
    const children = this.props.expandedChildren[folderId] || [];
    const folders = children.filter(c => c.isFolder);
    const files = children.filter(c => !c.isFolder);

    return (
      <div>
        {folders.map(f => this.renderFolderBlock(f, true))}

        {this.props.getFolderViewMode(folderId) === "list" && (
          <div>{files.map(f => this.renderFileRow(f, this.props.activeId === f.id, folderId))}</div>
        )}

        {this.props.getFolderViewMode(folderId) === "grid" && (
          <div className={styles.gridBody}>
            {files.map(f => this.renderGridCard(f, this.props.activeId === f.id, folderId))}
          </div>
        )}
      </div>
    );
  };

  private renderFolderBlock = (folder: IPoliciesAndProceduresItem, nested?: boolean): React.ReactNode => {
    const isExpanded = this.isFolderExpanded(folder.id);
    const viewMode = this.props.getFolderViewMode(folder.id);
    const children = this.props.expandedChildren[folder.id] || [];
    const files = children.filter(c => !c.isFolder);
    const allIds = files.map(f => f.id);
    const selectedFiles = files.filter(f => this.isSelected(f.id, folder.id));
    const isAllSelected = allIds.length > 0 && allIds.every(id => this.isSelected(id, folder.id));

    return (
      <div key={folder.id} className={`${styles.folderBlock} ${nested ? styles.folderNested : ""}`}>
        <div
          className={styles.folderHeader}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onClick={e => void this.toggleFolderUi(folder, e)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              void this.toggleFolderUi(folder);
            }
          }}
        >
          <img src={isExpanded ? ICON_ARROW_UP : ICON_ARROW_DOWN} alt="" className={styles.typeIcon} />

          <span className={styles.folderIconWrap}>
            <img className={styles.typeIcon} src={ICON_FOLDER} alt="" />
          </span>

          <span className={styles.folderTitle}>{folder.name}</span>

          <div className={styles.folderToolbar}>
            <IconButton
              className={viewMode === "list" ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_LIST} alt="" className={styles.typeIcon} />}
              title="List view"
              ariaLabel="List view"
              onClick={e => void this.openFolderInViewMode(folder, "list", e)}
            />
            <IconButton
              className={viewMode === "grid" ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_GRID} alt="" className={styles.typeIcon} />}
              title="Grid view"
              ariaLabel="Grid view"
              onClick={e => void this.openFolderInViewMode(folder, "grid", e)}
            />
          </div>
        </div>

        {isExpanded && (
          <div className={styles.folderContent}>
            <div className={styles.actionBar}>
              <div className={styles.selectAllWrap} onClick={e => e.stopPropagation()}>
                <Checkbox
                  label="Select all"
                  checked={isAllSelected}
                  onChange={(e, checked) => {
                    e?.stopPropagation();
                    this.setSelectedBulk(allIds, !!checked, folder.id);
                  }}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div
                  className={styles.actionBarRight}
                  role="button"
                  tabIndex={0}
                  onClick={e => {
                    e.stopPropagation();
                    this._utils.exportSelectedToCsv(selectedFiles, "documents.csv");
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      this._utils.exportSelectedToCsv(selectedFiles, "documents.csv");
                    }
                  }}
                >
                  <img src={ICON_EXPORT_TO_CSV} alt="" className={styles.typeIcon} />
                  <span>Export to CSV</span>
                </div>
              )}
            </div>

            {this.renderFolderChildrenRecursive(folder.id)}
          </div>
        )}
      </div>
    );
  };

  public render(): React.ReactElement<IPoliciesAndProceduresListProps> {
    // Sync library root without lifecycle methods (keeps file smaller)
    const root = (this.props.dmsLibraryRoot || "").trim();
    if (root !== (this._lastRoot || "")) {
      this._lastRoot = root;
      this._utils.setLibraryRoot(root);
    }

    const rootFolders = this.props.items.filter(i => i.isFolder);
    const rootFiles = this.props.items.filter(i => !i.isFolder);

    return (
      <div>
        {rootFolders.map(f => this.renderFolderBlock(f))}
        {rootFiles.map(f => this.renderFileRow(f, this.props.activeId === f.id))}
      </div>
    );
  }
}
