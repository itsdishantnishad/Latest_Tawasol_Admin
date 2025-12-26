import * as React from 'react';
import styles from './PoliciesAndProcedures.module.scss';
import { listServices, DocumentSummary } from '../../services/listServices';

type BoardItem = DocumentSummary;

interface IBoardsProps {
  context?: any;
  useSharePointProvider?: boolean;
  dmsLibraryRoot?: string;
  recentlyCount?: number;
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

  private _mounted: boolean = false;

  public async componentDidMount(): Promise<void> {
    this._mounted = true;

    const dummyFavs: BoardItem[] = [
      { id: 'f1', name: 'Performance Management', ext: 'docx', tag: 'Documents', dept: 'GRC' },
      { id: 'f2', name: 'Addendum to HC Policy Manual Reference….', ext: 'pptx', tag: 'Awareness Sessions', dept: 'GRC' },
      { id: 'f3', name: 'Addendum to HC Policy Manual Reference….', ext: 'pdf', tag: 'Forms', dept: 'GRC' }
    ];

    const recentlyCount: number = this.props.recentlyCount ?? 6;
    const mostUsedCount: number = this.props.mostUsedCount ?? 6;

    const placeholders: BoardItem[] = [];
    for (let i = 0; i < recentlyCount; i++) {
      placeholders.push({
        id: `p${i}`,
        name: `Sample document ${i + 1}.pdf`,
        dept: 'GRC'
      } as BoardItem);
    }

    const useSP: boolean =
      (this.props.useSharePointProvider ?? !!this.props.context) && !!this.props.context;

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
      const svc = new listServices(this.props.context);

      const results = await Promise.all([
        svc.getRecentlyUpdatedDocuments(this.props.dmsLibraryRoot || '/sites/Intranet/DMS', recentlyCount),
        svc.getMostUsedDocumentsOnSite(mostUsedCount)
      ]);

      const recently: BoardItem[] = (results[0] as BoardItem[]) || placeholders;
      const mostUsed: BoardItem[] = (results[1] as BoardItem[]) || placeholders.slice(0, Math.min(4, mostUsedCount));

      if (this._mounted) {
        this.setState({
          loading: false,
          recently,
          mostUsed,
          favourites: dummyFavs
        });
      }
    } catch (e: any) {
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

  private renderSimpleList(title: string, items: BoardItem[]): React.ReactElement {
    return (
      <div className={styles.board}>
        <div className={styles.boardTitle}>{title}</div>
        <ul className={styles.boardList}>
          {items.map((it: BoardItem) => (
            <li key={it.id}>
              <span className={styles.dot} />
              <span className={styles.name} title={it.name}>
                {it.name}
              </span>
              <span className={styles.meta}>{it.dept || ''}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  public render(): React.ReactElement {
    const { recently, mostUsed, favourites } = this.state;

    return (
      <div className={styles.boards}>
        {this.renderSimpleList('Recently Updated', recently)}
        {this.renderSimpleList('Most Used in DHRE', mostUsed)}

        <div className={styles.board}>
          <div className={styles.boardTitle}>Favourites</div>
          <ul className={styles.boardList}>
            {favourites.map((f: BoardItem) => (
              <li key={f.id} style={{ gridTemplateColumns: '12px 1fr auto' }}>
                <span className={styles.dot} />
                <div>
                  <div className={styles.name} title={f.name}>
                    {f.name}
                  </div>
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
