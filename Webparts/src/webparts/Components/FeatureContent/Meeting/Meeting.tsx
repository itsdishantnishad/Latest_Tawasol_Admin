import * as React from 'react';
import styles from './Meeting.module.scss';

export interface IMeeting {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    isFeatured?: boolean;
}

export interface IMeetingProps {
    meetings?: IMeeting[];
    onViewAll?: () => void;
}

const defaultMeetings: IMeeting[] = [
    {
        id: '1',
        title: 'Weekly project update',
        date: 'Today, 03:00 PM',
        time: '03:00 PM',
        location: '11th Floor, Vision Tower'
    },
    {
        id: '2',
        title: 'Daily Stand-up meeting',
        date: '23 Aug, 01:00 PM',
        time: '01:00 PM',
        location: '11th Floor, Vision Tower'
    },
    {
        id: '3',
        title: 'All hands meeting',
        date: '24 Aug, 03:00 PM',
        time: '03:00 PM',
        location: '11th Floor, Vision Tower',
        isFeatured: true
    },
    {
        id: '4',
        title: 'Daily Stand-up meeting',
        date: '23 Aug, 01:00 PM',
        time: '01:00 PM',
        location: '11th Floor, Vision Tower'
    },
    {
        id: '5',
        title: 'Weekly project update',
        date: 'Today, 03:00 PM',
        time: '03:00 PM',
        location: '11th Floor, Vision Tower'
    },
];

export const Meeting: React.FC<IMeetingProps> = (props) => {
    const meetings = props.meetings || defaultMeetings;
    const [currentIndex, setCurrentIndex] = React.useState(2); // Start with featured in center

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < meetings.length - 1 ? prev + 1 : prev));
    };

    return (
        <div className={styles.meetingContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.decorativeLineLeft}>
                        <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="9" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg>
                    </div>
                    <h2 className={styles.title}>See your Meetings Scheduled</h2>
                    <div className={styles.decorativeLineRight}>
                        <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Connect, collaborate, and drive decisions together
                </p>
            </div>

            {/* Carousel */}
            <div className={styles.carouselContainer}>
                <div className={styles.carousel}>
                    {meetings.map((meeting, index) => {
                        const offset = index - currentIndex;
                        const isActive = index === currentIndex;

                        return (
                            <div
                                key={meeting.id}
                                className={`${styles.meetingCard} ${isActive ? styles.active : ''}`}
                                style={{
                                    transform: `translateX(${offset * 320}px) scale(${isActive ? 1 : 0.85})`,
                                    opacity: Math.abs(offset) > 2 ? 0 : isActive ? 1 : 0.5,
                                    zIndex: isActive ? 10 : 5 - Math.abs(offset),
                                }}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.dateTime}>
                                        <div className={styles.date}>{meeting.date.split(',')[0]}</div>
                                        <div className={styles.time}>{meeting.time}</div>
                                    </div>
                                    <div className={styles.location}>{meeting.location}</div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h3 className={styles.meetingTitle}>{meeting.title}</h3>
                                    <button className={styles.joinButton}>Join</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
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

export default Meeting;

