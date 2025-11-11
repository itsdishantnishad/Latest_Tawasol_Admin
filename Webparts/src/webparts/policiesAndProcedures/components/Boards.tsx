import * as React from 'react';
import styles from './PoliciesAndProcedures.module.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { listServices, DocumentSummary } from '../../services/listServices';

type BoardItem = DocumentSummary;

interface IBoardsProps {
  context?: WebPartContext;
  useSharePointProvider?: boolean;   // default false
  dmsLibraryRoot?: string;           // e.g. "/sites/Intranet/DMS"
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

  public async componentDidMount(): Promise<void> {
    // Dummy favourites (until Like feature is wired)
    const dummyFavs: BoardItem[] = [
      { id: 'f1', name: 'Performance Management', ext: 'docx', tag: 'Documents', dept: 'GRC' },
      { id: 'f2', name: 'Addendum to HC Policy Manual Reference….', ext: 'pptx', tag: 'Awareness Sessions', dept: 'GRC' },
      { id: 'f3', name: 'Addendum to HC Policy Manual Reference….', ext: 'pdf',  tag: 'Forms',              dept: 'GRC' },
    ];

    const placeholders = Array.from({ length: 6 }).map((_, i) => ({
      id: `p${i}`, name: `Sample document ${i + 1}.pdf`, dept: 'GRC'
    }));

    if (!this.props.useSharePointProvider || !this.props.context) {
      this.setState({ loading: false, recently: placeholders, mostUsed: placeholders.slice(0, 4), favourites: dummyFavs });
      return;
    }

    try {
      const svc = new listServices(this.props.context);
      const [recently, mostUsed] = await Promise.all([
        svc.getRecentlyUpdatedDocuments(this.props.dmsLibraryRoot || '/sites/Intranet/DMS', 6),
        svc.getMostUsedDocumentsOnSite(6)
      ]);
      this.setState({ loading: false, recently, mostUsed, favourites: dummyFavs });
    } catch {
      this.setState({ loading: false, recently: placeholders, mostUsed: placeholders.slice(0, 4), favourites: dummyFavs });
    }
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
