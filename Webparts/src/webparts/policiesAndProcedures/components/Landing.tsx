import * as React from 'react';
import { SearchBox, MessageBar, MessageBarType, DefaultButton } from '@fluentui/react';
import styles from './PoliciesAndProcedures.module.scss';
import Tiles from './Tiles';
import Boards from './Boards';

import PoliciesandProceduresView from './view/ViewPage';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { listServices, DocumentFunctionRow } from '../../services/listServices';
import { ListName } from '../../services/Constants';

// ✅ Shared shimmer wrapper
import { LoadingBoundary } from '../../Components/LoadingShimmer';

export interface ILandingProps { title: string; context: WebPartContext; }

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

  // ✅ shimmer control
  loadingCards: boolean;
  errorCards: string | null;
}

export default class Landing extends React.Component<ILandingProps, LandingViewState> {
  public state: LandingViewState = {
    searchText: '',
    coreFunctionCards: [],
    supportFunctionCards: [],
    loadingCards: true,
    errorCards: null
  };

  private handleSearchInputChange = (_?: any, newValue?: string): void =>
    this.setState({ searchText: newValue || '' });

  public async componentDidMount(): Promise<void> {
    await this.loadCards();
  }

  private loadCards = async (): Promise<void> => {
    this.setState({ loadingCards: true, errorCards: null });

    try {
      const svc = new listServices(this.props.context);
      const functionDirectory: DocumentFunctionRow[] =
        await svc.getDocumentFunctions(ListName.DOCUMENT_FUNCTION);

      const coreFunctionCards: FunctionCategory[] = functionDirectory
        .filter(row => (row.functionType || '').toLowerCase() === 'core function')
        .map(row => ({
          key: String(row.id),
          title: row.title,
          imageSrc: row.iconUrl,
          href: row.targetUrl
        }));

      const supportFunctionCards: SupportDepartment[] = functionDirectory
        .filter(row => (row.functionType || '').toLowerCase() === 'support function')
        .map(row => ({
          key: String(row.id),
          title: row.title,
          iconSrc: row.iconUrl || '',
          href: row.targetUrl
        }));

      this.setState({ coreFunctionCards, supportFunctionCards, loadingCards: false });
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

  private closeFunctionDetailView = (): void =>
    this.setState({ activeFunctionName: undefined });

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

    const showShimmer = loadingCards || !!errorCards;

    return (
      <div className={styles.page}>
        {/* Error bar (optional) */}
        {errorCards ? (
          <div style={{ marginBottom: 10 }}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
              {errorCards}
              <span style={{ marginLeft: 10 }}>
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

        {/* ✅ Shimmer wraps the cards loader */}
        <LoadingBoundary loading={showShimmer} preset={"card" as any} count={10} ariaLabel="Loading cards">
          <>
            <Tiles
              variant="core"
              categories={coreFunctionCards}
              departments={[]}
              searchText={searchText}
              onOpenFunctionView={this.showFunctionDetailView}
            />

            <div className={styles.homeTopRow}>
              <div className={styles.sectionHeading}>Support Function</div>
            </div>

            <Tiles
              variant="support"
              categories={[]}
              departments={supportFunctionCards}
              searchText={searchText}
              onOpenFunctionView={this.showFunctionDetailView}
            />

            <Boards
              context={this.props.context}
              favouritesCount={10}
              dmsLibraryRoot={this.getDmsLibraryRoot()}
            />
          </>
        </LoadingBoundary>
      </div>
    );
  }
}
