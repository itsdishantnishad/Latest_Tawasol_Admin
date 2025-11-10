import * as React from 'react';
import { Checkbox, IconButton } from '@fluentui/react';
import styles from './ViewPage.module.scss';
import {
  ICON_DOC_FOLDER_GRID, ICON_DOC_FOLDER_LIST, ICON_EXPORT_TO_CSV, ICON_FOLDER,
  ICON_JPG, ICON_PDF, ICON_POWERPOINT, ICON_TEXT, ICON_WORD, ICON_ZIP,
  ICON_ARROW_UP, ICON_ARROW_DOWN, ICON_TAG
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
  onToggleFolder: (folderItem: IPoliciesAndProceduresItem) => void;

  expandedFolderId?: string;
  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;

  onSwitchFolderView: (folderId: string, mode: 'list' | 'grid') => void;
  getFolderViewMode: (folderId: string) => 'list' | 'grid';
}

type State = {
  /** selected file ids per scope (folderId or 'root') */
  selectedIds: Record<string, Set<string>>;
};

export default class PoliciesAndProceduresList extends React.Component<IPoliciesAndProceduresListProps, State> {
  state: State = { selectedIds: {} };

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
      return { selectedIds: { ...prev.selectedIds, [key]: next } };
    });
  };

  private toggleOne = (id: string, folderId?: string) => {
    const key = this.getKeyForScope(folderId);
    this.setState(prev => {
      const next = new Set(prev.selectedIds[key] ?? []);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selectedIds: { ...prev.selectedIds, [key]: next } };
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

  // ---------- renderers ----------
  private renderTypeIcon = (listItem: IPoliciesAndProceduresItem): React.ReactNode => (
    <img className={styles.typeIcon} src={this.getIconUrl(listItem)} alt="" />
  );

  private renderFileRow = (listItem: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string): React.ReactNode => {
    const checked = this.isSelected(listItem.id, folderId);
    return (
      <div key={listItem.id} className={`${styles.row} ${isActive ? styles.rowActive : ''}`}>
        <div className={styles.cellCheckbox}>
          <Checkbox checked={checked} onChange={(e) => { e?.stopPropagation(); this.toggleOne(listItem.id, folderId); }} />
        </div>

        {/* ONLY icon clicks open preview */}
        <div className={styles.cellIcon}>
          <button type="button" className={styles.openBtn} aria-label={`Open ${listItem.name}`}
            onClick={(e) => { e.stopPropagation(); this.props.onOpenFile(listItem); }}>
            {this.renderTypeIcon(listItem)}
          </button>
        </div>

        <div className={styles.cellName}>
          {/* ONLY name clicks open preview */}
          <button type="button" className={`${styles.nameStrong} ${styles.openBtn}`}
            onClick={(e) => { e.stopPropagation(); this.props.onOpenFile(listItem); }}>
            {listItem.name}
          </button>
          <div className={styles.meta}>
            Modified by : {listItem.modifiedBy || '-'} &nbsp;•&nbsp; Modified on : {listItem.modifiedOn ? listItem.modifiedOn.toLocaleDateString() : '-'}
          </div>
        </div>

        <div className={styles.cellTag}>
          {listItem.tag && (
            <span className={styles.tagPill}>
              <img src={ICON_TAG} alt="" className={styles.tagIcon} />
              {listItem.tag}
            </span>
          )}
        </div>

        <div className={styles.cellDept}>{listItem.department || ''}</div>
      </div>
    );
  };

  private renderGridCard = (listItem: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string): React.ReactNode => {
    const checked = this.isSelected(listItem.id, folderId);
    return (
      <div key={listItem.id} className={`${styles.card} ${isActive ? styles.cardActive : ''}`}>
        <div className={styles.cardThumb}>
          <button type="button" className={styles.openBtn} aria-label={`Open ${listItem.name}`}
            onClick={(e) => { e.stopPropagation(); this.props.onOpenFile(listItem); }}>
            {this.renderTypeIcon(listItem)}
          </button>
        </div>

        <div className={styles.cardTitle}>
          <button type="button" className={styles.openBtn}
            onClick={(e) => { e.stopPropagation(); this.props.onOpenFile(listItem); }}>
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
          onChange={(e) => { e?.stopPropagation(); this.toggleOne(listItem.id, folderId); }}
          styles={{ root: { position: 'absolute', top: 8, left: 8 } }}
        />
      </div>
    );
  };

  private renderFolderBlock = (folder: IPoliciesAndProceduresItem): React.ReactNode => {
    const { expandedFolderId, expandedChildren, getFolderViewMode } = this.props;
    const isExpanded = expandedFolderId === folder.id;
    const mode = getFolderViewMode(folder.id);

    const files = (expandedChildren[folder.id] || []).filter(x => !x.isFolder);
    const allFileIds = files.map(f => f.id);
    const selectedFiles = files.filter(f => this.isSelected(f.id, folder.id));
    const allSelected = allFileIds.length > 0 && allFileIds.every(id => this.isSelected(id, folder.id));

    return (
      <div key={folder.id} className={styles.folderBlock}>
        <button
          className={styles.folderHeader}
          onClick={() => this.props.onToggleFolder(folder)}
          aria-expanded={isExpanded}
        >
          {/* expand/collapse arrow */}
          <img src={isExpanded ? ICON_ARROW_UP : ICON_ARROW_DOWN} alt="" className={styles.typeIcon} />
          {/* folder glyph */}
          <span className={styles.folderIconWrap}>
            <img className={styles.typeIcon} src={ICON_FOLDER} alt="" />
          </span>
          <span className={styles.folderTitle}>{folder.name}</span>

          {/* view toggles with your SVGs */}
          <div className={styles.folderToolbar}>
            <IconButton
              className={mode === 'list' ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_LIST} alt="" className={styles.typeIcon} />}
              title="List view" ariaLabel="List view"
              onClick={(e) => { e.stopPropagation(); this.props.onSwitchFolderView(folder.id, 'list'); }}
            />
            <IconButton
              className={mode === 'grid' ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_GRID} alt="" className={styles.typeIcon} />}
              title="Grid view" ariaLabel="Grid view"
              onClick={(e) => { e.stopPropagation(); this.props.onSwitchFolderView(folder.id, 'grid'); }}
            />
          </div>
        </button>

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

              {/* Only show export when any file is selected */}
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
                  <span className={styles.exportText}>Export to CSV</span>
                </div>
              )}
            </div>

            {mode === 'list' && (
              <div className={styles.listBody}>
                {files.map(file => this.renderFileRow(file, this.props.activeId === file.id, folder.id))}
              </div>
            )}

            {mode === 'grid' && (
              <div className={styles.gridBody}>
                {files.map(file => this.renderGridCard(file, this.props.activeId === file.id, folder.id))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  public render(): React.ReactElement<IPoliciesAndProceduresListProps> {
    const { items } = this.props;
    return (
      <div>
        {items.map(item =>
          item.isFolder
            ? this.renderFolderBlock(item)
            : this.renderFileRow(item, this.props.activeId === item.id)
        )}
      </div>
    );
  }
}
