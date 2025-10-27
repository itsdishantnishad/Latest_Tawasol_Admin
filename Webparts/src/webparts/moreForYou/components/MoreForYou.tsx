import * as React from 'react';
import styles from './MoreForYou.module.scss';
import type { IMoreForYouProps } from './IMoreForYouProps';
import { listServices } from '../../services/listServices';

export interface IMoreForYouState { relatedNews: any[]; animate: boolean; }

export default class MoreForYou extends React.Component<IMoreForYouProps, IMoreForYouState> {
  private spService: listServices;
  private t?: number;

  constructor(props: IMoreForYouProps) {
    super(props);
    this.state = { relatedNews: [], animate: false };
    this.spService = new listServices(this.props.context);
  }

  async componentDidMount(): Promise<void> {
    const listItems = await this.spService.getNewsStory();
    this.setState({ relatedNews: listItems, animate: true });
    this.t = window.setTimeout(() => this.setState({ animate: false }), 800) as unknown as number;
  }

  componentWillUnmount(): void { if (this.t) window.clearTimeout(this.t); }

  // open in SAME tab
  private openInNewTab = (url?: string) => { if (url) window.open(url, "_self"); };

  private resolveTargetUrl = (news: any): string | undefined => {
    if (news?.path && String(news.path).trim()) return String(news.path);
    if (news?.newsImage) {
      try { const u = new URL(String(news.newsImage), window.location.origin);
        const p = u.searchParams.get("path"); if (p) return decodeURIComponent(p);
      } catch {}
    }
    if (news?.FileRef?.startsWith("/")) return String(news.FileRef);
    if (news?.SPWebUrl && news?.FileLeafRef) {
      const base = String(news.SPWebUrl).replace(/\/$/, "");
      const leaf = String(news.FileLeafRef);
      return `${base}/SitePages/${/\.aspx$/i.test(leaf) ? leaf : `${leaf}.aspx`}`;
    }
    return undefined;
  };

  private timeAgo = (d?: string) => {
    if (!d) return "";
    const t = new Date(d).getTime(); if (isNaN(t)) return "";
    const m = Math.floor((Date.now() - t) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h} hour${h>1?"s":""} ago`;
    const dd = Math.floor(h / 24); return `${dd} day${dd>1?"s":""} ago`;
  };

  public render(): React.ReactElement<IMoreForYouProps> {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>More for you</h3>

        <div className={`${styles.grid} ${this.state.animate ? styles.animateIn : ""}`}>
          {this.state.relatedNews?.map((news: any) => {
            const catKey = String(news.newsType || "").toLowerCase().trim().replace(/\s+/g, "_");
            const catClassByKey: Record<string, string | undefined> = {
              announcement: styles.cat_announcement,
              around_the_world: styles.cat_around_the_world,
              dhre_stories: styles.cat_dhre_stories,
            };

            const showDept = catKey === "announcement" || catKey === "dhre_stories";

            const deptKey = String(news.department || "")
              .toLowerCase().trim().replace(/[&＆]/g, "and")
              .replace(/[^a-z0-9\s_]/g, "").replace(/\s+/g, "_");

            const deptClassByKey: Record<string, string | undefined> = {
              human_capital: styles.dept_hc,
              governance_risk_and_compliance: styles.dept_grc,
              health_safety_environment: styles.dept_hse,
              procurement_and_admin: styles.dept_proc,
              procurement_admin: styles.dept_proc,
            };

            const published = news.publishedOn || news.firstPublishedDate || news.lastModified || news.modified;
            const readTime = Math.max(1, Math.trunc(Number(news.readTime) || 0)) + " min read";
            const targetUrl = this.resolveTargetUrl(news);

            return (
              <article
                key={news.Id || news.path || news.title}
                className={styles.card}
                onClick={() => this.openInNewTab(targetUrl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && this.openInNewTab(targetUrl)}
                data-interception="off"
                title={news.Title || news.title}
              >
                <div className={styles.imageWrap}>
                  <img src={news.newsImage} alt={news.Title || news.title} loading="lazy" />
                  <div className={styles.fadeTop}></div>
                  <div className={styles.fadeBottom}></div>
                </div>

                <div className={styles.contentOverlay}>
                  {/* TOP: category icon only (like latest git layout) */}
                  <div className="top">
                    <span
                      className={`${styles.metaItem} ${styles.categoryIcon} ${catClassByKey[catKey] || ""}`}
                      aria-label={news.newsType || "category"}
                      title={news.newsType || ""}
                    />
                  </div>

                  {/* BOTTOM: title then metadata row */}
                  <div className="bottom">
                    <div className={styles.title}>{news.Title || news.title}</div>

                    <div className={styles.metaRow}>
                      <div>
                        {showDept && news.department && (
                          <span className={`${styles.metaItem} ${styles.dept}`}>
                            <span className={`${styles.deptIcon} ${deptClassByKey[deptKey] || ""}`} aria-hidden="true" />
                            {news.department}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {published && <span className={styles.metaItem}>{this.timeAgo(published)}</span>}
                        <span className={styles.metaItem}>{readTime}</span>
                        <span style={{ backgroundColor:'#fff', width:'4px', height:'4px', borderRadius:'50%' }}></span>
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
