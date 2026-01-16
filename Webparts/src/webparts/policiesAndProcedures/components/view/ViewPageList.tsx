// ViewPageList.tsx

import * as React from 'react';
import { Checkbox, IconButton } from '@fluentui/react';
import styles from './ViewPage.module.scss';
import {
  ICON_DOC_FOLDER_GRID, ICON_DOC_FOLDER_LIST, ICON_EXPORT_TO_CSV, ICON_FOLDER,
  ICON_JPG, ICON_PDF, ICON_POWERPOINT, ICON_TEXT, ICON_WORD, ICON_ZIP,
  ICON_ARROW_UP, ICON_ARROW_DOWN, ICON_TAG, ICON_HEART
} from '../../../assets/constants';

export type IPoliciesAndProceduresItem = {
  id: string;
  name: string;
  isFolder?: boolean;
  ext?: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'jpg' | 'txt' | 'zip';
  modifiedBy?: string;
  modifiedOn?: Date;
  department?: string;
  tag?: string;
  previewUrl?: string;
  serverRelativeUrl?: string;
};

export interface IPoliciesAndProceduresListProps {
  items: IPoliciesAndProceduresItem[];
  activeId?: string;

  onOpenFile: (fileItem: IPoliciesAndProceduresItem) => void;
  onClearPreview?: () => void;
  onToggleFolder: (folderItem: IPoliciesAndProceduresItem) => void;

  // kept (no breaking change) but NOT used for expand anymore
  expandedFolderId?: string;

  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;

  onSwitchFolderView: (folderId: string, mode: 'list' | 'grid') => void;
  getFolderViewMode: (folderId: string) => 'list' | 'grid';
  favouriteIndex?: Record<string, number>; // key=serverRelativeUrl lower
  onToggleFavourite?: (file: IPoliciesAndProceduresItem) => void;
}

type State = {
  /** selected file ids per scope (folderId or 'root') */
  selectedIds: Record<string, Set<string>>;

  /** NEW: allow multi folder expand (keeps parent open) */
  expandedFolderIds: Set<string>;
};

export default class PoliciesAndProceduresList extends React.Component<IPoliciesAndProceduresListProps, State> {
  state: State = { selectedIds: {}, expandedFolderIds: new Set() };

  // ---------- selection helpers ----------
  private getKeyForScope = (folderId?: string) => folderId || 'root';

  private isSelected = (id: string, folderId?: string) =>
    this.state.selectedIds[this.getKeyForScope(folderId)]?.has(id) ?? false;

  private setSelectedBulk = (ids: string[], checked: boolean, folderId?: string) => {
    const key = this.getKeyForScope(folderId);
    this.setState(prev => {
      const next = new Set(prev.selectedIds[key] ?? []);
      if (checked) ids.forEach(i => next.add(i));
      else ids.forEach(i => next.delete(i));
      return { ...prev, selectedIds: { ...prev.selectedIds, [key]: next } };
    });
  };

  private toggleOne = (id: string, folderId?: string) => {
    const key = this.getKeyForScope(folderId);
    this.setState(prev => {
      const next = new Set(prev.selectedIds[key] ?? []);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, selectedIds: { ...prev.selectedIds, [key]: next } };
    });
  };

  // ---------- folder expand helpers (multi expand) ----------
  private isFolderExpanded = (folderId: string) => this.state.expandedFolderIds.has(folderId);

  // FIX: broader event type (works for div)
  private toggleFolderUi = async (folder: IPoliciesAndProceduresItem, e?: React.MouseEvent<HTMLElement>): Promise<void> => {
    e?.stopPropagation();

    const isOpen = this.isFolderExpanded(folder.id);

    // collapse
    if (isOpen) {
      this.setState(prev => {
        const next = new Set(prev.expandedFolderIds);
        next.delete(folder.id);
        return { ...prev, expandedFolderIds: next };
      });
      return;
    }

    // open: ensure children are loaded once
    if (!this.props.expandedChildren[folder.id] && folder.serverRelativeUrl) {
      await this.props.onToggleFolder(folder);
    }

    this.setState(prev => {
      const next = new Set(prev.expandedFolderIds);
      next.add(folder.id);
      return { ...prev, expandedFolderIds: next };
    });
  };

  // ---------- icon helpers ----------
  private getIconUrl = (it: IPoliciesAndProceduresItem): string => {
    if (it.isFolder) return ICON_FOLDER;
    switch (it.ext) {
      case 'pdf':  return ICON_PDF;
      case 'docx': return ICON_WORD;
      case 'pptx': return ICON_POWERPOINT;
      case 'jpg':  return ICON_JPG;
      case 'zip':  return ICON_ZIP;
      case 'txt':  return ICON_TEXT;
      case 'xlsx': return ICON_TEXT; // fallback
      default:     return ICON_TEXT;
    }
  };

  private favKey = (it: IPoliciesAndProceduresItem) => (it.serverRelativeUrl || '').toLowerCase();

  private isFavourited = (it: IPoliciesAndProceduresItem) => {
    const k = this.favKey(it);
    return !!k && !!this.props.favouriteIndex?.[k];
  };

  // ---------- CSV export (selected rows only) ----------
  private exportSelectedToCsv = (selected: IPoliciesAndProceduresItem[], e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selected.length) return;

    const header = ['Name', 'Type', 'Modified by', 'Modified on', 'Tag', 'Department'];
    const rows = selected.map(row => [
      `"${(row.name || '').replace(/"/g, '""')}"`,
      row.ext || '',
      `"${(row.modifiedBy || '').replace(/"/g, '""')}"`,
      row.modifiedOn ? row.modifiedOn.toLocaleDateString() : '',
      `"${(row.tag || '').replace(/"/g, '""')}"`,
      row.department || ''
    ].join(','));

    const blob = new Blob([header.join(',') + '\r\n' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'documents.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- render helpers ----------
  private renderTypeIcon = (listItem: IPoliciesAndProceduresItem): React.ReactNode => (
    <img className={styles.typeIcon} src={this.getIconUrl(listItem)} alt="" />
  );

  private renderFavBtn = (it: IPoliciesAndProceduresItem) => {
    if (it.isFolder) return null;
    if (!it.serverRelativeUrl) return null;

    const on = this.isFavourited(it);
    return (
      <button
        type="button"
        title={on ? "Remove from favourites" : "Add to favourites"}
        onClick={(e) => { e.stopPropagation(); this.props.onToggleFavourite?.(it); }}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
      >
        <img
          src={ICON_HEART}
          alt=""
          style={{ width: 18, height: 18, opacity: on ? 1 : 0.35 }}
        />
      </button>
    );
  };

  private renderFileRow = (listItem: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string): React.ReactNode => {
    const checked = this.isSelected(listItem.id, folderId);

    return (
      <div key={listItem.id} className={`${styles.row} ${isActive ? styles.rowActive : ''}`}>
        <div>
          <Checkbox
            checked={checked}
            onChange={(e, isChecked) => {
              e?.stopPropagation();
              this.toggleOne(listItem.id, folderId);
              if (isChecked) {
                this.props.onOpenFile(listItem);
              } else {
                if (this.props.activeId === listItem.id) {
                  this.props.onClearPreview?.();
                }
              }
            }}
          />
        </div>

        <div>
          <button
            type="button"
            className={styles.openBtn}
            aria-label={listItem.name}
            onClick={(e) => { e.stopPropagation(); }}
          >
            {this.renderTypeIcon(listItem)}
          </button>
        </div>

        <div className={styles.cellName}>
          <button
            type="button"
            className={`${styles.nameStrong} ${styles.openBtn}`}
            onClick={(e) => { e.stopPropagation(); }}
          >
            {listItem.name}
          </button>

          <div className={styles.meta}>
            Modified by : {listItem.modifiedBy || '-'} &nbsp;•&nbsp;
            Modified on : {listItem.modifiedOn ? listItem.modifiedOn.toLocaleDateString() : '-'}
          </div>
        </div>

        <div>
          {listItem.tag && (
            <span className={styles.tagPill}>
              <img src={ICON_TAG} alt="" className={styles.tagIcon} />
              {listItem.tag}
            </span>
          )}
        </div>

        <div className={styles.cellDept}>{listItem.department || ''}</div>

        <div>
          {checked ? this.renderFavBtn(listItem) : null}
        </div>
      </div>
    );
  };

  private renderGridCard = (listItem: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string): React.ReactNode => {
    const checked = this.isSelected(listItem.id, folderId);

    return (
      <div key={listItem.id} className={`${styles.card} ${isActive ? styles.cardActive : ''}`}>
        <div className={styles.cardThumb}>
          <button
            type="button"
            className={styles.openBtn}
            aria-label={listItem.name}
            onClick={(e) => { e.stopPropagation(); }}
          >
            {this.renderTypeIcon(listItem)}
          </button>
        </div>

        {checked && (
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            {this.renderFavBtn(listItem)}
          </div>
        )}

        <div className={styles.cardTitle}>
          <button
            type="button"
            className={styles.openBtn}
            onClick={(e) => { e.stopPropagation(); }}
          >
            {listItem.name}
          </button>
        </div>

        <div className={styles.cardMetaRow}>
          <span className={styles.meta}>{listItem.modifiedBy || '-'}</span>
          <span className={styles.meta}>{listItem.modifiedOn ? listItem.modifiedOn.toLocaleDateString() : '-'}</span>
        </div>

        <div className={styles.cardFooter}>
          {listItem.tag && (
            <span className={styles.cardTag}>
              <img src={ICON_TAG} alt="" className={styles.tagIcon} />
              {listItem.tag}
            </span>
          )}
          <span className={styles.cardDept}>{listItem.department || ''}</span>
        </div>

        <Checkbox
          checked={checked}
          onChange={(e, isChecked) => {
            e?.stopPropagation();
            this.toggleOne(listItem.id, folderId);
            if (isChecked) {
              this.props.onOpenFile(listItem);
            } else {
              if (this.props.activeId === listItem.id) {
                this.props.onClearPreview?.();
              }
            }
          }}
          styles={{ root: { position: 'absolute', top: 8, left: 8 } }}
        />
      </div>
    );
  };

  private renderFolderChildrenRecursive = (folderId: string): React.ReactNode => {
    const children = this.props.expandedChildren[folderId] || [];
    const folders = children.filter(x => x.isFolder);
    const files = children.filter(x => !x.isFolder);

    return (
      <div>
        {folders.map(sf => this.renderFolderBlock(sf, true))}

        {this.props.getFolderViewMode(folderId) === 'list' && (
          <div>
            {files.map(file => this.renderFileRow(file, this.props.activeId === file.id, folderId))}
          </div>
        )}

        {this.props.getFolderViewMode(folderId) === 'grid' && (
          <div className={styles.gridBody}>
            {files.map(file => this.renderGridCard(file, this.props.activeId === file.id, folderId))}
          </div>
        )}
      </div>
    );
  };

  private renderFolderBlock = (folder: IPoliciesAndProceduresItem, isNested?: boolean): React.ReactNode => {
    const { expandedChildren, getFolderViewMode } = this.props;

    const isExpanded = this.isFolderExpanded(folder.id);
    const mode = getFolderViewMode(folder.id);

    const children = expandedChildren[folder.id] || [];
    const filesOnly = children.filter(x => !x.isFolder);

    const allFileIds = filesOnly.map(f => f.id);
    const selectedFiles = filesOnly.filter(f => this.isSelected(f.id, folder.id));
    const allSelected = allFileIds.length > 0 && allFileIds.every(id => this.isSelected(id, folder.id));

    return (
      <div key={folder.id} className={`${styles.folderBlock} ${isNested ? styles.folderNested : ''}`}>

        {/* FIX: div instead of button (prevents button-inside-button issue) */}
        <div
          className={styles.folderHeader}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onClick={(e) => void this.toggleFolderUi(folder, e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
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
              className={mode === 'list' ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_LIST} alt="" className={styles.typeIcon} />}
              title="List view"
              ariaLabel="List view"
              onClick={(e) => { e.stopPropagation(); this.props.onSwitchFolderView(folder.id, 'list'); }}
            />
            <IconButton
              className={mode === 'grid' ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_GRID} alt="" className={styles.typeIcon} />}
              title="Grid view"
              ariaLabel="Grid view"
              onClick={(e) => { e.stopPropagation(); this.props.onSwitchFolderView(folder.id, 'grid'); }}
            />
          </div>
        </div>

        {isExpanded && (
          <div className={styles.folderContent}>
            <div className={styles.actionBar}>
              <div className={styles.selectAllWrap} onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  label="Select all"
                  checked={allSelected}
                  onChange={(e, checked) => {
                    e?.stopPropagation();
                    this.setSelectedBulk(allFileIds, !!checked, folder.id);
                  }}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div
                  className={styles.actionBarRight}
                  onClick={(e) => this.exportSelectedToCsv(selectedFiles, e)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') this.exportSelectedToCsv(selectedFiles);
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
    const { items } = this.props;
    const rootFolders = items.filter(x => x.isFolder);
    const rootFiles = items.filter(x => !x.isFolder);

    return (
      <div>
        {rootFolders.map(f => this.renderFolderBlock(f))}
        {rootFiles.map(file => this.renderFileRow(file, this.props.activeId === file.id))}
      </div>
    );
  }
}
