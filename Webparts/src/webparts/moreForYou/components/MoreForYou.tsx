import * as React from 'react';
import styles from './MoreForYou.module.scss';
import type { IMoreForYouProps } from './IMoreForYouProps';
import { listServices } from '../../services/listServices';
import moment from 'moment';

export interface IMoreForYouState {
  relatedNews: any[];
  animate: boolean;
}

export default class MoreForYou extends React.Component<IMoreForYouProps, IMoreForYouState> {
  private spService: listServices;
  private animationTimeout?: number;

  constructor(props: IMoreForYouProps) {
    super(props);
    this.state = { relatedNews: [], animate: false };
    this.spService = new listServices(this.props.context);
  }

  public async componentDidMount(): Promise<void> {
    const listItems = await this.spService.getNewsStory();
    this.setState({ relatedNews: listItems, animate: true });
    this.animationTimeout = window.setTimeout(() => this.setState({ animate: false }), 900) as unknown as number;
  }

  public componentWillUnmount(): void {
    if (this.animationTimeout) window.clearTimeout(this.animationTimeout);
  }

  public render(): React.ReactElement<IMoreForYouProps> {
    const { relatedNews, animate } = this.state;

    return (
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>More for you</h3>

        <div className={`${styles.grid} ${animate ? styles.animateIn : ''}`}>
          {relatedNews?.map((news: any) => {
            const categoryKey = String(news.newsType || '').toLowerCase().trim().replace(/\s+/g, '_');
            const categoryClassByKey: Record<string, string | undefined> = {
              announcement: styles.cat_announcement,
              around_the_world: styles.cat_around_the_world,
              dhre_stories: styles.cat_dhre_stories,
            };
            const showDepartment = categoryKey === 'announcement' || categoryKey === 'dhre_stories';

            const departmentKey = String(news.department || '')
              .toLowerCase().trim().replace(/[&＆]/g, 'and')
              .replace(/[^a-z0-9\s_]/g, '').replace(/\s+/g, '_');

            const departmentClassByKey: Record<string, string | undefined> = {
              human_capital: styles.dept_hc,
              governance_risk_and_compliance: styles.dept_grc,
              health_safety_environment: styles.dept_hse,
              procurement_and_admin: styles.dept_proc,
              procurement_admin: styles.dept_proc,
            };

            const handleOpen = () => { if (news?.path) window.location.href = String(news.path); };
            const publishedHuman = news.publishedISO ? moment(news.publishedISO).fromNow() : undefined;

            return (
              <article
                key={news.Id || news.path || news.title}
                className={styles.card}
                onClick={handleOpen}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
                data-interception="off"
                title={news.title}
              >
                <div className={styles.imageWrap}>
                  <img src={news.newsImage} alt={news.title} loading="lazy" />
                  <div className={styles.fadeTop} />
                  <div className={styles.fadeBottom} />
                </div>

                <div className={styles.contentOverlay}>
                  <span
                    className={`${styles.badge} ${styles.categoryIcon} ${categoryClassByKey[categoryKey] || ''}`}
                    aria-label={news.newsType}
                    title={news.newsType}
                  />

                  <div className={styles.bottom}>
                    <div className={styles.title}>{news.title}</div>

                    <div className={styles.metaRow}>
                      {showDepartment && news.department && (
                        <span className={`${styles.metaItem} ${styles.dept}`}>
                          <span className={`${styles.deptIcon} ${departmentClassByKey[departmentKey] || ''}`} aria-hidden="true" />
                          {news.department}
                        </span>
                      )}

                      {publishedHuman && <span className={styles.metaItem}>{publishedHuman}</span>}

                      {typeof news.readTime === 'number' && news.readTime > 0 && (
                        <span className={styles.metaItem}>{news.readTime} min read</span>
                      )}

                      {typeof news.pageView === 'number' && (
                        <span className={styles.metaItem}>{news.pageView} Views</span>
                      )}
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
