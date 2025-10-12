import * as React from 'react';
import styles from './NewsPageTitle.module.scss';
import type { INewsPageTitleProps } from './INewsPageTitleProps';
import { AuthorRow } from "./AuthorRow";
import { CategoryRow } from "./CategoryRow";


export default class NewsPageTitle extends React.Component<INewsPageTitleProps, {}> {

  public constructor(props: INewsPageTitleProps) {
    super(props);
    this.state = {
      promos: []
    };
  }

  public render(): React.ReactElement<INewsPageTitleProps> {
    const {
      newsItem
    } = this.props;

    return (
      <div className={styles.newsDetails}>
        {/* Chips row */}
        <CategoryRow
          category={newsItem[0].newsType}
          department={newsItem[0].department}
          hashtags={["#internal"]}
          onTagClick={() => { }}
        />

        <h1 className={styles.title}>{newsItem[0].title}</h1>

        {/* Author row */}
        <AuthorRow
          authorName={newsItem[0].author}
          authorEmail={newsItem[0].author}
          readTime={newsItem[0].readTime}
          views={newsItem[0].pageView}
          publishedOn={"today"}
        />
      </div>
    );
  }
}
