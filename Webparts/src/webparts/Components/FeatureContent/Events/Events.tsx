import * as React from 'react';
import styles from './Events.module.scss';
// import leftHeadingLine from "../images/leftArrow.svg"
// import rightHeadingLine from "../images/rightArrow.svg"
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

export interface IEvent {
    id: string;
    title: string;
    time: string;
    category: string;
    image: string;
    date: {
        day: string;
        month: string;
    };
    status: 'registered' | 'past' | 'upcoming';
    eventStartTime?: string;
}

export interface IEventsProps {
    events?: IEvent[];
    onViewAll?: () => void;
    seeAllURL?: string;
}

const defaultEvents: IEvent[] = [
    {
        id: '1',
        title: 'Annual Company Milestone',
        time: '3:00-4:00 PM',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
        date: {
            day: '24',
            month: 'JUL'
        },
        status: 'registered'
    },
    {
        id: '2',
        title: 'Live AI Workshop',
        time: '3:00-4:00 PM',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400',
        date: {
            day: '24',
            month: 'JUL'
        },
        status: 'past'
    },
    {
        id: '3',
        title: 'Live Music & Conferences',
        time: '3:00-4:00 PM',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        date: {
            day: '24',
            month: 'JUL'
        },
        status: 'registered',
        eventStartTime: 'Event starting in 14:59:00'
    },
    {
        id: '4',
        title: 'Basketball Club',
        time: '3:00-4:00 PM',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
        date: {
            day: '24',
            month: 'JUL'
        },
        status: 'registered',
        eventStartTime: 'Event starting in 14:59:00'
    },
];

export const Events: React.FC<IEventsProps> = (props) => {
    const events = props.events || defaultEvents;

    return (
        <div className={styles.eventsContainer}>
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
                    <h2 className={styles.title}>Upcoming events</h2>
                    <div className={styles.decorativeLineRight}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={leftHeadingLine} alt="leftArrow" />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Stay updated and never miss out on what’s happening
                </p>
            </div>

            {/* Events Grid */}
            <div className={styles.eventsGrid}>
                {events.map((event) => (
                    <div key={event.id} className={styles.eventCard}>
                        <div className={styles.eventImage} style={{ backgroundImage: `url(${event.image})` }}>
                            <div className={styles.statusBadge}>
                                {event.status === 'registered' && (
                                    <span className={styles.registeredBadge}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="8" fill="#10B981" />
                                            <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Registered
                                    </span>
                                )}
                            </div>
                            <div className={styles.dateBadge}>
                                <div className={styles.day}>{event.date.day}</div>
                                <div className={styles.month}>{event.date.month}</div>
                            </div>
                            <div className={styles.categoryBadge}>{event.category}</div>
                        </div>
                        <div className={styles.eventContent}>
                            <h3 className={styles.eventTitle}>{event.title}</h3>
                            <p className={styles.eventTime}>{event.time}</p>
                            {event.status === 'past' && (
                                <p className={styles.pastEvent}>Past Event</p>
                            )}
                            {event.eventStartTime && (
                                <p className={styles.startingTime}>{event.eventStartTime}</p>
                            )}
                            {event.status === 'registered' && !event.eventStartTime && (
                                <button className={styles.registerButton}>Register</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Button */}
            <div className={styles.buttonContainer}>
                <a href={props.seeAllURL} className={styles.viewAllButton}>
                    View All
                </a>
                {/* <button className={styles.viewAllButton} onClick={props.onViewAll}>
                    View All
                </button> */}
            </div>
        </div>
    );
};

export default Events;

