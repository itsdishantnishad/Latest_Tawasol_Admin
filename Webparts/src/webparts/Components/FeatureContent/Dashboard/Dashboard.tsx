import * as React from 'react';
import styles from './Dashboard.module.scss';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
// import rightArrow from '../images/rightArrow.svg';
// import leftHeadingLine from  "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg"
// const leftHeadingLine: string = require("../images/leftArrow.svg");
// const rightHeadingLine: string = require("../images/rightArrow.svg");

export interface IDashboard {
    id: string;
    header: string;
    subHeader: string;
    image: { url: string, alt: string };
    url: string;
}

export interface IDashboardProps {
    dashboards?: IDashboard[];
    onViewAll?: () => void;
}

const defaultDashboards: IDashboard[] = [
    {
        id: '1',
        header: 'Customer Footfall',
        subHeader: 'Analyzes customer traffic patterns to improve staffing, inventory, and marketing strategies.',
        image: { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', alt: "Customer Footfall" },
        url: '#'
    },
    {
        id: '2',
        header: 'Sales Lead Disqualification',
        subHeader: 'Analyzes reasons for lead disqualification to enhance sales strategies.',
        image: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', alt: "Sales Lead Disqualification" },
        url: '#'
    },
    {
        id: '3',
        header: 'CXI Score Dashboard',
        subHeader: 'Analyzes customer experience feedback to identify improvement areas and enhance satisfaction.',
        image: { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', alt: "CXI Score Dashboard" },
        url: '#'
    },
    {
        id: '4',
        header: 'DHRE Sales Report',
        subHeader: 'Access sales data and performance metrics to drive informed decision making.',
        image: { url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400', alt: "DHRE Sales Report" },
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
                    {/* <img src={rightArrow} alt="rightArrow" width={16} height={16} /> */}
                </div>
                <div className={`${styles.dashboardDescription} ${styles.mTop8}`}>{subHeader}</div>
            </div>
        </a>
    )
}

export const Dashboard: React.FC<IDashboardProps> = (props) => {
    const dashboards = props.dashboards || defaultDashboards;

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
            <PrimaryButton label="View All" onClick={props.onViewAll} />
        </div >
    );
};

export default Dashboard;

