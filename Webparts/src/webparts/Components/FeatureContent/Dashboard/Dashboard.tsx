import * as React from 'react';
import styles from './Dashboard.module.scss';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
import ConditionalLink from '../../ConditionalLink/ConditionalLink';

const toImgSrc = (m: any): string => (typeof m === 'string' ? m : (m?.default || m));

const rightArrow = toImgSrc(require('../images/arrow-right.svg'));
const dashboardImageOne = toImgSrc(require('../../../assets/footfall.webp'));
const dashboardImageTwo = toImgSrc(require('../../../assets/disqualification.webp'));
const dashboardImageThree = toImgSrc(require('../../../assets/cxi-score.webp'));
const dashboardImageFour = toImgSrc(require('../../../assets/sales-report.webp'));

export interface IDashboard {
  id: string;
  header: string;
  subHeader: string;
  image: { url: string; alt: string };
  url: string;
}

export interface IDashboardProps {
  dashboards?: IDashboard[];
  onViewAll: (seeAllURL: string) => void;
  seeAllURL: string;
  context: any;
}

const defaultDashboards: IDashboard[] = [
  {
    id: '1',
    header: 'Customer Footfall',
    subHeader: 'Analyzes customer traffic patterns to improve staffing, inventory, and marketing strategies.',
    image: { url: dashboardImageOne, alt: 'Customer Footfall' },
    url: 'SitePages/Dashboards.aspx',
  },
  {
    id: '2',
    header: 'Sales Lead Disqualification',
    subHeader: 'Analyzes reasons for lead disqualification to enhance sales strategies.',
    image: { url: dashboardImageTwo, alt: 'Sales Lead Disqualification' },
    url: 'SitePages/Dashboards.aspx',
  },
  {
    id: '3',
    header: 'CXI Score Dashboard',
    subHeader: 'Analyzes customer experience feedback to identify improvement areas and enhance satisfaction.',
    image: { url: dashboardImageThree, alt: 'CXI Score Dashboard' },
    url: 'SitePages/Dashboards.aspx',
  },
  {
    id: '4',
    header: 'DHRE Sales Report',
    subHeader: 'Access sales data and performance metrics to drive informed decision making.',
    image: { url: dashboardImageFour, alt: 'DHRE Sales Report' },
    url: 'SitePages/Dashboards.aspx',
  },
];

interface DashboardCardProps {
  header: string;
  subHeader: string;
  image: { url: string; alt: string };
  targetUrl: string;
}

const DashboardCard = ({ image, header, subHeader, targetUrl }: DashboardCardProps): JSX.Element => {
  return (
    <div className={styles.dashboardCard}>
      <ConditionalLink to={targetUrl}>
        <div className={styles.dashboardCardInner}>
          <div className={styles.dashboardImageWrap}>
            <img src={image.url} alt={image.alt} className={styles.dashboardImage} />
          </div>

          <div className={styles.dashboardInfo}>
            <div className={styles.dashboardTitle}>
              <span className={styles.dashboardTitleText}>{header}</span>
              <img src={rightArrow} alt="" aria-hidden="true" className={styles.titleArrow} />
            </div>
            <div className={`${styles.dashboardDescription} ${styles.mTop8}`}>{subHeader}</div>
          </div>
        </div>
      </ConditionalLink>
    </div>
  );
};

export const Dashboard: React.FC<IDashboardProps> = (props) => {
  const dashboards = props.dashboards || defaultDashboards;

  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, '');
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || '').trim();
    const raw = configured || 'SitePages/Dashboards.aspx';

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    if (raw.startsWith('/')) {
      return `${origin}${raw}`;
    }

    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);

  const resolveCardUrl = React.useCallback(
    (url: string) => {
      const raw = (url || '').trim();

      if (!raw || raw === '#') {
        return viewAllHref;
      }

      if (/^https?:\/\//i.test(raw)) {
        try {
          const parsed = new URL(raw);
          return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
        } catch {
          return raw;
        }
      }

      if (raw.startsWith('/')) {
        return `${origin}${raw}`;
      }

      return `${webUrl}/${raw}`;
    },
    [webUrl, origin, viewAllHref]
  );

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardGrid}>
        {dashboards.map((dashboard) => (
          <DashboardCard
            key={dashboard.id}
            image={dashboard.image}
            header={dashboard.header}
            subHeader={dashboard.subHeader}
            targetUrl={resolveCardUrl(dashboard.url)}
          />
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <ConditionalLink to={viewAllHref}>
          <PrimaryButton fullWidth label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Dashboard;