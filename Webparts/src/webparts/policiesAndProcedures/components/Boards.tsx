import * as React from 'react';
import styles from './PoliciesAndProcedures.module.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { listServices, DocumentSummary } from '../../services/listServices';

type BoardItem = DocumentSummary;

interface IBoardsProps {
  /** Pass context to enable live SharePoint data. If omitted, component shows placeholders. */
  context?: WebPartContext;

  /** Force using SharePoint provider (default: auto = true when context exists) */
  useSharePointProvider?: boolean;

  /** DMS library root (server-relative path). Example: "/sites/Intranet/DMS" */
  dmsLibraryRoot?: string;

  /** How many items to show in "Recently Updated" (default 6) */
  recentlyCount?: number;

  /** How many items to show in "Most Used in DHRE" (default 6) */
  mostUsedCount?: number;
}

interface IBoardsState {
  loading: boolean;
  recently: BoardItem[];
  mostUsed: BoardItem[];
  favourites: BoardItem[];
}

export default class Boards extends React.Component<IBoardsProps, IBoardsState> {
  public state: IBoardsState = {
    loading: true,
    recently: [],
    mostUsed: [],
    favourites: []
  };

  private _mounted = false;

  public async componentDidMount(): Promise<void> {
    this._mounted = true;

    // Dummy favourites (until Like feature is wired)
    const dummyFavs: BoardItem[] = [
      { id: 'f1', name: 'Performance Management',                   ext: 'docx', tag: 'Documents',          dept: 'GRC' },
      { id: 'f2', name: 'Addendum to HC Policy Manual Reference….', ext: 'pptx', tag: 'Awareness Sessions', dept: 'GRC' },
      { id: 'f3', name: 'Addendum to HC Policy Manual Reference….', ext: 'pdf',  tag: 'Forms',              dept: 'GRC' },
    ];

    const placeholders = Array.from({ length: 6 }).map((_, i) => ({
      id: `p${i}`, name: `Sample document ${i + 1}.pdf`, dept: 'GRC'
    }));

    const recentlyCount = this.props.recentlyCount ?? 6;
    const mostUsedCount = this.props.mostUsedCount ?? 6;

    // Auto enable SP provider when context exists unless explicitly disabled
    const useSP = (this.props.useSharePointProvider ?? !!this.props.context) && !!this.props.context;

    if (!useSP) {
      if (this._mounted) {
        this.setState({
          loading: false,
          recently: placeholders,
          mostUsed: placeholders.slice(0, Math.min(4, mostUsedCount)),
          favourites: dummyFavs
        });
      }
      return;
    }

    try {
      const svc = new listServices(this.props.context!);
      const [recently, mostUsed] = await Promise.all([
        svc.getRecentlyUpdatedDocuments(this.props.dmsLibraryRoot || '/sites/Intranet/DMS', recentlyCount),
        svc.getMostUsedDocumentsOnSite(mostUsedCount)
      ]);

      if (this._mounted) {
        this.setState({ loading: false, recently, mostUsed, favourites: dummyFavs });
      }
    } catch {
      if (this._mounted) {
        this.setState({
          loading: false,
          recently: placeholders,
          mostUsed: placeholders.slice(0, Math.min(4, mostUsedCount)),
          favourites: dummyFavs
        });
      }
    }
  }

  public componentWillUnmount(): void {
    this._mounted = false;
  }

  private renderSimpleList = (title: string, items: BoardItem[]) => (
    <div className={styles.board}>
      <div className={styles.boardTitle}>{title}</div>
      <ul className={styles.boardList}>
        {items.map(it => (
          <li key={it.id}>
            <span className={styles.dot} />
            <span className={styles.name} title={it.name}>{it.name}</span>
            <span className={styles.meta}>{it.dept || ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  public render(): React.ReactElement {
    const { recently, mostUsed, favourites } = this.state;

    return (
      <div className={styles.boards}>
        {this.renderSimpleList('Recently Updated', recently)}
        {this.renderSimpleList('Most Used in DHRE', mostUsed)}

        {/* Favourites (dummy for now) */}
        <div className={styles.board}>
          <div className={styles.boardTitle}>Favourites</div>
          <ul className={styles.boardList}>
            {favourites.map(f => (
              <li key={f.id} style={{ gridTemplateColumns: '12px 1fr auto' }}>
                <span className={styles.dot} />
                <div>
                  <div className={styles.name} title={f.name}>{f.name}</div>
                  <div className={styles.meta}>{f.tag || 'Documents'}</div>
                </div>
                <span className={styles.meta}>{f.dept || ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
