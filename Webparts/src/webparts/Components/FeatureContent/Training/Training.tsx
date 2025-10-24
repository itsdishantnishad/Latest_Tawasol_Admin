import * as React from 'react';
import styles from './Training.module.scss';
// import leftHeadingLine from "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg";
const rightHeadingLine: string = require("../images/rightArrow.svg");
const leftHeadingLine: string = require("../images/leftArrow.svg");

export interface ITraining {
    id: string;
    title: string;
    description: string;
    image: string;
    duration?: string;
    level?: string;
    url: string;
}

export interface ITrainingProps {
    trainings?: ITraining[];
    onViewAll?: () => void;
    seeAllURL?: string;
}

const defaultTrainings: ITraining[] = [
    {
        id: '1',
        title: 'Leadership Development',
        description: 'Master essential leadership skills to drive team success and organizational growth.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
        duration: '8 weeks',
        level: 'Intermediate',
        url: '#'
    },
    {
        id: '2',
        title: 'Technical Skills Workshop',
        description: 'Enhance your technical expertise with hands-on training and real-world projects.',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
        duration: '4 weeks',
        level: 'Advanced',
        url: '#'
    },
    {
        id: '3',
        title: 'Communication Excellence',
        description: 'Develop effective communication strategies to improve workplace collaboration.',
        image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
        duration: '6 weeks',
        level: 'Beginner',
        url: '#'
    },
    {
        id: '4',
        title: 'Project Management Fundamentals',
        description: 'Learn proven methodologies to plan, execute, and deliver successful projects.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
        duration: '10 weeks',
        level: 'Intermediate',
        url: '#'
    },
];

export const Training: React.FC<ITrainingProps> = (props) => {
    const trainings = props.trainings || defaultTrainings;

    return (
        <div className={styles.trainingContainer}>
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
                    <h2 className={styles.title}>Training & Development</h2>
                    <div className={styles.decorativeLineRight}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={leftHeadingLine} alt="left headline line" />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Grow skills, unlock new doors
                </p>
            </div>

            {/* Training Grid */}
            <div className={styles.trainingGrid}>
                {trainings.map((training) => (
                    <a
                        key={training.id}
                        href={training.url}
                        className={styles.trainingCard}
                    >
                        <div className={styles.imageContainer}>
                            <img src={training.image} alt={training.title} className={styles.trainingImage} />
                            <div className={styles.imageOverlay} />
                            {training.level && (
                                <span className={styles.levelBadge}>{training.level}</span>
                            )}
                        </div>
                        <div className={styles.trainingInfo}>
                            <h3 className={styles.trainingTitle}>
                                {training.title}
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.arrowIcon}>
                                    <path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </h3>
                            <p className={styles.trainingDescription}>{training.description}</p>
                            {training.duration && (
                                <div className={styles.duration}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 4V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {training.duration}
                                </div>
                            )}
                        </div>
                    </a>
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

export default Training;

