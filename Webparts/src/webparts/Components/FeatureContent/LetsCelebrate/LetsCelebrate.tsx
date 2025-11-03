import * as React from 'react';
import styles from './LetsCelebrate.module.scss';
// import cakeImage from "../images/Cake.svg";
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");
const cakeImage: string = require("../images/Cake.svg");

export interface ICelebration {
    id: string;
    name: string;
    department?: string;
    date?: string;
    type: 'birthday' | 'anniversary' | 'newJoiner';
    image?: string;
}

export interface ILetsCelebrateProps {
    celebrations?: {
        birthdays: ICelebration[];
        anniversaries: ICelebration[];
        newJoiners: ICelebration[];
    };
    onViewAll?: () => void;
    seeAllURL?: string;
}

const defaultCelebrations = {
    birthdays: [
        { id: '1', name: 'John Doe', department: 'Engineering', date: 'Today', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', name: 'Jane Smith', department: 'Marketing', date: 'Tomorrow', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', name: 'Mike Johnson', department: 'Sales', date: 'Dec 15', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=3' },
        { id: '4', name: 'Sarah Williams', department: 'HR', date: 'Dec 20', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=4' },
    ],
    anniversaries: [
        { id: '5', name: 'Robert Brown', department: 'Engineering', date: '5 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=5' },
        { id: '6', name: 'Emily Davis', department: 'Operations', date: '10 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=6' },
        { id: '7', name: 'David Wilson', department: 'Finance', date: '3 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=7' },
        { id: '8', name: 'Lisa Anderson', department: 'Legal', date: '7 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=8' },
    ],
    newJoiners: [
        { id: '9', name: 'Tom Harris', department: 'Engineering', date: 'This Week', type: 'newJoiner' as const, image: 'https://i.pravatar.cc/150?img=9' },
        { id: '10', name: 'Anna Martin', department: 'Design', date: 'This Week', type: 'newJoiner' as const, image: 'https://i.pravatar.cc/150?img=10' },
    ],
};

export const LetsCelebrate: React.FC<ILetsCelebrateProps> = (props) => {
    const [activeTab, setActiveTab] = React.useState<'birthdays' | 'anniversaries' | 'newJoiners'>('birthdays');
    const celebrations = props.celebrations || defaultCelebrations;

    const tabs = [
        { key: 'birthdays' as const, label: 'Birthdays', count: celebrations.birthdays.length },
        { key: 'anniversaries' as const, label: 'Anniversaries', count: celebrations.anniversaries.length },
        { key: 'newJoiners' as const, label: 'New Joiners', count: celebrations.newJoiners.length },
    ];

    const currentCelebrations = celebrations[activeTab];

    return (
        <div className={styles.celebrateContainer}>

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label} <span className={styles.count}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className={styles.content}>
                {currentCelebrations.length > 0 ? (
                    <div className={styles.celebrationIcon}>
                        {/* Cake emoji as placeholder */}
                        <span className={styles.emoji}>
                            <img src={cakeImage} alt="cake image" />
                        </span>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} to celebrate right now</p>
                    </div>
                )}
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

export default LetsCelebrate;

