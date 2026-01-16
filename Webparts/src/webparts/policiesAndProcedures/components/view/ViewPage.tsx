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

import { listServices } from '../../../services/listServices';

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

  // favourites (key = serverRelativeUrl lower)
  favouriteIndex: Record<string, number>;
};

export default class PoliciesAndProceduresView extends React.Component<
  IPoliciesAndProceduresViewProps,
  IPoliciesAndProceduresViewState
> {
  private dataProvider: IPoliciesAndProceduresDataProvider;

  constructor(props: IPoliciesAndProceduresViewProps) {
    super(props);

    // IMPORTANT: remove wrong hardcoded '/sites/Intranet/DMS'
    // fallback is computed from current web (same as Landing.tsx logic)
    const siteRel = props.context.pageContext.web.serverRelativeUrl || "";
    const base = siteRel === "/" ? "" : siteRel;
    const computedFallbackRoot = encodeURI(`${base}/GRC framework Documents`);

    this.dataProvider = props.useSharePointProvider
      ? new PoliciesAndProceduresSharePointProvider(
          props.context,
          props.dmsLibraryRoot || computedFallbackRoot
        )
      : new PoliciesAndProceduresDummyProvider();

    this.state = {
      breadcrumbs: [
        { key: 'bread-root', text: 'Policies & procedures' },
        { key: 'bread-function', text: props.functionDisplayName, isCurrentItem: true }
      ],
      currentItems: [],
      selectedItem: undefined, // do not auto preview
      expandedFolderId: undefined,
      expandedChildren: {},
      folderViewMode: {},
      favouriteIndex: {}
    };
  }

  public async componentDidMount(): Promise<void> {
    const svc = new listServices(this.props.context);

    const [rootItems, favouriteIndex] = await Promise.all([
      this.dataProvider.getRootItems(this.props.functionDisplayName),
      svc.getFavouriteIndex("Document Favourites") // expects serverRelativeUrl lower keys
    ]);

    this.setState({
      currentItems: rootItems,
      favouriteIndex
      // keep selectedItem undefined until user selects file
    });
  }

  private handleOpenFile = (fileItem: IPoliciesAndProceduresItem): void => {
    this.setState({ selectedItem: fileItem });
  };

  // clear preview when unselect happens
  private handleClearPreview = (): void => {
    this.setState({ selectedItem: undefined });
  };

  private handleToggleFavourite = async (file: IPoliciesAndProceduresItem): Promise<void> => {
    try {
      if (!file?.serverRelativeUrl) return;

      const svc = new listServices(this.props.context);

      const webAbs = this.props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
      const origin = new URL(webAbs).origin;
      const absoluteFileUrl = `${origin}${file.serverRelativeUrl}`;

      await svc.toggleFavourite(absoluteFileUrl, file.name, "Document Favourites");

      const favouriteIndex = await svc.getFavouriteIndex("Document Favourites");
      this.setState({ favouriteIndex });
    } catch (err) {
      // do not break UI
      // eslint-disable-next-line no-console
      console.error("toggle favourite failed", err);
    }
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
    const { currentItems, selectedItem, expandedFolderId, expandedChildren, folderViewMode, favouriteIndex } = this.state;

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

              // favourites wiring (this was missing)
              favouriteIndex={favouriteIndex}
              onToggleFavourite={this.handleToggleFavourite}
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
