import * as React from "react";
import { Breadcrumb, IBreadcrumbItem } from "@fluentui/react";
import type { WebPartContext } from "@microsoft/sp-webpart-base";
import view from "./ViewPage.module.scss";
import { breadcrumbBeforeBackArrowSVG } from "../../../assets/constants";

import PoliciesandProceduresList, { IPoliciesAndProceduresItem } from "./ViewPageList";
import PoliciesandProceduresPreview from "./ViewPagePreview";
import {
  IPoliciesAndProceduresDataProvider,
  PoliciesAndProceduresDummyProvider,
  PoliciesAndProceduresSharePointProvider
} from "./ViewPageDataProvider";

import { listServices } from "../../../services/listServices";

export interface IPoliciesAndProceduresViewProps {
  context: WebPartContext;
  functionDisplayName: string;
  onBackToLanding: () => void;
  useSharePointProvider?: boolean;
  dmsLibraryRoot?: string;
}

type FolderViewMode = "list" | "grid";

type IPoliciesAndProceduresViewState = {
  breadcrumbs: IBreadcrumbItem[];
  currentItems: IPoliciesAndProceduresItem[];
  selectedItem?: IPoliciesAndProceduresItem;
  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;
  folderViewMode: Record<string, FolderViewMode>;
  favouriteIndex: Record<string, number>;
};

export default class PoliciesAndProceduresView extends React.Component<
  IPoliciesAndProceduresViewProps,
  IPoliciesAndProceduresViewState
> {
  private dataProvider: IPoliciesAndProceduresDataProvider;
  private readonly _libraryRoot: string;

  constructor(props: IPoliciesAndProceduresViewProps) {
    super(props);
    const siteRel = props.context.pageContext.web.serverRelativeUrl || "";
    const base = siteRel === "/" ? "" : siteRel;
    const computedFallbackRoot = encodeURI(`${base}/GRC framework Documents`);
    this._libraryRoot = (props.dmsLibraryRoot || computedFallbackRoot).trim();
    this.dataProvider = props.useSharePointProvider
      ? new PoliciesAndProceduresSharePointProvider(props.context, this._libraryRoot)
      : new PoliciesAndProceduresDummyProvider();

    this.state = {
      breadcrumbs: [
        { key: "bread-root", text: "Policies & procedures" },
        { key: "bread-function", text: props.functionDisplayName, isCurrentItem: true }
      ],
      currentItems: [],
      selectedItem: undefined,
      expandedChildren: {},
      folderViewMode: {},
      favouriteIndex: {}
    };
  }

  public async componentDidMount(): Promise<void> {
    const svc = new listServices(this.props.context);
    const [rootItems, favouriteIndex] = await Promise.all([
      this.dataProvider.getRootItems(this.props.functionDisplayName),
      svc.getFavouriteIndex("Document Favourites")
    ]);

    this.setState({
      currentItems: rootItems,
      favouriteIndex
    });
  }

  private handleOpenFile = (fileItem: IPoliciesAndProceduresItem): void => {
    this.setState({ selectedItem: fileItem });
  };

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
      // eslint-disable-next-line no-console
      console.error("toggle favourite failed", err);
    }
  };

  /**
   * IMPORTANT: Multi-expand is controlled by ViewPageList.tsx.
   * Parent only ensures children are loaded once per folderId.
   */
  private handleEnsureFolderChildren = async (folderItem: IPoliciesAndProceduresItem): Promise<void> => {
    if (!folderItem?.id) return;
    if (this.state.expandedChildren[folderItem.id]) return; // already loaded
    if (!folderItem.serverRelativeUrl) return;

    try {
      const children = await this.dataProvider.getFolderChildren(
        this.props.functionDisplayName,
        folderItem.serverRelativeUrl
      );

      this.setState(prev => ({
        expandedChildren: { ...prev.expandedChildren, [folderItem.id]: children }
      }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("load folder children failed", err);
    }
  };

  private handleSwitchFolderView = (folderId: string, mode: FolderViewMode): void => {
    this.setState(prev => ({ folderViewMode: { ...prev.folderViewMode, [folderId]: mode } }));
  };

  private renderTopBar(): React.ReactNode {
    return (
      <div className={view.topBar}>
        <p onClick={this.props.onBackToLanding}>
          <span
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: breadcrumbBeforeBackArrowSVG }}
            style={{ verticalAlign: "sub" }}
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
    const { currentItems, selectedItem, expandedChildren, folderViewMode, favouriteIndex } = this.state;

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
              onToggleFolder={this.handleEnsureFolderChildren}
              expandedChildren={expandedChildren}
              onSwitchFolderView={this.handleSwitchFolderView}
              getFolderViewMode={(fid) => folderViewMode[fid] || "list"}
              favouriteIndex={favouriteIndex}
              onToggleFavourite={this.handleToggleFavourite}
              dmsLibraryRoot={this._libraryRoot}
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
