import * as React from "react";
import { Checkbox, IconButton } from "@fluentui/react";
import styles from "./ViewPage.module.scss";

import ViewPageListServices from "../../../services/PoliciesAndProcedures/ViewPageListServices";
import type {
  FavouriteIndex,
  IPoliciesAndProceduresItem
} from "../../../services/PoliciesAndProcedures/ViewPageListTypes";
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

type SearchState = "idle" | "loading" | "done" | "error";

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
  searchState?: SearchState;
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

  private get searchTextTrimmed(): string {
    return (this.props.searchText || "").trim();
  }

  // Date Formating
  private _formatModifiedDate(value: any): string {
    const dt = value instanceof Date ? value : new Date(value);
    if (isNaN(dt.getTime())) return "-";

    return dt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  // normalized forced expand keys (works for encoded/decoded)
  private get forcedExpandKeys(): Set<string> {
    return new Set((this.props.autoExpandFolderIds || []).map(PoliciesSearchService.toKey));
  }

  private isForced(folderId: string): boolean {
    return this.forcedExpandKeys.has(PoliciesSearchService.toKey(folderId));
  }

  public componentDidUpdate(prevProps: IPoliciesAndProceduresListProps): void {
    const currentSearchText = this.searchTextTrimmed;
    const previousSearchText = (prevProps.searchText || "").trim();

    const didAutoExpandChange =
      (prevProps.autoExpandFolderIds || []).join("|") !==
      (this.props.autoExpandFolderIds || []).join("|");

    if (currentSearchText && (currentSearchText !== previousSearchText || didAutoExpandChange)) {
      void this.ensureAutoExpanded();
    }
  }

  private async ensureAutoExpanded(): Promise<void> {
    const folderIdsToExpand = this.props.autoExpandFolderIds || [];
    if (!folderIdsToExpand.length) return;

    // Mark expanded in UI state
    this.setState((previous) => {
      const nextExpandedFolderIds = new Set(previous.expandedFolderIds);
      folderIdsToExpand.forEach((folderId) => nextExpandedFolderIds.add(folderId));
      return { ...previous, expandedFolderIds: nextExpandedFolderIds };
    });

    // Ensure children loaded
    for (const folderId of folderIdsToExpand) {
      const stubFolder: IPoliciesAndProceduresItem = {
        id: folderId,
        name: "",
        isFolder: true,
        serverRelativeUrl: folderId
      };
      await this.props.onToggleFolder(stubFolder);
    }
  }

  // ---------- selection helpers ----------
  private getSelectionScopeKey = (folderId?: string) => folderId || "root";

  private isSelected = (itemId: string, folderId?: string) =>
    this.state.selectedIds[this.getSelectionScopeKey(folderId)]?.has(itemId) ?? false;

  private setSelectedBulk = (itemIds: string[], checked: boolean, folderId?: string) => {
    const scopeKey = this.getSelectionScopeKey(folderId);
    this.setState((previous) => {
      const nextSelectedSet = new Set(previous.selectedIds[scopeKey] ?? []);
      if (checked) itemIds.forEach((id) => nextSelectedSet.add(id));
      else itemIds.forEach((id) => nextSelectedSet.delete(id));
      return { ...previous, selectedIds: { ...previous.selectedIds, [scopeKey]: nextSelectedSet } };
    });
  };

  private toggleOne = (itemId: string, folderId?: string) => {
    const scopeKey = this.getSelectionScopeKey(folderId);
    this.setState((previous) => {
      const nextSelectedSet = new Set(previous.selectedIds[scopeKey] ?? []);
      nextSelectedSet.has(itemId) ? nextSelectedSet.delete(itemId) : nextSelectedSet.add(itemId);
      return { ...previous, selectedIds: { ...previous.selectedIds, [scopeKey]: nextSelectedSet } };
    });
  };

  // ---------- folder expand helpers ----------
  private isFolderExpanded = (folderId: string) => this.state.expandedFolderIds.has(folderId);

  private expandFolder = async (folder: IPoliciesAndProceduresItem): Promise<void> => {
    if (!this.props.expandedChildren[folder.id] && folder.serverRelativeUrl) {
      await this.props.onToggleFolder(folder);
    }
    this.setState((previous) => {
      const nextExpandedFolderIds = new Set(previous.expandedFolderIds);
      nextExpandedFolderIds.add(folder.id);
      return { ...previous, expandedFolderIds: nextExpandedFolderIds };
    });
  };

  private collapseFolder = (folderId: string): void => {
    this.setState((previous) => {
      const nextExpandedFolderIds = new Set(previous.expandedFolderIds);
      nextExpandedFolderIds.delete(folderId);
      return { ...previous, expandedFolderIds: nextExpandedFolderIds };
    });
  };

  private toggleFolderUi = async (
    folder: IPoliciesAndProceduresItem,
    event?: React.MouseEvent<HTMLElement>
  ): Promise<void> => {
    event?.stopPropagation();
    if (this.isFolderExpanded(folder.id)) return this.collapseFolder(folder.id);
    await this.expandFolder(folder);
  };

  private openFolderInViewMode = async (
    folder: IPoliciesAndProceduresItem,
    mode: "list" | "grid",
    event?: React.MouseEvent<any>
  ): Promise<void> => {
    event?.stopPropagation();
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
  private itemMatches = (item: IPoliciesAndProceduresItem, searchText: string): boolean => {
    if (!searchText) return true;
    return (
      PoliciesSearchService.matches(item.name || "", searchText) ||
      PoliciesSearchService.matches(item.tag || "", searchText) ||
      PoliciesSearchService.matches(item.department || "", searchText)
    );
  };

  private folderHasMatch = (
    folderId: string,
    searchText: string,
    visited = new Set<string>()
  ): boolean => {
    if (!searchText) return true;

    const normalizedFolderKey = PoliciesSearchService.toKey(folderId);
    if (visited.has(normalizedFolderKey)) return false;
    visited.add(normalizedFolderKey);

    const expandedChildrenRealKey =
      Object.keys(this.props.expandedChildren).find(
        (storedKey) => PoliciesSearchService.toKey(storedKey) === normalizedFolderKey
      ) || folderId;

    const childItems = this.props.expandedChildren[expandedChildrenRealKey] || [];
    for (const child of childItems) {
      if (this.itemMatches(child, searchText)) return true;
      if (child.isFolder && this.folderHasMatch(child.id, searchText, visited)) return true;
    }
    return false;
  };

  private shouldShowFolder = (folder: IPoliciesAndProceduresItem, searchText: string): boolean => {
    if (!searchText) return true;

    // KEY FIX:
    // While search is still running or failed, never hide folders (prevents UI going blank)
    const currentSearchState = this.props.searchState || "idle";
    if (currentSearchState !== "done") return true;

    if (this.isForced(folder.id)) return true;
    if (this.itemMatches(folder, searchText)) return true;
    return this.folderHasMatch(folder.id, searchText);
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
            Modified &nbsp;·&nbsp; {item.modifiedBy || "-"} &nbsp;·&nbsp;
            {item.modifiedOn ? this._formatModifiedDate(item.modifiedOn) : "-"}
          </div>

          {/* ── Category + dept on same line ── */}
          <div className={styles.categoryInline}>
            <img src={ICON_TAG} alt="" className={styles.categoryIcon} />
            <span className={styles.categoryText}>{meta.categoryLabel}</span>
            {!!item.department && (
              <>
                <span className={styles.categoryText}> · </span>
                <span className={styles.cellDept}>{item.department}</span>
              </>
            )}
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
          <button type="button" className={styles.openBtn} aria-label={item.name} onClick={(e) => e.stopPropagation()}>
            <img className={styles.typeIcon} src={meta.fileIcon} alt="" />
          </button>
        </div>

        <div className={styles.cardFavWrap}>
          {!item.isFolder && !!item.serverRelativeUrl && (
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
          )}

          {!item.isFolder && !!meta.downloadUrl && (
            <a className={styles.favBtn} href={meta.downloadUrl} title="Download" onClick={(e) => e.stopPropagation()}>
              <img src={ICON_DOWNLOAD} alt="" className={styles.favIcon} />
            </a>
          )}
        </div>

        <div className={styles.cardTitle}>
          <button type="button" className={styles.openBtn} onClick={(e) => e.stopPropagation()}>
            {item.name}
          </button>
        </div>

        <div className={styles.cardMetaRow}>
          <span className={styles.meta}>
            Modified &nbsp;·&nbsp; {item.modifiedBy || "-"} &nbsp;·&nbsp;
            {item.modifiedOn ? this._formatModifiedDate(item.modifiedOn) : "-"}
          </span>
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
    const currentSearchText = this.searchTextTrimmed;

    const normalizedFolderKey = PoliciesSearchService.toKey(folderId);
    const expandedChildrenRealKey =
      Object.keys(this.props.expandedChildren).find(
        (storedKey) => PoliciesSearchService.toKey(storedKey) === normalizedFolderKey
      ) || folderId;

    const childItems = this.props.expandedChildren[expandedChildrenRealKey] || [];

    const childFolders = childItems
      .filter((child) => child.isFolder)
      .filter((folder) => this.shouldShowFolder(folder, currentSearchText));

    const childFiles = childItems
      .filter((child) => !child.isFolder)
      .filter((file) => this.itemMatches(file, currentSearchText));

    return (
      <div>
        {childFolders.map((folder) => this.renderFolderBlock(folder, true))}

        {this.props.getFolderViewMode(folderId) === "list" && (
          <div>{childFiles.map((file) => this.renderFileRow(file, this.props.activeId === file.id, folderId))}</div>
        )}

        {this.props.getFolderViewMode(folderId) === "grid" && (
          <div className={styles.gridBody}>
            {childFiles.map((file) => this.renderGridCard(file, this.props.activeId === file.id, folderId))}
          </div>
        )}
      </div>
    );
  };

  private renderFolderBlock = (folder: IPoliciesAndProceduresItem, nested?: boolean): React.ReactNode => {
    const currentSearchText = this.searchTextTrimmed;
    if (!this.shouldShowFolder(folder, currentSearchText)) return null;

    const mustExpandFromSearch = !!currentSearchText && this.isForced(folder.id);
    const isExpanded = mustExpandFromSearch || this.isFolderExpanded(folder.id);

    const viewMode = this.props.getFolderViewMode(folder.id);

    const normalizedFolderKey = PoliciesSearchService.toKey(folder.id);
    const expandedChildrenRealKey =
      Object.keys(this.props.expandedChildren).find(
        (storedKey) => PoliciesSearchService.toKey(storedKey) === normalizedFolderKey
      ) || folder.id;

    const childItems = this.props.expandedChildren[expandedChildrenRealKey] || [];

    const filesInFolder = childItems
      .filter((child) => !child.isFolder)
      .filter((file) => this.itemMatches(file, currentSearchText));

    const allFileIds = filesInFolder.map((file) => file.id);
    const selectedFiles = filesInFolder.filter((file) => this.isSelected(file.id, folder.id));
    const isAllSelected =
      allFileIds.length > 0 && allFileIds.every((fileId) => this.isSelected(fileId, folder.id));

    return (
      <div key={folder.id} className={`${styles.folderBlock} ${nested ? styles.folderNested : ""}`}>
        <div
          className={styles.folderHeader}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onClick={(e) => void this.toggleFolderUi(folder, e)}
          onKeyDown={(e) => {
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
              onClick={(e) => void this.openFolderInViewMode(folder, "list", e)}
            />
            <IconButton
              className={viewMode === "grid" ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_GRID} alt="" className={styles.typeIcon} />}
              title="Grid view"
              ariaLabel="Grid view"
              onClick={(e) => void this.openFolderInViewMode(folder, "grid", e)}
            />
          </div>
        </div>

        {isExpanded && (
          <div className={styles.folderContent}>
            <div className={styles.actionBar}>
              <div className={styles.selectAllWrap} onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  label="Select all"
                  checked={isAllSelected}
                  onChange={(e, checked) => {
                    e?.stopPropagation();
                    this.setSelectedBulk(allFileIds, !!checked, folder.id);
                  }}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div
                  className={styles.actionBarRight}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    this._utils.exportSelectedToCsv(selectedFiles, "documents.csv");
                  }}
                  onKeyDown={(e) => {
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
    const libraryRoot = (this.props.dmsLibraryRoot || "").trim();
    if (libraryRoot !== (this._lastRoot || "")) {
      this._lastRoot = libraryRoot;
      this._utils.setLibraryRoot(libraryRoot);
    }

    const currentSearchText = this.searchTextTrimmed;

    const rootFolders = this.props.items
      .filter((item) => item.isFolder)
      .filter((folder) => this.shouldShowFolder(folder, currentSearchText));

    const rootFiles = this.props.items
      .filter((item) => !item.isFolder)
      .filter((file) => this.itemMatches(file, currentSearchText));

    return (
      <div>
        {rootFolders.map((folder) => this.renderFolderBlock(folder))}
        {rootFiles.map((file) => this.renderFileRow(file, this.props.activeId === file.id))}
      </div>
    );
  }
}
