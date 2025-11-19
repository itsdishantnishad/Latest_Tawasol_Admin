import * as React from 'react';
import styles from './AboutDHRE.module.scss';


export const AboutDHRE: React.FC = (props) => {
    return (
        <div className={styles.aboutDhreCard}>   
            {/* <div className={styles.trainingInfo}>
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
            </div> */}
            {/* View All Button */}
            <div>
                <button>
                    View All
                </button>
            </div>
        </div>
    );
};

export default AboutDHRE;

