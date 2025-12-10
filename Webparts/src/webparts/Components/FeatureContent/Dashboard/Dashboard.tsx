import * as React from 'react';
import styles from './Dashboard.module.scss';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
// import rightArrow from '../assets/arrow-right.svg';
// import leftHeadingLine from  "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg"
// const leftHeadingLine: string = require("../images/leftArrow.svg");
// const rightHeadingLine: string = require("../images/rightArrow.svg");
const rightArrow = require("../images/arrow-right.svg");
const dashboardImageOne = require("../images/footfall.svg");
const dashboardImageTwo = require("../images/disqualification.svg");
const dashboardImageThree = require("../images/cxi-score.svg");
const dashboardImageFour = require("../images/sales-report.svg");
export interface IDashboard {
    id: string;
    header: string;
    subHeader: string;
    image: { url: string, alt: string };
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
        image: { url: dashboardImageOne, alt: "Customer Footfall" },
        url: '#'
    },
    {
        id: '2',
        header: 'Sales Lead Disqualification',
        subHeader: 'Analyzes reasons for lead disqualification to enhance sales strategies.',
        image: { url: dashboardImageTwo, alt: "Sales Lead Disqualification" },
        url: '#'
    },
    {
        id: '3',
        header: 'CXI Score Dashboard',
        subHeader: 'Analyzes customer experience feedback to identify improvement areas and enhance satisfaction.',
        image: { url: dashboardImageThree, alt: "CXI Score Dashboard" },
        url: '#'
    },
    {
        id: '4',
        header: 'DHRE Sales Report',
        subHeader: 'Access sales data and performance metrics to drive informed decision making.',
        image: { url: dashboardImageFour, alt: "DHRE Sales Report" },
        url: '#'
    },
];

interface DashboardCardProps {
    header: string;
    subHeader: string;
    image: { url: string, alt: string };
    targetUrl: string;
}

const DashboardCard = ({ image, header, subHeader, targetUrl }: DashboardCardProps): JSX.Element => {
    return (
        <a
            href={targetUrl}
            className={styles.dashboardCard}
        >
            <img src={image.url} alt={image.alt} className={styles.dashboardImage} />
            <div className={styles.dashboardInfo}>
                <div className={styles.dashboardTitle}>
                    {header}
                    <img src={rightArrow} alt="rightArrow" width={16} height={16} />
                </div>
                <div className={`${styles.dashboardDescription} ${styles.mTop8}`}>{subHeader}</div>
            </div>
        </a>
    )
}

export const Dashboard: React.FC<IDashboardProps> = (props) => {
    const dashboards = props.dashboards || defaultDashboards;
    // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
    const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(
        /\/$/,
        ""
    );
    const origin: string = new URL(webUrl).origin;

    const viewAllHref = React.useMemo(() => {
        const configured = (props.seeAllURL || "").trim();

        // If nothing configured, default to a page in the current site:
        //   /sites/ThisSite/SitePages/Lets-Celebrate.aspx
        const raw = configured || "SitePages/Lets-Celebrate.aspx";

        // Absolute URL from anywhere -> keep its path but move to current tenant
        if (/^https?:\/\//i.test(raw)) {
            try {
                const parsed = new URL(raw);
                return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
            } catch {
                return raw;
            }
        }

        // Root-relative (/sites/YourSite/SitePages/Page.aspx)
        if (raw.startsWith("/")) {
            return `${origin}${raw}`;
        }

        // Web-relative (SitePages/Page.aspx)
        return `${webUrl}/${raw}`;
    }, [props.seeAllURL, webUrl, origin]);
    // --- END ---


    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardGrid} >
                {
                    dashboards.map((dashboard) => (
                        <DashboardCard key={dashboard.id} image={dashboard.image} header={dashboard.header} subHeader={dashboard.subHeader} targetUrl={dashboard.url} />
                    ))
                }
            </div >

            {/* View All Button */}
            {/* <PrimaryButton label="View All" onClick={()=>{props.onViewAll(props.seeAllURL)}} /> */}
            <div className={styles.buttonContainer}>
                <a href={viewAllHref} className={styles.viewAllButton}>
                    View All
                </a>
            </div>
            {/* <div className={styles.buttonContainer}>
                <button className={styles.viewAllButton} onClick={props.onViewAll}>
                    View All
                </button>
                <a href={props.seeAllURL} className={styles.viewAllButton}>
                   View All
                </a>
            </div> */}
        </div >
    );
};

export default Dashboard;

