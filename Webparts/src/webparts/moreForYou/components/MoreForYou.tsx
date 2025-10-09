import * as React from 'react';
import styles from './MoreForYou.module.scss';
import type { IMoreForYouProps } from './IMoreForYouProps';
import { listServices } from '../../services/listServices';

export interface IMoreForYouState {
  relatedNews: any[];
}

export default class MoreForYou extends React.Component<IMoreForYouProps, IMoreForYouState> {
  private spService: listServices;

  public constructor(props: IMoreForYouProps) {
    super(props);
    this.state = {
      relatedNews: []
    };
    this.spService = new listServices(this.props.context);
  }

  async componentDidMount(): Promise<void> {
    let listItems: any = [];
    listItems = await this.spService.getNewsStory();
    console.log(listItems)
    this.setState({
      relatedNews: listItems
    })
  }

  public render(): React.ReactElement<IMoreForYouProps> {
    const {

    } = this.props;

    return (
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>More for you</h3>

        <div className={styles.grid}>
          {this.state.relatedNews && this.state.relatedNews.map((news: any) => {
            //  const category = normalizeCategory(it.NACategory);
            // const published = it.FirstPublishedDate || it.Modified || it.Created || "";
            //const img = getBestImage(it);

            return (
              <article
                key={news.Id}
                className={styles.card}
                onClick={() => (window.location.href = news.FileRef)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && (window.location.href = news.FileRef)}
              >
                <div className={styles.imageWrap}>
                  <img src={news.newsImage} alt={news.Title} loading="lazy" />
                  <div className={styles.fadeTop}></div>
                  <div className={styles.fadeBottom}></div>
                </div>

                <div className={styles.contentOverlay}>
                  <div className={styles.title}>{news.Title}</div>

                  <div className={styles.metaRow}>
                    {/* Department label (may be empty; column exists via CT) */}
                    {/* {getDeptLabel(it, deptNoteName) && (
                    <span className={`${styles.metaItem} ${styles.dept}`}>
                      <span className={styles.dotIcon}>👥</span>{" "}
                      {getDeptLabel(it, deptNoteName)}
                    </span>
                  )} */}
                    {/* {published && (
                    // <span className={styles.metaItem}>{timeAgo(published)}</span>
                  )} */}
                    <span className={styles.metaItem}>
                   {news.readTime} min read
                    </span>
                    {/* {category && <span className={styles.metaItem}>• {category}</span>} */}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

    );
  }
}
