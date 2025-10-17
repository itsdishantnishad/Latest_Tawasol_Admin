import * as React from 'react';
import styles from './Dashboard.module.scss';
// import leftHeadingLine from  "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg"
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

export interface IDashboard {
    id: string;
    title: string;
    description: string;
    image: string;
    url: string;
}

export interface IDashboardProps {
    dashboards?: IDashboard[];
    onViewAll?: () => void;
}

const defaultDashboards: IDashboard[] = [
    {
        id: '1',
        title: 'Customer Footfall',
        description: 'Analyzes customer traffic patterns to improve staffing, inventory, and marketing strategies.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        url: '#'
    },
    {
        id: '2',
        title: 'Sales Lead Disqualification',
        description: 'Analyzes reasons for lead disqualification to enhance sales strategies.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        url: '#'
    },
    {
        id: '3',
        title: 'CXI Score Dashboard',
        description: 'Analyzes customer experience feedback to identify improvement areas and enhance satisfaction.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        url: '#'
    },
    {
        id: '4',
        title: 'DHRE Sales Report',
        description: 'Access sales data and performance metrics to drive informed decision making.',
        image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400',
        url: '#'
    },
];

export const Dashboard: React.FC<IDashboardProps> = (props) => {
    const dashboards = props.dashboards || defaultDashboards;

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.decorativeLineLeft}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="9" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={rightHeadingLine} alt="right headline line" />
                    </div>
                    <h2 className={styles.title}>Dashboards</h2>
                    <div className={styles.decorativeLineRight}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={leftHeadingLine} alt="left headline line" />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Track everything at a glance – insights made simple!
                </p>
            </div>

            {/* Dashboard Grid */}
            <div className={styles.dashboardGrid}>
                {dashboards.map((dashboard) => (
                    <a
                        key={dashboard.id}
                        href={dashboard.url}
                        className={styles.dashboardCard}
                    >
                        <div className={styles.imageContainer}>
                            <img src={dashboard.image} alt={dashboard.title} className={styles.dashboardImage} />
                            <div className={styles.imageOverlay} />
                        </div>
                        <div className={styles.dashboardInfo}>
                            <h3 className={styles.dashboardTitle}>
                                {dashboard.title}
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.arrowIcon}>
                                    <path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </h3>
                            <p className={styles.dashboardDescription}>{dashboard.description}</p>
                        </div>
                    </a>
                ))}
            </div>

            {/* View All Button */}
            <div className={styles.buttonContainer}>
                <button className={styles.viewAllButton} onClick={props.onViewAll}>
                    View All
                </button>
            </div>
        </div>
    );
};

export default Dashboard;

