import * as React from 'react';
import styles from './PoliciesAndProcedures.module.scss';

export default class Boards extends React.Component {
  public render(): React.ReactElement {
    // Placeholder rows – wire up later
    const rows = Array.from({ length: 6 }).map((_, i) => ({ id: i, name: `Sample document ${i+1}.pdf`, dept: 'GRC' }));
    const renderList = (t: string) => (
      <div className={styles.board}>
        <div className={styles.boardTitle}>{t}</div>
        <ul className={styles.boardList}>
          {rows.map(r => (
            <li key={r.id}><span className={styles.dot}></span><span className={styles.name}>{r.name}</span><span className={styles.meta}>{r.dept}</span></li>
          ))}
        </ul>
      </div>
    );

    return (
      <div className={styles.boards}>
        {renderList('Recently Updated')}
        {renderList('Most Used in DHRE')}
        {renderList('Favourites')}
      </div>
    );
  }
}
