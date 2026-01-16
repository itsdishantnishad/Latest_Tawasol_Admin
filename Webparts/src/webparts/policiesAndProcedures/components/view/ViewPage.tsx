import * as React from 'react';
import { Breadcrumb, IBreadcrumbItem } from '@fluentui/react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import view from './ViewPage.module.scss';
import { breadcrumbBeforeBackArrowSVG } from '../../../assets/constants';

import PoliciesandProceduresList, { IPoliciesAndProceduresItem } from './ViewPageList';
import PoliciesandProceduresPreview from './ViewPagePreview';
import {
  IPoliciesAndProceduresDataProvider,
  PoliciesAndProceduresDummyProvider,
  PoliciesAndProceduresSharePointProvider
} from './ViewPageDataProvider';

export interface IPoliciesAndProceduresViewProps {
  context: WebPartContext;
  functionDisplayName: string;
  onBackToLanding: () => void;
  useSharePointProvider?: boolean;
  dmsLibraryRoot?: string;
}

type FolderViewMode = 'list' | 'grid';

type IPoliciesAndProceduresViewState = {
  breadcrumbs: IBreadcrumbItem[];
  currentItems: IPoliciesAndProceduresItem[];
  selectedItem?: IPoliciesAndProceduresItem;

  // SINGLE expanded folder id (matches ViewPageList.tsx)
  expandedFolderId?: string;

  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;
  folderViewMode: Record<string, FolderViewMode>;
};

export default class PoliciesAndProceduresView extends React.Component<
  IPoliciesAndProceduresViewProps,
  IPoliciesAndProceduresViewState
> {
  private dataProvider: IPoliciesAndProceduresDataProvider;

  constructor(props: IPoliciesAndProceduresViewProps) {
    super(props);

    this.dataProvider = props.useSharePointProvider
      ? new PoliciesAndProceduresSharePointProvider(
          props.context,
          props.dmsLibraryRoot || '/sites/Intranet/DMS'
        )
      : new PoliciesAndProceduresDummyProvider();

    this.state = {
      breadcrumbs: [
        { key: 'bread-root', text: 'Policies & procedures' },
        { key: 'bread-function', text: props.functionDisplayName, isCurrentItem: true }
      ],
      currentItems: [],
      selectedItem: undefined, // ✅ do not auto preview
      expandedFolderId: undefined,
      expandedChildren: {},
      folderViewMode: {}
    };
  }

  public async componentDidMount(): Promise<void> {
    const rootItems = await this.dataProvider.getRootItems(this.props.functionDisplayName);
    this.setState({
      currentItems: rootItems
      // keep selectedItem undefined until user selects file
    });
  }

  private handleOpenFile = (fileItem: IPoliciesAndProceduresItem): void => {
    this.setState({ selectedItem: fileItem });
  };

  // ✅ NEW: clear preview when unselect happens
  private handleClearPreview = (): void => {
    this.setState({ selectedItem: undefined });
  };

  private handleToggleFolder = async (folderItem: IPoliciesAndProceduresItem): Promise<void> => {
    const { expandedFolderId, expandedChildren } = this.state;

    // collapse same folder
    if (expandedFolderId === folderItem.id) {
      this.setState({ expandedFolderId: undefined });
      return;
    }

    // load children first time
    if (!expandedChildren[folderItem.id] && folderItem.serverRelativeUrl) {
      const children = await this.dataProvider.getFolderChildren(
        this.props.functionDisplayName,
        folderItem.serverRelativeUrl
      );

      this.setState(prev => ({
        expandedFolderId: folderItem.id,
        expandedChildren: { ...prev.expandedChildren, [folderItem.id]: children }
      }));
    } else {
      this.setState({ expandedFolderId: folderItem.id });
    }
  };

  private handleSwitchFolderView = (folderId: string, mode: FolderViewMode): void => {
    this.setState(prev => ({ folderViewMode: { ...prev.folderViewMode, [folderId]: mode } }));
  };

  private onExportCsv = (): void => {
    // NOTE: Export logic is already inside ViewPageList.tsx (exportSelectedToCsv).
    // If later you want export button in parent, we can wire it here.
  };

  private renderTopBar(): React.ReactNode {
    return (
      <div className={view.topBar}>
        <p onClick={this.props.onBackToLanding}>
          <span
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: breadcrumbBeforeBackArrowSVG }}
            style={{ verticalAlign: 'sub' }}
          />
          <span>Back</span>
        </p>
        <p>|</p>
        <Breadcrumb items={this.state.breadcrumbs} className={view.breadStyle} />
        <div className={view.searchSlot} />
      </div>
    );
  }

  public render(): React.ReactElement<IPoliciesAndProceduresViewProps> {
    const { currentItems, selectedItem, expandedFolderId, expandedChildren, folderViewMode } = this.state;

    return (
      <section>
        {this.renderTopBar()}

        <div className={view.wrap}>
          <div className={view.left}>
            <PoliciesandProceduresList
              items={currentItems}
              activeId={selectedItem?.id}
              onOpenFile={this.handleOpenFile}
              onClearPreview={this.handleClearPreview}
              onToggleFolder={this.handleToggleFolder}
              expandedFolderId={expandedFolderId}
              expandedChildren={expandedChildren}
              onSwitchFolderView={this.handleSwitchFolderView}
              getFolderViewMode={(fid) => folderViewMode[fid] || 'list'}
            />
          </div>

          <div className={view.rightPane}>
            <PoliciesandProceduresPreview
              item={selectedItem}
              categoryTitle={this.props.functionDisplayName}
            />
          </div>
        </div>
      </section>
    );
  }
}
