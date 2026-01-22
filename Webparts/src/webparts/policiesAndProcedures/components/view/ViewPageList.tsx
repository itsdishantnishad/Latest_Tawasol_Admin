import * as React from "react";
import { Checkbox, IconButton } from "@fluentui/react";
import styles from "./ViewPage.module.scss";

import ViewPageListServices from "../../../services/PoliciesAndProcedures/ViewPageListServices";
import type { FavouriteIndex, IPoliciesAndProceduresItem } from "../../../services/PoliciesAndProcedures/ViewPageListTypes";
export type { IPoliciesAndProceduresItem } from "../../../services/PoliciesAndProcedures/ViewPageListTypes";

import PoliciesSearchService from "../../../services/PoliciesAndProcedures/PoliciesSearchService";

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

  // NOTE: parent is async - keep it compatible
  onToggleFolder: (folderItem: IPoliciesAndProceduresItem) => Promise<void> | void;

  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;
  onSwitchFolderView: (folderId: string, mode: "list" | "grid") => void;
  getFolderViewMode: (folderId: string) => "list" | "grid";
  favouriteIndex?: FavouriteIndex;
  onToggleFavourite?: (file: IPoliciesAndProceduresItem) => void;
  dmsLibraryRoot?: string;

  searchText?: string;
  autoExpandFolderIds?: string[];
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

  private get query(): string {
    return (this.props.searchText || "").trim();
  }

  // normalized forced expand keys (works for encoded/decoded)
  private get forcedExpandKeys(): Set<string> {
    return new Set((this.props.autoExpandFolderIds || []).map(PoliciesSearchService.toKey));
  }

  private isForced(folderId: string): boolean {
    return this.forcedExpandKeys.has(PoliciesSearchService.toKey(folderId));
  }

  public componentDidUpdate(prevProps: IPoliciesAndProceduresListProps): void {
    const q = this.query;
    const prevQ = (prevProps.searchText || "").trim();

    const autoChanged =
      (prevProps.autoExpandFolderIds || []).join("|") !== (this.props.autoExpandFolderIds || []).join("|");

    if (q && (q !== prevQ || autoChanged)) {
      void this.ensureAutoExpanded();
    }
  }

  private async ensureAutoExpanded(): Promise<void> {
    const ids = this.props.autoExpandFolderIds || [];
    if (!ids.length) return;

    // Mark expanded in UI state
    this.setState(prev => {
      const next = new Set(prev.expandedFolderIds);
      ids.forEach(id => next.add(id));
      return { ...prev, expandedFolderIds: next };
    });

    // Ensure children loaded
    for (const id of ids) {
      const stub: IPoliciesAndProceduresItem = { id, name: "", isFolder: true, serverRelativeUrl: id };
      await this.props.onToggleFolder(stub);
    }
  }

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

  // ---------- search helpers ----------
  private itemMatches = (it: IPoliciesAndProceduresItem, q: string): boolean => {
    if (!q) return true;
    return (
      PoliciesSearchService.matches(it.name || "", q) ||
      PoliciesSearchService.matches(it.tag || "", q) ||
      PoliciesSearchService.matches(it.department || "", q)
    );
  };

  private folderHasMatch = (folderId: string, q: string, visited = new Set<string>()): boolean => {
    if (!q) return true;
    const key = PoliciesSearchService.toKey(folderId);
    if (visited.has(key)) return false;
    visited.add(key);

    // Find the real expandedChildren key even if encoding differs
    const kidsKey =
      Object.keys(this.props.expandedChildren).find(k => PoliciesSearchService.toKey(k) === key) || folderId;

    const kids = this.props.expandedChildren[kidsKey] || [];
    for (const c of kids) {
      if (this.itemMatches(c, q)) return true;
      if (c.isFolder && this.folderHasMatch(c.id, q, visited)) return true;
    }
    return false;
  };

  private shouldShowFolder = (folder: IPoliciesAndProceduresItem, q: string): boolean => {
    if (!q) return true;
    if (this.isForced(folder.id)) return true;
    if (this.itemMatches(folder, q)) return true;
    return this.folderHasMatch(folder.id, q);
  };

  // ---------- list row ----------
  private renderFileRow = (item: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string) => {
    const checked = this.isSelected(item.id, folderId);
    const meta = this._utils.getRowMeta(item, this.props.favouriteIndex);

    const showActions = !item.isFolder && !!item.serverRelativeUrl;

    return (
      <div key={item.id} className={`${styles.row} ${isActive ? styles.rowActive : ""}`}>
        <div className={styles.cellCheck}>
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

        <div className={styles.cellType}>
          <button
            type="button"
            className={styles.openBtn}
            aria-label={item.name}
            onClick={(e) => e.stopPropagation()}
          >
            <img className={styles.typeIcon} src={meta.fileIcon} alt="" />
          </button>
        </div>

        <div className={styles.cellName}>
          <button
            type="button"
            className={`${styles.nameStrong} ${styles.openBtn}`}
            onClick={(e) => e.stopPropagation()}
          >
            {item.name}
          </button>

          <div className={styles.meta}>
            Modified by : {item.modifiedBy || "-"} &nbsp;•&nbsp;
            Modified on : {item.modifiedOn ? item.modifiedOn.toLocaleDateString() : "-"}
          </div>
        </div>

        <div className={styles.cellCategory}>
          <span className={styles.categoryInline} title={meta.categoryLabel}>
            <img src={ICON_TAG} alt="" className={styles.categoryIcon} />
            <span className={styles.categoryText}>{meta.categoryLabel}</span>
          </span>
        </div>

        <div className={styles.cellRight}>
          {!!item.department && <span className={styles.cellDept}>{item.department}</span>}

          {showActions && (
            <div className={styles.cellActions}>
              <button
                type="button"
                className={styles.favBtn}
                title={meta.isFavourite ? "Remove from favourites" : "Add to favourites"}
                onClick={(e) => {
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

              {!!meta.downloadUrl && (
                <a
                  className={styles.downloadBtn}
                  href={meta.downloadUrl}
                  title="Download"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={ICON_DOWNLOAD} alt="" className={styles.downloadIcon} />
                </a>
              )}
            </div>
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
    const q = this.query;

    const folderKey = PoliciesSearchService.toKey(folderId);
    const realKey =
      Object.keys(this.props.expandedChildren).find(k => PoliciesSearchService.toKey(k) === folderKey) || folderId;

    const children = this.props.expandedChildren[realKey] || [];

    const folders = children
      .filter(c => c.isFolder)
      .filter(f => this.shouldShowFolder(f, q));

    const files = children
      .filter(c => !c.isFolder)
      .filter(f => this.itemMatches(f, q));

    return (
      <div>
        {folders.map(f => this.renderFolderBlock(f, true))}

        {this.props.getFolderViewMode(folderId) === "list" && (
          <div>{files.map(f => this.renderFileRow(f, this.props.activeId === f.id, folderId))}</div>
        )}

        {this.props.getFolderViewMode(folderId) === "grid" && (
          <div className={styles.gridBody}>
            {files.map(f => this.renderGridCard(f, this.props.activeId === f.id, folderId)) }
          </div>
        )}
      </div>
    );
  };

  private renderFolderBlock = (folder: IPoliciesAndProceduresItem, nested?: boolean): React.ReactNode => {
    const q = this.query;
    if (!this.shouldShowFolder(folder, q)) return null;

    const mustExpand = !!q && this.isForced(folder.id);
    const isExpanded = mustExpand || this.isFolderExpanded(folder.id);

    const viewMode = this.props.getFolderViewMode(folder.id);

    const folderKey = PoliciesSearchService.toKey(folder.id);
    const realKey =
      Object.keys(this.props.expandedChildren).find(k => PoliciesSearchService.toKey(k) === folderKey) || folder.id;

    const children = this.props.expandedChildren[realKey] || [];

    const files = children
      .filter(c => !c.isFolder)
      .filter(f => this.itemMatches(f, q));

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
                  <span>Export</span>
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
    const root = (this.props.dmsLibraryRoot || "").trim();
    if (root !== (this._lastRoot || "")) {
      this._lastRoot = root;
      this._utils.setLibraryRoot(root);
    }

    const q = this.query;

    const rootFolders = this.props.items.filter(i => i.isFolder).filter(f => this.shouldShowFolder(f, q));
    const rootFiles = this.props.items.filter(i => !i.isFolder).filter(f => this.itemMatches(f, q));

    return (
      <div>
        {rootFolders.map(f => this.renderFolderBlock(f))}
        {rootFiles.map(f => this.renderFileRow(f, this.props.activeId === f.id))}
      </div>
    );
  }
}
