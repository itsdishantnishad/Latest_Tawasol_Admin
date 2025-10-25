import * as React from 'react';
import styles from './NewsPageTitle.module.scss';
import type { INewsPageTitleProps } from './INewsPageTitleProps';
import AuthorRow from './AuthorRow';
import CategoryRow from './CategoryRow';

export default class NewsPageTitle extends React.Component<INewsPageTitleProps, {}> {
  public constructor(props: INewsPageTitleProps) {
    super(props);
  }

  public render(): React.ReactElement<INewsPageTitleProps> {
    const { newsItem } = this.props;
    const row = (Array.isArray(newsItem) ? newsItem[0] : undefined) || {};

    return (
      <div className={styles.newsDetails}>
        {/* Chips row */}
        <CategoryRow
          category={row?.newsType}
          department={row?.department}
          // ↓ ensure null/undefined becomes []
          hashtags={(row?.tags as any) ?? []}
          onTagClick={() => { /* noop for now */ }}
        />

        <h1 className={styles.title}>{row?.title}</h1>

        {/* Author row */}
        <AuthorRow
          authorName={row?.author}
          authorEmail={row?.authorEmail}
          readTime={row?.readTime}
          views={row?.pageView}
          publishedOn={row?.created}
        />
      </div>
    );
  }
}
