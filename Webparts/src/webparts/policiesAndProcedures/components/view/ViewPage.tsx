import * as React from "react";
import { Breadcrumb, IBreadcrumbItem, SearchBox } from "@fluentui/react";
import type { WebPartContext } from "@microsoft/sp-webpart-base";
import view from "./ViewPage.module.scss";
import { breadcrumbBeforeBackArrowSVG } from "../../../assets/constants";

import PoliciesandProceduresList, { IPoliciesAndProceduresItem } from "./ViewPageList";
import PoliciesandProceduresPreview from "./ViewPagePreview";
import {
  IPoliciesAndProceduresDataProvider,
  PoliciesAndProceduresDummyProvider,
  PoliciesAndProceduresSharePointProvider
} from "../../../services/PoliciesAndProcedures/ViewPageLibraryService";

import { listServices } from "../../../services/listServices";
import PoliciesSearchService from "../../../services/PoliciesAndProcedures/PoliciesSearchService";

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

  searchText: string;
  autoExpandFolderIds: string[];
};

export default class PoliciesAndProceduresView extends React.Component<
  IPoliciesAndProceduresViewProps,
  IPoliciesAndProceduresViewState
> {
  private dataProvider: IPoliciesAndProceduresDataProvider;
  private readonly _libraryRoot: string;

  private readonly _searchSvc: PoliciesSearchService;
  private _searchTimer?: number;
  private _searchNonce: number = 0;

  constructor(props: IPoliciesAndProceduresViewProps) {
    super(props);

    const siteRel = props.context.pageContext.web.serverRelativeUrl || "";
    const base = siteRel === "/" ? "" : siteRel;
    const computedFallbackRoot = encodeURI(`${base}/GRC framework Documents`);
    this._libraryRoot = (props.dmsLibraryRoot || computedFallbackRoot).trim();

    this.dataProvider = props.useSharePointProvider
      ? new PoliciesAndProceduresSharePointProvider(props.context, this._libraryRoot)
      : new PoliciesAndProceduresDummyProvider();

    this._searchSvc = new PoliciesSearchService(props.context);

    this.state = {
      breadcrumbs: [
        { key: "bread-root", text: "Policies & procedures" },
        { key: "bread-function", text: props.functionDisplayName, isCurrentItem: true }
      ],
      currentItems: [],
      selectedItem: undefined,
      expandedChildren: {},
      folderViewMode: {},
      favouriteIndex: {},

      searchText: "",
      autoExpandFolderIds: []
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

  public componentWillUnmount(): void {
    if (this._searchTimer) window.clearTimeout(this._searchTimer);
    this._searchNonce++;
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
      const absoluteFileUrl = `${origin}${encodeURI(file.serverRelativeUrl)}`;
      await svc.toggleFavourite(absoluteFileUrl, file.name, "Document Favourites");

      const favouriteIndex = await svc.getFavouriteIndex("Document Favourites");
      this.setState({ favouriteIndex });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("toggle favourite failed", err);
    }
  };

  private handleEnsureFolderChildren = async (folderItem: IPoliciesAndProceduresItem): Promise<void> => {
    if (!folderItem?.id) return;

    // IMPORTANT: normalize key match (encoded/decoded)
    const folderKey = PoliciesSearchService.toKey(folderItem.id);

    // already loaded?
    const existingKey = Object.keys(this.state.expandedChildren).find(k => PoliciesSearchService.toKey(k) === folderKey);
    if (existingKey && this.state.expandedChildren[existingKey]) return;

    const serverRel = folderItem.serverRelativeUrl || folderItem.id;
    if (!serverRel) return;

    try {
      const children = await this.dataProvider.getFolderChildren(
        this.props.functionDisplayName,
        serverRel
      );

      // store using the ORIGINAL id string we received (so ViewPageList keys match)
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

  // ---------------- SEARCH ----------------
  private onSearchChange = (_?: any, value?: string): void => {
    const v = value ?? "";
    this.setState({ searchText: v });

    if (this._searchTimer) window.clearTimeout(this._searchTimer);

    const q = v.trim();
    if (!q) {
      this._searchNonce++;
      this.setState({ autoExpandFolderIds: [] });
      return;
    }

    this._searchTimer = window.setTimeout(() => {
      void this.runDeepSearch(q);
    }, 250);
  };

  private async runDeepSearch(query: string): Promise<void> {
    const nonce = ++this._searchNonce;

    try {
      const hits = await this._searchSvc.searchFilesInFunction(
        this._libraryRoot,
        this.props.functionDisplayName,
        query,
        100
      );

      if (nonce !== this._searchNonce) return;

      const fnRootRel = PoliciesSearchService.buildFunctionRootRel(
        this._libraryRoot,
        this.props.functionDisplayName
      );

      // Deduplicate folders by normalized key, but keep display id string (decoded)
      const folderByKey = new Map<string, string>();

      for (const f of hits) {
        const fileRel = (f.serverRelativeUrl || "").trim();
        if (!fileRel) continue;

        const chain = PoliciesSearchService.getFolderChainFromFile(fileRel, fnRootRel);
        for (const id of chain) {
          folderByKey.set(PoliciesSearchService.toKey(id), id);
        }
      }

      const ordered = Array.from(folderByKey.values()).sort((a, b) => a.length - b.length);

      // Load children in chain order so nested folders exist in UI
      for (const folderRel of ordered) {
        if (nonce !== this._searchNonce) return;

        const stubFolder: IPoliciesAndProceduresItem = {
          id: folderRel,
          name: "",
          isFolder: true,
          serverRelativeUrl: folderRel
        };

        await this.handleEnsureFolderChildren(stubFolder);
      }

      if (nonce !== this._searchNonce) return;

      this.setState({ autoExpandFolderIds: ordered });
    } catch (e) {
      if (nonce !== this._searchNonce) return;
      // eslint-disable-next-line no-console
      console.error("deep search failed", e);
      this.setState({ autoExpandFolderIds: [] });
    }
  }

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

        <div className={view.searchSlot}>
          <SearchBox
            className={view.searchBox}
            placeholder="Search Documents"
            value={this.state.searchText}
            onChange={this.onSearchChange}
            onClear={() => this.onSearchChange(undefined, "")}
          />
        </div>
      </div>
    );
  }

  public render(): React.ReactElement<IPoliciesAndProceduresViewProps> {
    const {
      currentItems,
      selectedItem,
      expandedChildren,
      folderViewMode,
      favouriteIndex,
      searchText,
      autoExpandFolderIds
    } = this.state;

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
              searchText={searchText}
              autoExpandFolderIds={autoExpandFolderIds}
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
