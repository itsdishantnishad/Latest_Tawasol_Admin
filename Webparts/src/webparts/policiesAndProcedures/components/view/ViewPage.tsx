import * as React from "react";
import {
  Breadcrumb,
  IBreadcrumbItem,
  SearchBox,
  MessageBar,
  MessageBarType,
  DefaultButton
} from "@fluentui/react";
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

// ✅ Shared shimmer wrapper
import { LoadingBoundary } from "../../../Components/LoadingShimmer";

export interface IPoliciesAndProceduresViewProps {
  context: WebPartContext;
  functionDisplayName: string;
  onBackToLanding: () => void;
  useSharePointProvider?: boolean;
  dmsLibraryRoot?: string;
}

type FolderViewMode = "list" | "grid";
type SearchState = "idle" | "loading" | "done" | "error";

type IPoliciesAndProceduresViewState = {
  breadcrumbs: IBreadcrumbItem[];
  currentItems: IPoliciesAndProceduresItem[];
  selectedItem?: IPoliciesAndProceduresItem;
  expandedChildren: Record<string, IPoliciesAndProceduresItem[]>;
  folderViewMode: Record<string, FolderViewMode>;
  favouriteIndex: Record<string, number>;
  searchResults: IPoliciesAndProceduresItem[];
  searchText: string;
  autoExpandFolderIds: string[];
  searchState: SearchState;

  // ✅ shimmer control for initial load
  initialLoading: boolean;
  initialError: string | null;
};

export default class PoliciesAndProceduresView extends React.Component<
  IPoliciesAndProceduresViewProps,
  IPoliciesAndProceduresViewState
> {
  private dataProvider: IPoliciesAndProceduresDataProvider;
  private readonly _libraryRoot: string;

  private readonly _searchService: PoliciesSearchService;
  private _searchTimerId?: number;
  private _searchNonce: number = 0;

  constructor(props: IPoliciesAndProceduresViewProps) {
    super(props);

    const siteRelativeUrl = props.context.pageContext.web.serverRelativeUrl || "";
    const siteBase = siteRelativeUrl === "/" ? "" : siteRelativeUrl;
    const computedFallbackRoot = encodeURI(`${siteBase}/GRC framework Documents`);
    this._libraryRoot = (props.dmsLibraryRoot || computedFallbackRoot).trim();

    this.dataProvider = props.useSharePointProvider
      ? new PoliciesAndProceduresSharePointProvider(props.context, this._libraryRoot)
      : new PoliciesAndProceduresDummyProvider();

    this._searchService = new PoliciesSearchService(props.context);

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
      searchResults: [],
      searchText: "",
      autoExpandFolderIds: [],
      searchState: "idle",

      // ✅ initial shimmer state
      initialLoading: true,
      initialError: null
    };
  }

  public async componentDidMount(): Promise<void> {
    await this.loadInitial();
  }

  private loadInitial = async (): Promise<void> => {
    this.setState({ initialLoading: true, initialError: null });

    try {
      const listService = new listServices(this.props.context);

      const [rootItems, favouriteIndex] = await Promise.all([
        this.dataProvider.getRootItems(this.props.functionDisplayName),
        listService.getFavouriteIndex("Document Favourites")
      ]);

      this.setState({
        currentItems: rootItems,
        favouriteIndex,
        initialLoading: false
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("ViewPage initial load failed:", e);

      this.setState({
        currentItems: [],
        favouriteIndex: {},
        initialLoading: false,
        initialError: e?.message || "Failed to fetch"
      });
    }
  };

  public componentWillUnmount(): void {
    if (this._searchTimerId) window.clearTimeout(this._searchTimerId);
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

      const listService = new listServices(this.props.context);

      const webAbsoluteUrl = this.props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
      const siteOrigin = new URL(webAbsoluteUrl).origin;

      let rel = (file.serverRelativeUrl || "").trim();
      try { rel = decodeURI(rel); } catch {}
      const favKey = listServices
        .convertToRelativeUrl(`${siteOrigin}${encodeURI(file.serverRelativeUrl)}`)
        .toLowerCase();

      this.setState((prev) => {
        const next = { ...prev.favouriteIndex };
        if (typeof next[favKey] !== "undefined") delete next[favKey];
        else next[favKey] = 1;
        return { favouriteIndex: next };
      });

      const absoluteFileUrl = `${siteOrigin}${encodeURI(file.serverRelativeUrl)}`;
      await listService.toggleFavourite(absoluteFileUrl, file.name, undefined, undefined, "Document Favourites");

      const updatedFavouriteIndex = await listService.getFavouriteIndex("Document Favourites");
      this.setState({ favouriteIndex: updatedFavouriteIndex });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("toggle favourite failed", error);

      try {
        const listService = new listServices(this.props.context);
        const updatedFavouriteIndex = await listService.getFavouriteIndex("Document Favourites");
        this.setState({ favouriteIndex: updatedFavouriteIndex });
      } catch {}
    }
  };

  private handleEnsureFolderChildren = async (folderItem: IPoliciesAndProceduresItem): Promise<void> => {
    if (!folderItem?.id) return;

    const normalizedFolderKey = PoliciesSearchService.toKey(folderItem.id);

    const existingKey = Object.keys(this.state.expandedChildren).find(
      (storedKey) => PoliciesSearchService.toKey(storedKey) === normalizedFolderKey
    );
    if (existingKey && this.state.expandedChildren[existingKey]) return;

    const folderServerRelativeUrl = folderItem.serverRelativeUrl || folderItem.id;
    if (!folderServerRelativeUrl) return;

    try {
      const childItems = await this.dataProvider.getFolderChildren(
        this.props.functionDisplayName,
        folderServerRelativeUrl
      );

      this.setState((previous) => ({
        expandedChildren: { ...previous.expandedChildren, [folderItem.id]: childItems }
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("load folder children failed", error);
    }
  };

  private handleSwitchFolderView = (folderId: string, mode: FolderViewMode): void => {
    this.setState((previous) => ({
      folderViewMode: { ...previous.folderViewMode, [folderId]: mode }
    }));
  };

  // ---------------- SEARCH ----------------
  private onSearchChange = (_?: any, value?: string): void => {
    const searchTextRaw = value ?? "";
    this.setState({ searchText: searchTextRaw });

    if (this._searchTimerId) window.clearTimeout(this._searchTimerId);

    const searchTextTrimmed = searchTextRaw.trim();

    if (!searchTextTrimmed) {
      this._searchNonce++;
      this.setState({
        autoExpandFolderIds: [],
        searchResults: [],
        searchState: "idle"
      });
      return;
    }

    this.setState({ searchState: "loading" });

    this._searchTimerId = window.setTimeout(() => {
      void this.runDeepSearch(searchTextTrimmed);
    }, 250);
  };

  private async runDeepSearch(searchTextTrimmed: string): Promise<void> {
    const currentRequestNonce = ++this._searchNonce;

    try {
      const matchingFiles = await this._searchService.searchFilesInFunction(
        this._libraryRoot,
        this.props.functionDisplayName,
        searchTextTrimmed,
        100
      );

      if (currentRequestNonce !== this._searchNonce) return;

      const functionRootServerRelativeUrl = PoliciesSearchService.buildFunctionRootRel(
        this._libraryRoot,
        this.props.functionDisplayName
      );

      const folderPathByNormalizedKey = new Map<string, string>();

      for (const fileItem of matchingFiles) {
        const fileServerRelativeUrl = (fileItem.serverRelativeUrl || "").trim();
        if (!fileServerRelativeUrl) continue;

        const folderChain = PoliciesSearchService.getFolderChainFromFile(
          fileServerRelativeUrl,
          functionRootServerRelativeUrl
        );

        for (const folderServerRelativePath of folderChain) {
          folderPathByNormalizedKey.set(
            PoliciesSearchService.toKey(folderServerRelativePath),
            folderServerRelativePath
          );
        }
      }

      const foldersToExpandOrdered = Array.from(folderPathByNormalizedKey.values()).sort(
        (leftPath, rightPath) => leftPath.length - rightPath.length
      );

      for (const folderServerRelativePath of foldersToExpandOrdered) {
        if (currentRequestNonce !== this._searchNonce) return;

        const stubFolder: IPoliciesAndProceduresItem = {
          id: folderServerRelativePath,
          name: "",
          isFolder: true,
          serverRelativeUrl: folderServerRelativePath
        };

        await this.handleEnsureFolderChildren(stubFolder);
      }

      if (currentRequestNonce !== this._searchNonce) return;

      this.setState({
        autoExpandFolderIds: foldersToExpandOrdered,
        searchState: "done"
      });
    } catch (error) {
      if (currentRequestNonce !== this._searchNonce) return;

      // eslint-disable-next-line no-console
      console.error("deep search failed", error);

      this.setState({
        autoExpandFolderIds: [],
        searchState: "error"
      });
    }
  }

  private renderTopBar(): React.ReactNode {
    return (
      <div className={view.topBar}>
        <div className={view.topBarLeft}>
          <p className={view.backLink} onClick={this.props.onBackToLanding}>
            <span
              className={view.backIcon}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: breadcrumbBeforeBackArrowSVG }}
            />
            <span>Back</span>
          </p>

          <span className={view.topBarDivider} aria-hidden="true">
            |
          </span>

          <Breadcrumb items={this.state.breadcrumbs} className={view.breadStyle} />
        </div>

        <div className={view.searchSlot}>
          <SearchBox
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
      autoExpandFolderIds,
      searchState,
      initialLoading,
      initialError
    } = this.state;

    const showShimmer = initialLoading || !!initialError;

    return (
      <section>
        {this.renderTopBar()}

        {/* Error bar */}
        {initialError ? (
          <div style={{ marginTop: 10 }}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
              {initialError}
              <span style={{ marginLeft: 10 }}>
                <DefaultButton text="Retry" onClick={this.loadInitial} />
              </span>
            </MessageBar>
          </div>
        ) : null}

        {/* ✅ Shimmer wraps the whole view content */}
        <LoadingBoundary loading={showShimmer} preset={"details" as any} count={1} ariaLabel="Loading documents">
          {initialError && currentItems.length === 0 ? (
            <div style={{ minHeight: 420 }} />
          ) : (
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
                  getFolderViewMode={(folderId) => folderViewMode[folderId] || "list"}
                  favouriteIndex={favouriteIndex}
                  onToggleFavourite={this.handleToggleFavourite}
                  dmsLibraryRoot={this._libraryRoot}
                  searchText={searchText}
                  autoExpandFolderIds={autoExpandFolderIds}
                  searchState={searchState}
                />
              </div>

              <div className={view.rightPane}>
                <PoliciesandProceduresPreview
                  item={selectedItem}
                  categoryTitle={this.props.functionDisplayName}
                />
              </div>
            </div>
          )}
        </LoadingBoundary>
      </section>
    );
  }
}
