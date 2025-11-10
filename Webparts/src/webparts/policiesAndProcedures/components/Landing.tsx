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

export interface CategoryItem {
  key: string;
  title: string;
  imageSrc?: string;
  svgSrc?: string;
  svgMarkup?: string;
  href?: string;
}
export interface DepartmentItem {
  key: string;
  title: string;
  iconSrc: string;
  href?: string;
}

interface LandingState {
  searchQuery: string;
  coreFunctionTiles: CategoryItem[];
  supportFunctionTiles: DepartmentItem[];
  activeFunctionDisplayName?: string;
}

export default class Landing extends React.Component<ILandingProps, LandingState> {
  public state: LandingState = { searchQuery: '', coreFunctionTiles: [], supportFunctionTiles: [] };

  private handleSearchChange = (_?: any, newValue?: string): void =>
    this.setState({ searchQuery: newValue || '' });

  public async componentDidMount(): Promise<void> {
    const service = new listServices(this.props.context);
    const functionRows: DocumentFunctionRow[] = await service.getDocumentFunctions(ListName.DOCUMENT_FUNCTION);

    const coreTiles = functionRows
      .filter(row => (row.functionType || '').toLowerCase() === 'core function')
      .map(row => ({ key: String(row.id), title: row.title, imageSrc: row.iconUrl, href: row.targetUrl } as CategoryItem));

    const supportTiles = functionRows
      .filter(row => (row.functionType || '').toLowerCase() === 'support function')
      .map(row => ({ key: String(row.id), title: row.title, iconSrc: row.iconUrl || '', href: row.targetUrl } as DepartmentItem));

    this.setState({ coreFunctionTiles: coreTiles, supportFunctionTiles: supportTiles });
  }

  private openFunctionView = (functionDisplayName: string): void =>
    this.setState({ activeFunctionDisplayName: functionDisplayName });

  private exitFunctionView = (): void =>
    this.setState({ activeFunctionDisplayName: undefined });

  public render(): React.ReactElement<ILandingProps> {
    const { searchQuery, coreFunctionTiles, supportFunctionTiles, activeFunctionDisplayName } = this.state;

    if (activeFunctionDisplayName) {
      return (
        <PoliciesandProceduresView
          context={this.props.context}
          functionDisplayName={activeFunctionDisplayName}
          onBackToLanding={this.exitFunctionView}
          // Turn these on in client env:
          // useSharePointProvider
          // dmsLibraryRoot="/sites/Intranet/DMS"
        />
      );
    }

    return (
      <div className={styles.page}>
        <div className={styles.homeTopRow}>
          <div className={styles.sectionHeading}>Core Function</div>
          <div className={styles.searchHome}>
            <SearchBox placeholder="Search Documents" onChange={this.handleSearchChange} />
          </div>
        </div>

        <Tiles
          variant="core"
          categories={coreFunctionTiles}
          departments={[]}
          searchText={searchQuery}
          onOpen={this.openFunctionView}
        />

        <div className={styles.sectionHeading} style={{ marginTop: 12 }}>Support Function</div>
        <Tiles
          variant="support"
          categories={[]}
          departments={supportFunctionTiles}
          searchText={searchQuery}
          onOpen={this.openFunctionView}
        />

        <div style={{ marginTop: 18 }} />
        <Boards
          // Flip these ON in client env when DMS/search must be live:
          // useSharePointProvider={true}
          // dmsLibraryRoot="/sites/Intranet/DMS"
          context={this.props.context}
        />
      </div>
    );
  }
}
