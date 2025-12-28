

import * as React from 'react';
import { SearchBox } from '@fluentui/react';
import styles from './PoliciesAndProcedures.module.scss';
import Tiles from './Tiles';
import Boards from './Boards';

import PoliciesandProceduresView from './view/ViewPage';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { listServices, DocumentFunctionRow } from '../../services/listServices';
import { ListName } from '../../services/Constants';

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
}

export default class Landing extends React.Component<ILandingProps, LandingViewState> {
  public state: LandingViewState = {
    searchText: '',
    coreFunctionCards: [],
    supportFunctionCards: []
  };

  private handleSearchInputChange = (_?: any, newValue?: string): void =>
    this.setState({ searchText: newValue || '' });

  public async componentDidMount(): Promise<void> {
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

    this.setState({ coreFunctionCards, supportFunctionCards });
  }

  private showFunctionDetailView = (functionDisplayName: string): void => {
    this.setState({ activeFunctionName: functionDisplayName });
  };

  private closeFunctionDetailView = (): void =>
    this.setState({ activeFunctionName: undefined });

  private getDmsLibraryRoot(): string {
    // ✅ your library is: /sites/TawasolBETA/GRC framework Documents
    const siteRel = this.props.context.pageContext.web.serverRelativeUrl || '';
    const base = siteRel === '/' ? '' : siteRel;
    return `${base}/GRC framework Documents`;
  }

  public render(): React.ReactElement<ILandingProps> {
    const { searchText, coreFunctionCards, supportFunctionCards, activeFunctionName } = this.state;

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

    return (
      <div className={styles.page}>
        <div className={styles.homeTopRow}>
          <div className={styles.sectionHeading}>Core Function</div>
          <div className={styles.searchHome}>
            <SearchBox placeholder="Search Documents" onChange={this.handleSearchInputChange} />
          </div>
        </div>

        <Tiles
          variant="core"
          categories={coreFunctionCards}
          departments={[]}
          searchText={searchText}
          onOpenFunctionView={this.showFunctionDetailView}
        />

        <div className={styles.sectionHeading} style={{ marginTop: 12 }}>Support Function</div>
        <Tiles
          variant="support"
          categories={[]}
          departments={supportFunctionCards}
          searchText={searchText}
          onOpenFunctionView={this.showFunctionDetailView}
        />

        <Boards context={this.props.context} />
      </div>
    );
  }
}
