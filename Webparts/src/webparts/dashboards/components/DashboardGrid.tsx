import * as React from 'react';
import { Text, Image } from '@fluentui/react';
import { DashboardItem } from '../../services/listServices';
import styles from './Dashboards.module.scss';

export interface IDashboardGridProps {
  title: string;
  items: DashboardItem[];
  onOpen: (item: DashboardItem) => void;
  showTitle?: boolean; // NEW
}

export default class DashboardGrid extends React.Component<IDashboardGridProps, {}> {
  static defaultProps = { showTitle: true };

  render(): React.ReactElement<IDashboardGridProps> {
    const { title, items, onOpen, showTitle } = this.props;

    return (
      <section>
        {showTitle && (
          <Text variant="xLarge" className={styles.masterTitle}>{title}</Text>
        )}

        <div className={styles.grid}>
          {items.map(it => (
            <div key={it.id} className={styles.card} onClick={() => onOpen(it)} title={it.title}>
              {it.thumbUrl ? (
                <Image src={it.thumbUrl} alt="" className={styles.cardImg} />
              ) : (
                <div className={styles.cardImg} />
              )}
              <Text variant="medium" className={styles.cardTitle}>{it.title}</Text>
              {it.body && <Text variant="small" className={styles.cardBody}>{it.body}</Text>}
            </div>
          ))}
        </div>
      </section>
    );
  }
}
