import * as React from 'react';
import styles from './card.module.scss';


export const CardTitle: React.FC = () => {
  return (
    <div className={styles.eventsCard}>
      {/* Decorative Icons */}
      <div className={`${styles.icon} ${styles.iconTopLeft}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 15h6" />
        </svg>
      </div>
      
      <div className={`${styles.icon} ${styles.iconTop}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      </div>
      
      <div className={`${styles.icon} ${styles.iconLeft}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
        </svg>
      </div>
      
      <div className={`${styles.icon} ${styles.iconRight}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </div>
      
      <div className={`${styles.icon} ${styles.iconBottomRight}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      
      <div className={`${styles.icon} ${styles.iconCenter}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titleEvents}>Events</span>
          <span className={styles.titleAnd}> & </span>
          <span className={styles.titleTrainings}>Trainings</span>
        </h1>
        <p className={styles.description}>
          Navigate through our exclusive events. Find the ones that excite you and become the part of the experience.
        </p>
      </div>

      {/* Decorative waves */}
      <div className={styles.waveTop}></div>
      <div className={styles.waveBottom}></div>
    </div>
  );
};