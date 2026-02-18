import * as React from "react";
import {
  SearchBox,
  MessageBar,
  MessageBarType,
  DefaultButton
} from "@fluentui/react";
import type { WebPartContext } from "@microsoft/sp-webpart-base";

import styles from "./PoliciesAndProcedures.module.scss";
import Tiles from "./Tiles";
import Boards from "./Boards";

import PoliciesandProceduresView from "./view/ViewPage";
import { listServices, DocumentFunctionRow } from "../../services/listServices";
import { ListName } from "../../services/Constants";

// ✅ Shared shimmer wrapper
import { LoadingBoundary } from "../../Components/LoadingShimmer";

export interface ILandingProps {
  title: string;
  context: WebPartContext;
}

export interface FunctionCategory {
  key: string;
  title: string;
  imageSrc?: string;
  svgSrc?: string;
  svgMarkup?: string;
  href?: string;
}

export interface SupportDepartment {
  key: string;
  title: string;
  iconSrc: string;
  href?: string;
}

interface LandingViewState {
  searchText: string;
  coreFunctionCards: FunctionCategory[];
  supportFunctionCards: SupportDepartment[];
  activeFunctionName?: string;

  // ✅ shimmer + error
  loadingCards: boolean;
  errorCards: string | null;
}

export default class Landing extends React.Component<ILandingProps, LandingViewState> {
  public state: LandingViewState = {
    searchText: "",
    coreFunctionCards: [],
    supportFunctionCards: [],
    loadingCards: true,
    errorCards: null
  };

  private handleSearchInputChange = (_?: any, newValue?: string): void =>
    this.setState({ searchText: newValue || "" });

  public async componentDidMount(): Promise<void> {
    await this.loadCards();
  }

  private loadCards = async (): Promise<void> => {
    this.setState({ loadingCards: true, errorCards: null });

    try {
      const svc = new listServices(this.props.context);
      const functionDirectory: DocumentFunctionRow[] =
        (await svc.getDocumentFunctions(ListName.DOCUMENT_FUNCTION)) || [];

      const coreFunctionCards: FunctionCategory[] = functionDirectory
        .filter((row) => (row.functionType || "").toLowerCase() === "core function")
        .map((row) => ({
          key: String(row.id),
          title: row.title,
          imageSrc: row.iconUrl,
          href: row.targetUrl
        }));

      const supportFunctionCards: SupportDepartment[] = functionDirectory
        .filter((row) => (row.functionType || "").toLowerCase() === "support function")
        .map((row) => ({
          key: String(row.id),
          title: row.title,
          iconSrc: row.iconUrl || "",
          href: row.targetUrl
        }));

      this.setState({
        coreFunctionCards,
        supportFunctionCards,
        loadingCards: false
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("Landing cards fetch failed:", e);

      this.setState({
        coreFunctionCards: [],
        supportFunctionCards: [],
        loadingCards: false,
        errorCards: e?.message || "Failed to fetch"
      });
    }
  };

  private showFunctionDetailView = (functionDisplayName: string): void => {
    this.setState({ activeFunctionName: functionDisplayName });
  };

  private closeFunctionDetailView = (): void => {
    this.setState({ activeFunctionName: undefined });
  };

  private getDmsLibraryRoot(): string {
    const siteRel = this.props.context.pageContext.web.serverRelativeUrl || "";
    const base = siteRel === "/" ? "" : siteRel;
    return encodeURI(`${base}/GRC framework Documents`);
  }

  public render(): React.ReactElement<ILandingProps> {
    const {
      searchText,
      coreFunctionCards,
      supportFunctionCards,
      activeFunctionName,
      loadingCards,
      errorCards
    } = this.state;

    if (activeFunctionName) {
      return (
        <PoliciesandProceduresView
          context={this.props.context}
          functionDisplayName={activeFunctionName}
          onBackToLanding={this.closeFunctionDetailView}
          useSharePointProvider={true}
          dmsLibraryRoot={this.getDmsLibraryRoot()}
        />
      );
    }

    const coreLoading = loadingCards || (!!errorCards && coreFunctionCards.length === 0);
    const supportLoading = loadingCards || (!!errorCards && supportFunctionCards.length === 0);

    return (
      <div className={styles.page}>
        {errorCards ? (
          <div className={styles.errorBarWrap}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
              {errorCards}
              <span className={styles.errorBarActions}>
                <DefaultButton text="Retry" onClick={this.loadCards} />
              </span>
            </MessageBar>
          </div>
        ) : null}

        <div className={styles.homeTopRow}>
          <div className={styles.sectionHeading}>Core Function</div>
          <div className={styles.searchHome}>
            <SearchBox placeholder="Search Documents" onChange={this.handleSearchInputChange} />
          </div>
        </div>

        {/* ✅ Core cards shimmer */}
        <LoadingBoundary
          loading={coreLoading}
          preset={"card" as any}
          count={6}
          ariaLabel="Loading core function cards"
        >
          <Tiles
            variant="core"
            categories={coreFunctionCards}
            departments={[]}
            searchText={searchText}
            onOpenFunctionView={this.showFunctionDetailView}
          />
        </LoadingBoundary>

        <div className={styles.homeTopRow}>
          <div className={styles.sectionHeading}>Support Function</div>
        </div>

        {/* ✅ Support cards shimmer */}
        <LoadingBoundary
          loading={supportLoading}
          preset={"card" as any}
          count={6}
          ariaLabel="Loading support function cards"
        >
          <Tiles
            variant="support"
            categories={[]}
            departments={supportFunctionCards}
            searchText={searchText}
            onOpenFunctionView={this.showFunctionDetailView}
          />
        </LoadingBoundary>

        <Boards
          context={this.props.context}
          favouritesCount={10}
          dmsLibraryRoot={this.getDmsLibraryRoot()}
        />
      </div>
    );
  }
}
