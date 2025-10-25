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

  // helper: "3 hours ago" etc.
  private timeAgo = (d?: string) => {
    if (!d) return "";
    const t = new Date(d).getTime();
    if (isNaN(t)) return "";
    const diff = Math.max(0, Date.now() - t);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
    const dyy = Math.floor(h / 24);
    return `${dyy} day${dyy > 1 ? "s" : ""} ago`;
  };

  public render(): React.ReactElement<IMoreForYouProps> {
    const { } = this.props;

    return (
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>More for you</h3>

        <div className={styles.grid}>
          {this.state.relatedNews && this.state.relatedNews.map((news: any) => {
            // ------- Category mapping (icons) -------
            const catKey = String(news.newsType || "")
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "_");

            const catClassByKey: Record<string, string | undefined> = {
              announcement: styles.cat_announcement,          // src/webparts/assets/AnnouncementIconNewsTag.svg
              around_the_world: styles.cat_around_the_world,  // src/webparts/assets/ArroundTheWorldIconNewsTag.svg
              dhre_stories: styles.cat_dhre_stories,          // src/webparts/assets/DHREIconNewsTag.svg
            };

            // Only show department for Announcement and DHRE Stories
            const showDept = catKey === "announcement" || catKey === "dhre_stories";

            // ------- Department mapping (icons inside pill) -------
            const deptKey = String(news.department || "")
              .toLowerCase()
              .trim()
              .replace(/[&＆]/g, "and")
              .replace(/[^a-z0-9\s_]/g, "")
              .replace(/\s+/g, "_");

            const deptClassByKey: Record<string, string | undefined> = {
              human_capital: styles.dept_hc,
              governance_risk_and_compliance: styles.dept_grc,
              health_safety_environment: styles.dept_hse,
              procurement_and_admin: styles.dept_proc,
              procurement_admin: styles.dept_proc, // safety alias
            };

            const published =
              news.publishedOn || news.firstPublishedDate || news.lastModified || news.modified;

            const readTime =
              Math.max(1, Math.trunc(Number(news.readTime) || 0)) + " min read";

            return (
              <article
                key={news.Id || news.path || news.title}
                className={styles.card}
                onClick={() => (window.location.href = news.path || news.FileRef)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && (window.location.href = news.path || news.FileRef)}
              >
                <div className={styles.imageWrap}>
                  <img src={news.newsImage} alt={news.Title || news.title} loading="lazy" />
                  <div className={styles.fadeTop}></div>
                  <div className={styles.fadeBottom}></div>
                </div>

                <div className={styles.contentOverlay}>
                  <div className="top">
                    {/* Category: icon-only */}
                    <span
                      className={`${styles.metaItem} ${styles.categoryIcon} ${catClassByKey[catKey] || ""}`}
                      aria-label={news.newsType || "category"}
                      title={news.newsType || ""}
                    />
                  </div>
                  <div className="bottom">
                    <div className={styles.title}>{news.Title || news.title}</div>
                    <div className={styles.metaRow}>

                      <div>
                        {/* Department text (pill) – only for Announcement & DHRE Stories */}
                        {showDept && news.department && (
                          <span className={`${styles.metaItem} ${styles.dept}`}>
                            <span
                              className={`${styles.deptIcon} ${deptClassByKey[deptKey] || ""}`}
                              aria-hidden="true"
                            />
                            {news.department}
                          </span>
                        )}
                      </div>

                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', }}>
                        {/* Published time */}
                        {published && (
                          <span className={styles.metaItem}>{this.timeAgo(published)}</span>
                        )}

                        {/* <span style={{"backgroundColor":"rgb(108, 108, 108)","width":"5px","height":"5px","borderRadius":"50%"}}></span> */}

                        {/* Read time */}
                        <span className={styles.metaItem}>{readTime}</span>

                        <span style={{"backgroundColor":"#fff","width":"4px","height":"4px","borderRadius":"50%"}}></span>

                        {/* Views */}
                        {typeof news.pageView === "number" && (
                          <span className={styles.metaItem}>{news.pageView} Views</span>
                        )}
                      </div>
                    </div>
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
