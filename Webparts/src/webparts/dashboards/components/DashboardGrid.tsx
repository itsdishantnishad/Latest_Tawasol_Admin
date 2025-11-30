import * as React from 'react';
import { Text, Image, ImageFit, Stack } from '@fluentui/react';
import { DashboardItem } from '../../services/listServices';
import styles from './Dashboards.module.scss';

export interface IDashboardGridProps {
  title: string;
  items: DashboardItem[];
  onOpen: (item: DashboardItem) => void;
  showTitle?: boolean;
}

const DashboardGrid: React.FC<IDashboardGridProps> = ({ title, items, onOpen, showTitle = true }) => {
  const onKey = (e: React.KeyboardEvent, it: DashboardItem) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(it); }
  };

  return (
    <section>
      {showTitle && <Text variant="xLarge" className={styles.masterTitle}>{title}</Text>}

      <div className={styles.grid}>
        {items.map(it => (
          <article
            key={it.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            aria-label={it.title}
            onClick={() => onOpen(it)}
            onKeyDown={(e) => onKey(e, it)}
            title={it.title}
          >
            {it.thumbUrl ? (
              <Image
                src={it.thumbUrl}
                alt=""
                className={styles.cardImg}
                imageFit={ImageFit.cover}
                maximizeFrame
                loading="lazy"
              />
            ) : (
              <div className={`${styles.placeholder}`} />
            )}

            <Stack tokens={{ childrenGap: 2 }}>
              <span className={styles.cardTitle}>{it.title}</span>
              {it.body && <span className={styles.cardBody}>{it.body}</span>}
            </Stack>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardGrid;
