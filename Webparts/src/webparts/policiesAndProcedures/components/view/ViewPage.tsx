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
      ? new PoliciesAndProceduresSharePointProvider(props.context, props.dmsLibraryRoot || '/sites/Intranet/DMS')
      : new PoliciesAndProceduresDummyProvider();

    this.state = {
      breadcrumbs: [
        { key: 'bread-root', text: 'Policies & procedures' },
        { key: 'bread-function', text: props.functionDisplayName, isCurrentItem: true }
      ],
      currentItems: [],
      expandedChildren: {},
      folderViewMode: {}
    };
  }

  async componentDidMount(): Promise<void> {
    const rootItems = await this.dataProvider.getRootItems(this.props.functionDisplayName);
    this.setState({
      currentItems: rootItems,
      selectedItem: rootItems.find(item => !item.isFolder)
    });
  }

  private handleOpenFile = (fileItem: IPoliciesAndProceduresItem): void =>
    this.setState({ selectedItem: fileItem });

  private handleToggleFolder = async (folderItem: IPoliciesAndProceduresItem): Promise<void> => {
    const { expandedFolderId, expandedChildren } = this.state;

    if (expandedFolderId === folderItem.id) {
      this.setState({ expandedFolderId: undefined });
      return;
    }

    if (!expandedChildren[folderItem.id] && folderItem.serverRelativeUrl) {
      const children = await this.dataProvider.getFolderChildren(this.props.functionDisplayName, folderItem.serverRelativeUrl);
      this.setState(prev => ({
        expandedFolderId: folderItem.id,
        expandedChildren: { ...prev.expandedChildren, [folderItem.id]: children },
      }));
    } else {
      this.setState({ expandedFolderId: folderItem.id });
    }
  };

  private handleSwitchFolderView = (folderId: string, mode: FolderViewMode): void => {
    this.setState(prev => ({ folderViewMode: { ...prev.folderViewMode, [folderId]: mode } }));
  };

  private renderTopBar(): React.ReactNode {
    return (
      <div className={view.topBar}>
        <button className={view.backBtn} onClick={this.props.onBackToLanding} aria-label="Back" title="Back">
          <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: breadcrumbBeforeBackArrowSVG }} />
          <span>Back</span>
        </button>
        <Breadcrumb items={this.state.breadcrumbs} />
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
              onToggleFolder={this.handleToggleFolder}
              expandedFolderId={expandedFolderId}
              expandedChildren={expandedChildren}
              onSwitchFolderView={this.handleSwitchFolderView}
              getFolderViewMode={(fid) => folderViewMode[fid] || 'list'}
            />
          </div>

          <div className={view.rightPane}>
            <PoliciesandProceduresPreview item={selectedItem} categoryTitle={this.props.functionDisplayName} />
          </div>
        </div>
      </section>
    );
  }
}
