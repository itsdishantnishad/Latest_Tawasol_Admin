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
  currentDepartment?: string;
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

// 🔗 Resolve target URL (same pattern as NewsResults)
const resolveTargetUrl = (news: any): string | undefined => {
  if (news.path && String(news.path).trim()) {
    return String(news.path);
  }

  if (news.newsImage) {
    try {
      const parsedUrl = new URL(String(news.newsImage), window.location.origin);
      const pagePath = parsedUrl.searchParams.get('path');
      if (pagePath) {
        return decodeURIComponent(pagePath);
      }
    } catch {
      // ignore
    }
  }

  return undefined;
};

const MAX_CARDS = 4;

const normalize = (value?: string): string =>
  (value || '').trim().toLowerCase();

export default class MoreForYou extends React.Component<IMoreForYouProps, IMoreForYouState> {
  private spService: listServices;
  private animationTimeout?: number;

  constructor(props: IMoreForYouProps) {
    super(props);
    this.state = { relatedNews: [], animate: false, currentDepartment: undefined };
    this.spService = new listServices(this.props.context);
  }

  public async componentDidMount(): Promise<void> {
    // Get current page's news item (for department) and a batch of related news
    const [currentItems, listItems] = await Promise.all([
      this.spService.getNewsStorybyID(),
      this.spService.getNewsStory(10)
    ]);

    const currentDept = currentItems?.[0]?.department as string | undefined;

    this.setState({
      relatedNews: listItems,
      animate: true,
      currentDepartment: currentDept
    });

    this.animationTimeout = window.setTimeout(
      () => this.setState({ animate: false }),
      900
    ) as unknown as number;
  }

  public componentWillUnmount(): void {
    if (this.animationTimeout) window.clearTimeout(this.animationTimeout);
  }

  public render(): React.ReactElement<IMoreForYouProps> {
    const { relatedNews, animate, currentDepartment } = this.state;

    const currentPath = window.location.pathname.toLowerCase();
    const currentDeptNorm = normalize(currentDepartment);

    // 1) Filter:
    //    - must have a URL
    //    - must NOT be the current page
    //    - department must match current page department
    //         OR newsType is "Around the World" (global)
    // 2) Take only first MAX_CARDS
    const visibleNews = (relatedNews || [])
      .filter((news: any) => {
        const targetUrl = resolveTargetUrl(news);
        if (!targetUrl) return false;

        // Hide current page itself
        try {
          const targetPath = new URL(targetUrl, window.location.origin)
            .pathname.toLowerCase();
          if (targetPath === currentPath) return false;
        } catch {
          return false;
        }

        const newsDeptNorm = normalize(news.department);
        const newsTypeNorm = normalize(news.newsType);

        const isAroundTheWorld =
          newsTypeNorm === 'around the world' ||
          newsTypeNorm === 'around_the_world' ||
          newsTypeNorm.includes('around the world');

        if (isAroundTheWorld) return true;

        if (currentDeptNorm && newsDeptNorm) {
          return newsDeptNorm === currentDeptNorm;
        }

        // If we don't know current dept, don't include this item
        return false;
      })
      .slice(0, MAX_CARDS);

    return (
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>More for you</h3>

        <div className={`${styles.grid} ${animate ? styles.animateIn : ''}`}>
          {visibleNews.map((news: any, index: number) => {
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

            const publishedHuman = news.publishedISO
              ? moment(news.publishedISO).fromNow()
              : undefined;

            // Resolve icon sources from maps
            const categoryIconSrc = categoryIconSrcByKey[categoryKey];
            const departmentIconSrc = departmentIconSrcByKey[departmentKey];

            const targetUrl = resolveTargetUrl(news)!;

            return (
              <a
                key={news.Id || targetUrl || news.title || index}
                className={styles.card}
                href={targetUrl}
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
                    {showDepartment && news.department && (
                      <span className={styles.dept}>
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

                    <div className={styles.title}>{news.title}</div>

                    <div className={styles.metaRow}>
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
              </a>
            );
          })}
        </div>
      </div>
    );
  }
}
