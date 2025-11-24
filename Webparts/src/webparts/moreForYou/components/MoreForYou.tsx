import * as React from 'react';
import styles from './MoreForYou.module.scss';
import type { IMoreForYouProps } from './IMoreForYouProps';
import { listServices } from '../../services/listServices';
import moment from 'moment';

// SVGs from shared constants
import {
  AnnouncementIconSVG,
  ArroundTheWorldIconSVG,
  DHREIconSVG,
  HumanCapitalSVG,
  GovernanceRiskandComplianceSVG,
  HealthSafetyEnvironmentSVG,
  ProcurementSVG,
} from '../../assets/constants';

export interface IMoreForYouState {
  relatedNews: any[];
  animate: boolean;
}

// Helper: convert SVG string → data URI so we can use as background-image
const svgToDataUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

// Category icons mapped by normalized key
const categoryIconSrcByKey: Record<string, string> = {
  announcement: svgToDataUri(AnnouncementIconSVG),
  around_the_world: svgToDataUri(ArroundTheWorldIconSVG),
  dhre_stories: svgToDataUri(DHREIconSVG),
};

// Department icons mapped by normalized key
const departmentIconSrcByKey: Record<string, string> = {
  human_capital: svgToDataUri(HumanCapitalSVG),
  governance_risk_and_compliance: svgToDataUri(GovernanceRiskandComplianceSVG),
  health_safety_environment: svgToDataUri(HealthSafetyEnvironmentSVG),
  procurement_and_admin: svgToDataUri(ProcurementSVG),
  procurement_admin: svgToDataUri(ProcurementSVG), // alias
};

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

    this.animationTimeout = window.setTimeout(
      () => this.setState({ animate: false }),
      900
    ) as unknown as number;
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
            // ----- category key normalisation -----
            const categoryKey = String(news.newsType || '')
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '_');

            const showDepartment =
              categoryKey === 'announcement' || categoryKey === 'dhre_stories';

            // ----- department key normalisation -----
            const departmentKey = String(news.department || '')
              .toLowerCase()
              .trim()
              .replace(/[&＆]/g, 'and')
              .replace(/[^a-z0-9\s_]/g, '')
              .replace(/\s+/g, '_');

            const handleOpen = () => {
              if (news?.path) window.location.href = String(news.path);
            };

            const publishedHuman = news.publishedISO
              ? moment(news.publishedISO).fromNow()
              : undefined;

            // Resolve icon sources from maps
            const categoryIconSrc = categoryIconSrcByKey[categoryKey];
            const departmentIconSrc = departmentIconSrcByKey[departmentKey];

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
                  {/* Category icon – now using inline backgroundImage from constants.ts */}
                  <span
                    className={`${styles.badge} ${styles.categoryIcon}`}
                    aria-label={news.newsType}
                    title={news.newsType}
                    style={
                      categoryIconSrc
                        ? { backgroundImage: `url("${categoryIconSrc}")` }
                        : undefined
                    }
                  />

                  <div className={styles.bottom}>
                    <div className={styles.title}>{news.title}</div>

                    <div className={styles.metaRow}>
                      {showDepartment && news.department && (
                        <span className={`${styles.metaItem} ${styles.dept}`}>
                          <span
                            className={styles.deptIcon}
                            aria-hidden="true"
                            style={
                              departmentIconSrc
                                ? { backgroundImage: `url("${departmentIconSrc}")` }
                                : undefined
                            }
                          />
                          {news.department}
                        </span>
                      )}

                      {publishedHuman && (
                        <span className={styles.metaItem}>{publishedHuman}</span>
                      )}

                      {typeof news.readTime === 'number' && news.readTime > 0 && (
                        <span className={styles.metaItem}>
                          {news.readTime} min read
                        </span>
                      )}

                      {typeof news.pageView === 'number' && (
                        <span className={styles.metaItem}>
                          {news.pageView} Views
                        </span>
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
