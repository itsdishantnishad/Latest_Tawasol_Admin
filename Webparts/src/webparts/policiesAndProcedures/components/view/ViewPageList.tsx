import * as React from 'react';
import { Checkbox, IconButton } from '@fluentui/react';
import styles from './ViewPage.module.scss';
import {
  ICON_DOC_FOLDER_GRID,
  ICON_DOC_FOLDER_LIST,
  ICON_EXPORT_TO_CSV,
  ICON_FOLDER,
  ICON_JPG,
  ICON_PDF,
  ICON_POWERPOINT,
  ICON_TEXT,
  ICON_WORD,
  ICON_ZIP,
  ICON_ARROW_UP,
  ICON_ARROW_DOWN,
  ICON_TAG,
  ICON_HEART
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
  expandedFolderId?: string;

  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;

  onSwitchFolderView: (folderId: string, mode: 'list' | 'grid') => void;
  getFolderViewMode: (folderId: string) => 'list' | 'grid';
  favouriteIndex?: Record<string, number>; 
  onToggleFavourite?: (file: IPoliciesAndProceduresItem) => void;
}

type State = {
  selectedIds: Record<string, Set<string>>;
  expandedFolderIds: Set<string>;
};

export default class PoliciesAndProceduresList extends React.Component<
  IPoliciesAndProceduresListProps,
  State
> {
  state: State = {
    selectedIds: {},
    expandedFolderIds: new Set()
  };

  // ---------- selection helpers ----------
  private getScopeKey = (folderId?: string) => folderId || 'root';

  private isSelected = (itemId: string, folderId?: string) =>
    this.state.selectedIds[this.getScopeKey(folderId)]?.has(itemId) ?? false;

  private setSelectedBulk = (itemIds: string[], checked: boolean, folderId?: string) => {
    const scopeKey = this.getScopeKey(folderId);

    this.setState(previousState => {
      const nextSelected = new Set(previousState.selectedIds[scopeKey] ?? []);
      if (checked) itemIds.forEach(id => nextSelected.add(id));
      else itemIds.forEach(id => nextSelected.delete(id));

      return {
        ...previousState,
        selectedIds: { ...previousState.selectedIds, [scopeKey]: nextSelected }
      };
    });
  };

  private toggleOne = (itemId: string, folderId?: string) => {
    const scopeKey = this.getScopeKey(folderId);

    this.setState(previousState => {
      const nextSelected = new Set(previousState.selectedIds[scopeKey] ?? []);
      nextSelected.has(itemId) ? nextSelected.delete(itemId) : nextSelected.add(itemId);

      return {
        ...previousState,
        selectedIds: { ...previousState.selectedIds, [scopeKey]: nextSelected }
      };
    });
  };

  // ---------- folder expand helpers (multi expand) ----------
  private isFolderExpanded = (folderId: string) => this.state.expandedFolderIds.has(folderId);

  private expandFolder = async (folder: IPoliciesAndProceduresItem): Promise<void> => {
    if (!this.props.expandedChildren[folder.id] && folder.serverRelativeUrl) {
      await this.props.onToggleFolder(folder);
    }

    this.setState(previousState => {
      const nextExpanded = new Set(previousState.expandedFolderIds);
      nextExpanded.add(folder.id);
      return { ...previousState, expandedFolderIds: nextExpanded };
    });
  };

  private collapseFolder = (folderId: string): void => {
    this.setState(previousState => {
      const nextExpanded = new Set(previousState.expandedFolderIds);
      nextExpanded.delete(folderId);
      return { ...previousState, expandedFolderIds: nextExpanded };
    });
  };

  private toggleFolderUi = async (
    folder: IPoliciesAndProceduresItem,
    clickEvent?: React.MouseEvent<HTMLElement>
  ): Promise<void> => {
    clickEvent?.stopPropagation();

    if (this.isFolderExpanded(folder.id)) {
      this.collapseFolder(folder.id);
      return;
    }

    await this.expandFolder(folder);
  };

  private openFolderInViewMode = async (
    folder: IPoliciesAndProceduresItem,
    viewMode: 'list' | 'grid',
    clickEvent?: React.MouseEvent<any>
  ): Promise<void> => {
    clickEvent?.stopPropagation();

    this.props.onSwitchFolderView(folder.id, viewMode);

    if (!this.isFolderExpanded(folder.id)) {
      await this.expandFolder(folder);
      return;
    }

    if (!this.props.expandedChildren[folder.id] && folder.serverRelativeUrl) {
      await this.props.onToggleFolder(folder);
    }
  };

  // ---------- icon helpers ----------
  private getIconUrl = (item: IPoliciesAndProceduresItem): string => {
    if (item.isFolder) return ICON_FOLDER;

    switch (item.ext) {
      case 'pdf': return ICON_PDF;
      case 'docx': return ICON_WORD;
      case 'pptx': return ICON_POWERPOINT;
      case 'jpg': return ICON_JPG;
      case 'zip': return ICON_ZIP;
      case 'txt': return ICON_TEXT;
      case 'xlsx': return ICON_TEXT;
      default: return ICON_TEXT;
    }
  };

  private getFavouriteKey = (item: IPoliciesAndProceduresItem) =>
    (item.serverRelativeUrl || '').toLowerCase();

  private isFavourited = (item: IPoliciesAndProceduresItem) => {
    const favouriteKey = this.getFavouriteKey(item);
    return !!favouriteKey && !!this.props.favouriteIndex?.[favouriteKey];
  };

  // ---------- CSV export (selected rows only) ----------
  private exportSelectedToCsv = (selectedItems: IPoliciesAndProceduresItem[], clickEvent?: React.MouseEvent) => {
    clickEvent?.stopPropagation();
    if (!selectedItems.length) return;

    const header = ['Name', 'Type', 'Modified by', 'Modified on', 'Tag', 'Department'];

    const rows = selectedItems.map(item => [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      item.ext || '',
      `"${(item.modifiedBy || '').replace(/"/g, '""')}"`,
      item.modifiedOn ? item.modifiedOn.toLocaleDateString() : '',
      `"${(item.tag || '').replace(/"/g, '""')}"`,
      item.department || ''
    ].join(','));

    const csv = header.join(',') + '\r\n' + rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'documents.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // ---------- render helpers ----------
  private renderTypeIcon = (item: IPoliciesAndProceduresItem): React.ReactNode => (
    <img className={styles.typeIcon} src={this.getIconUrl(item)} alt="" />
  );

  private renderFavouriteButton = (item: IPoliciesAndProceduresItem) => {
    if (item.isFolder) return null;
    if (!item.serverRelativeUrl) return null;

    const isFavouriteOn = this.isFavourited(item);

    return (
      <button
        type="button"
        title={isFavouriteOn ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          this.props.onToggleFavourite?.(item);
        }}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
      >
        <img
          src={ICON_HEART}
          alt=""
          style={{ width: 18, height: 18, opacity: isFavouriteOn ? 1 : 0.35 }}
        />
      </button>
    );
  };

  private renderFileRow = (item: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string): React.ReactNode => {
    const checked = this.isSelected(item.id, folderId);

    return (
      <div key={item.id} className={`${styles.row} ${isActive ? styles.rowActive : ''}`}>
        <div>
          <Checkbox
            checked={checked}
            onChange={(changeEvent, isChecked) => {
              changeEvent?.stopPropagation();
              this.toggleOne(item.id, folderId);

              if (isChecked) {
                this.props.onOpenFile(item);
              } else if (this.props.activeId === item.id) {
                this.props.onClearPreview?.();
              }
            }}
          />
        </div>

        <div>
          <button
            type="button"
            className={styles.openBtn}
            aria-label={item.name}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            {this.renderTypeIcon(item)}
          </button>
        </div>

        <div className={styles.cellName}>
          <button
            type="button"
            className={`${styles.nameStrong} ${styles.openBtn}`}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            {item.name}
          </button>

          <div className={styles.meta}>
            Modified by : {item.modifiedBy || '-'} &nbsp;•&nbsp;
            Modified on : {item.modifiedOn ? item.modifiedOn.toLocaleDateString() : '-'}
          </div>
        </div>

        <div>
          {item.tag && (
            <span className={styles.tagPill}>
              <img src={ICON_TAG} alt="" className={styles.tagIcon} />
              {item.tag}
            </span>
          )}
        </div>

        <div className={styles.cellDept}>{item.department || ''}</div>

        <div>{checked ? this.renderFavouriteButton(item) : null}</div>
      </div>
    );
  };

  private renderGridCard = (item: IPoliciesAndProceduresItem, isActive: boolean, folderId?: string): React.ReactNode => {
    const checked = this.isSelected(item.id, folderId);

    return (
      <div key={item.id} className={`${styles.card} ${isActive ? styles.cardActive : ''}`}>
        <div className={styles.cardThumb}>
          <button
            type="button"
            className={styles.openBtn}
            aria-label={item.name}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            {this.renderTypeIcon(item)}
          </button>
        </div>

        {checked && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            {this.renderFavouriteButton(item)}
          </div>
        )}

        <div className={styles.cardTitle}>
          <button
            type="button"
            className={styles.openBtn}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            {item.name}
          </button>
        </div>

        <div className={styles.cardMetaRow}>
          <span className={styles.meta}>{item.modifiedBy || '-'}</span>
          <span className={styles.meta}>{item.modifiedOn ? item.modifiedOn.toLocaleDateString() : '-'}</span>
        </div>

        <div className={styles.cardFooter}>
          {item.tag && (
            <span className={styles.cardTag}>
              <img src={ICON_TAG} alt="" className={styles.tagIcon} />
              {item.tag}
            </span>
          )}
          <span className={styles.cardDept}>{item.department || ''}</span>
        </div>

        <Checkbox
          checked={checked}
          onChange={(changeEvent, isChecked) => {
            changeEvent?.stopPropagation();
            this.toggleOne(item.id, folderId);

            if (isChecked) {
              this.props.onOpenFile(item);
            } else if (this.props.activeId === item.id) {
              this.props.onClearPreview?.();
            }
          }}
          styles={{ root: { position: 'absolute', top: 8, left: 8 } }}
        />
      </div>
    );
  };

  private renderFolderChildrenRecursive = (folderId: string): React.ReactNode => {
    const children = this.props.expandedChildren[folderId] || [];
    const childFolders = children.filter(child => child.isFolder);
    const childFiles = children.filter(child => !child.isFolder);

    return (
      <div>
        {childFolders.map(childFolder => this.renderFolderBlock(childFolder, true))}

        {this.props.getFolderViewMode(folderId) === 'list' && (
          <div>
            {childFiles.map(file => this.renderFileRow(file, this.props.activeId === file.id, folderId))}
          </div>
        )}

        {this.props.getFolderViewMode(folderId) === 'grid' && (
          <div className={styles.gridBody}>
            {childFiles.map(file => this.renderGridCard(file, this.props.activeId === file.id, folderId))}
          </div>
        )}
      </div>
    );
  };

  private renderFolderBlock = (folder: IPoliciesAndProceduresItem, isNested?: boolean): React.ReactNode => {
    const { expandedChildren, getFolderViewMode } = this.props;

    const isExpanded = this.isFolderExpanded(folder.id);
    const currentViewMode = getFolderViewMode(folder.id);

    const children = expandedChildren[folder.id] || [];
    const fileChildren = children.filter(child => !child.isFolder);

    const allFileIds = fileChildren.map(file => file.id);
    const selectedFiles = fileChildren.filter(file => this.isSelected(file.id, folder.id));
    const isAllSelected = allFileIds.length > 0 && allFileIds.every(fileId => this.isSelected(fileId, folder.id));

    return (
      <div key={folder.id} className={`${styles.folderBlock} ${isNested ? styles.folderNested : ''}`}>
        <div
          className={styles.folderHeader}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onClick={(clickEvent) => void this.toggleFolderUi(folder, clickEvent)}
          onKeyDown={(keyboardEvent) => {
            if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
              keyboardEvent.preventDefault();
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
              className={currentViewMode === 'list' ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_LIST} alt="" className={styles.typeIcon} />}
              title="List view"
              ariaLabel="List view"
              onClick={(clickEvent) => void this.openFolderInViewMode(folder, 'list', clickEvent)}
            />

            <IconButton
              className={currentViewMode === 'grid' ? styles.viewBtnActive : styles.viewBtn}
              onRenderIcon={() => <img src={ICON_DOC_FOLDER_GRID} alt="" className={styles.typeIcon} />}
              title="Grid view"
              ariaLabel="Grid view"
              onClick={(clickEvent) => void this.openFolderInViewMode(folder, 'grid', clickEvent)}
            />
          </div>
        </div>

        {isExpanded && (
          <div className={styles.folderContent}>
            <div className={styles.actionBar}>
              <div className={styles.selectAllWrap} onClick={(clickEvent) => clickEvent.stopPropagation()}>
                <Checkbox
                  label="Select all"
                  checked={isAllSelected}
                  onChange={(changeEvent, checked) => {
                    changeEvent?.stopPropagation();
                    this.setSelectedBulk(allFileIds, !!checked, folder.id);
                  }}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div
                  className={styles.actionBarRight}
                  onClick={(clickEvent) => this.exportSelectedToCsv(selectedFiles, clickEvent)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                      this.exportSelectedToCsv(selectedFiles);
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
    const rootFolders = this.props.items.filter(item => item.isFolder);
    const rootFiles = this.props.items.filter(item => !item.isFolder);

    return (
      <div>
        {rootFolders.map(folder => this.renderFolderBlock(folder))}
        {rootFiles.map(file => this.renderFileRow(file, this.props.activeId === file.id))}
      </div>
    );
  }
}
