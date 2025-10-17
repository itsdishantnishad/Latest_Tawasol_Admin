import * as React from 'react';
import styles from './ServiceLinks.module.scss';
// import leftHeadingLine from "../../../images/leftArrow.svg"
// import rightHeadingLine from "../../../images/rightArrow.svg"
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

export interface IServiceLink {
    id: string;
    name: string;
    icon: string;
    url: string;
}

export interface IServiceLinksProps {
    services?: IServiceLink[];
    onViewAll?: () => void;
}

const defaultServices: IServiceLink[] = [
    { id: '1', name: 'JIRA', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg', url: '#' },
    { id: '2', name: 'JIRA', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg', url: '#' },
    { id: '3', name: 'Slack', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg', url: '#' },
    { id: '4', name: 'JIRA', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg', url: '#' },
    { id: '5', name: 'JIRA', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg', url: '#' },
    { id: '6', name: 'Outlook', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftoutlook.svg', url: '#' },
    { id: '7', name: 'Microsoft Teams', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftteams.svg', url: '#' },
    { id: '8', name: 'JIRA', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg', url: '#' },
];

export const ServiceLinks: React.FC<IServiceLinksProps> = (props) => {
    const services = props.services || defaultServices;
    const [currentPage, setCurrentPage] = React.useState(0);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(services.length / itemsPerPage);

    const currentServices = services.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handlePrev = () => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
    };

    const handleNext = () => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    };

    return (
        <div className={styles.serviceLinksContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.decorativeLineLeft}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="9" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={rightHeadingLine} alt="rightArrow" />
                    </div>
                    <h2 className={styles.title}>Service Links</h2>
                    <div className={styles.decorativeLineRight}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={leftHeadingLine} alt="leftArrow" />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Quickly access your most used service links
                </p>
            </div>

            {/* Services Grid with Navigation */}
            <div className={styles.carouselWrapper}>
                <button className={styles.navButton} onClick={handlePrev}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className={styles.servicesGrid}>
                    {currentServices.map((service) => (
                        <a
                            key={service.id}
                            href={service.url}
                            className={styles.serviceCard}
                        >
                            <div className={styles.iconWrapper}>
                                <img src={service.icon} alt={service.name} className={styles.icon} />
                            </div>
                            <span className={styles.serviceName}>{service.name}</span>
                        </a>
                    ))}
                </div>

                <button className={styles.navButton} onClick={handleNext}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Pagination Dots */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === currentPage ? styles.activeDot : ''}`}
                            onClick={() => setCurrentPage(index)}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* View All Button */}
            <div className={styles.buttonContainer}>
                <button className={styles.viewAllButton} onClick={props.onViewAll}>
                    View All
                </button>
            </div>
        </div>
    );
};

export default ServiceLinks;

