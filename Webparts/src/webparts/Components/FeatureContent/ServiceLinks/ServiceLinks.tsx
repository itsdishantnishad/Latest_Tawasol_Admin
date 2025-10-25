import * as React from 'react';
import styles from './ServiceLinks.module.scss';

import PrimaryButton from '../../PrimaryButton/PrimaryButton';

const jiraIcon: string = require("../../../featureWheel/images/jira.png");
const slackIcon: string = require("../../../featureWheel/images/slack.png");
const outlookIcon: string = require("../../../featureWheel/images/outlooks.png");
const microsoftTeamsIcon: string = require("../../../featureWheel/images/teams.png");

export interface IServiceLink {
    id: string;
    name: string;
    icon: string;
    url: string;
    position?: 'top-left' | 'left-center' | 'bottom-left' | 'top-right' | 'right-center' | 'bottom-right' | 'top-center';
    relativeTo?: 'outer' | 'inner';
}

export interface IServiceLinksProps {
    services?: IServiceLink[];
    onViewAll?: () => void;
}

const defaultServices: IServiceLink[] = [
    // Outer circle services (6 cards)
    {
        id: '1',
        name: 'JIRA',
        icon: jiraIcon,
        url: '#',
        position: 'top-left',
        relativeTo: 'outer'
    },
    {
        id: '2',
        name: 'JIRA',
        icon: jiraIcon,
        url: '#',
        position: 'left-center',
        relativeTo: 'outer'
    },
    {
        id: '3',
        name: 'JIRA',
        icon: jiraIcon,
        url: '#',
        position: 'bottom-left',
        relativeTo: 'outer'
    },
    {
        id: '4',
        name: 'JIRA',
        icon: jiraIcon,
        url: '#',
        position: 'top-right',
        relativeTo: 'outer'
    },
    {
        id: '5',
        name: 'JIRA',
        icon: jiraIcon,
        url: '#',
        position: 'right-center',
        relativeTo: 'outer'
    },
    {
        id: '6',
        name: 'JIRA',
        icon: jiraIcon,
        url: '#',
        position: 'bottom-right',
        relativeTo: 'outer'
    },
    // Inner circle services (3 cards)
    {
        id: '7',
        name: 'Slack',
        icon: slackIcon,
        url: '#',
        position: 'left-center',
        relativeTo: 'inner'
    },
    {
        id: '8',
        name: 'Outlook',
        icon: outlookIcon,
        url: '#',
        position: 'top-center',
        relativeTo: 'inner'
    },
    {
        id: '9',
        name: 'Microsoft Teams',
        icon: microsoftTeamsIcon,
        url: '#',
        position: 'right-center',
        relativeTo: 'inner'
    },
];

export const ServiceLinks: React.FC<IServiceLinksProps> = (props) => {
    const services = props.services || defaultServices;
    const [currentPage, setCurrentPage] = React.useState(0);
    const itemsPerPage = 9; // 6 outer circle + 3 inner circle cards
    const totalPages = Math.ceil(services.length / itemsPerPage);
    const currentServices = services.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handlePrev = (): void => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
    };

    const handleNext = (): void => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    };

    // Calculate positions for cards bound to outer circle
    const getOuterCirclePosition = (position: string): React.CSSProperties => {
        // Position cards around the outer circle at 6 specific points
        const positionMap: Record<string, React.CSSProperties> = {
            'top-left': {
                top: '15%',
                left: '15%',
                transform: 'translate(-50%, -50%)'
            },
            'left-center': {
                top: '50%',
                left: '0%',
                transform: 'translate(-50%, -50%)'
            },
            'bottom-left': {
                bottom: '15%',
                left: '15%',
                transform: 'translate(-50%, 50%)'
            },
            'top-right': {
                top: '15%',
                right: '15%',
                transform: 'translate(50%, -50%)'
            },
            'right-center': {
                top: '50%',
                right: '0%',
                transform: 'translate(50%, -50%)'
            },
            'bottom-right': {
                bottom: '15%',
                right: '15%',
                transform: 'translate(50%, 50%)'
            }
        };
        return positionMap[position] || { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    };

    // Calculate positions for cards bound to inner circle
    const getInnerCirclePosition = (position: string): React.CSSProperties => {
        // Position cards around the inner circle at 3 specific points
        const positionMap: Record<string, React.CSSProperties> = {
            'left-center': {
                top: '50%',
                left: '0%',
                transform: 'translate(-50%, -50%)'
            },
            'top-center': {
                top: '0%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            },
            'right-center': {
                top: '50%',
                right: '0%',
                transform: 'translate(50%, -50%)'
            }
        };
        return positionMap[position] || { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    };

    return (
        <div className={styles.serviceLinksContainer}>
            {/* Circular Services Layout with Navigation */}
            <div className={styles.wheelWrapper}>
                <button className={styles.navButton} onClick={handlePrev}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className={styles.outerCircle}>
                    {/* Render outer circle service cards */}
                    {currentServices
                        .filter(service => service.relativeTo === 'outer' && service.position)
                        .map((service) => {
                            const position = service.position || 'top-left';
                            return (
                                <a
                                    key={service.id}
                                    href={service.url}
                                    className={styles.serviceCard}
                                    style={getOuterCirclePosition(position)}
                                >
                                    <img src={service.icon} alt={service.name} width={80} height={80} />
                                    <span className={styles.serviceName}>{service.name}</span>
                                </a>
                            );
                        })}

                    {/* Inner circle with service cards */}
                    <div className={styles.innerCircle}>
                        {/* Render inner circle service cards */}
                        {currentServices
                            .filter(service => service.relativeTo === 'inner' && service.position)
                            .map((service) => {
                                const position = service.position || 'top-center';
                                return (
                                    <a
                                        key={service.id}
                                        href={service.url}
                                        className={styles.serviceCard}
                                        style={getInnerCirclePosition(position)}
                                    >
                                        <img src={service.icon} alt={service.name} width={80} height={80} />
                                        <span className={styles.serviceName}>{service.name}</span>
                                    </a>
                                );
                            })}
                    </div>
                </div>

                <button className={styles.navButton} onClick={handleNext}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Pagination Dots */}
            {
                totalPages > 1 && (
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
                )
            }

            <PrimaryButton label="View All" onClick={props.onViewAll} />
        </div>
    );
};

export default ServiceLinks;

