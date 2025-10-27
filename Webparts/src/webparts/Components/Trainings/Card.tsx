import * as React from 'react';
import styles from './Training.module.scss';

export interface IAllTrainingCardProps {
  imageUrl: string;
  category: string;
  title: string;
  date: string;
  duration: string;
  instructorName: string;
  instructorTitle: string;
  instructorImageUrl: string;
  isRegistered?: boolean;
  onJoin: () => void;
}
export const AllTrainingCard: React.FC<IAllTrainingCardProps> = ({
  imageUrl,
  category,
  title,
  date,
  duration,
  instructorName,
  instructorTitle,
  instructorImageUrl,
  isRegistered = false,
  onJoin
}) => {
  const formatDate = (rawDate: string) => rawDate; // Customize if needed, e.g., parse and reformat

  return (
    <div className={styles.courseCard}>
      {/* Category Label (top-left on image) */}
      <div className={styles.categoryLabel}>{category}</div>
      
      {/* Header Image */}
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.headerImage} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.title}>{title}</h3>

        {/* Date and Duration */}
        <div className={styles.metadata}>
          <span className={styles.date}>{formatDate(date)}</span>
          <span className={styles.duration}>{duration}</span>
        </div>

        {/* Instructor Info */}
        <div className={styles.instructor}>
          <img 
            src={instructorImageUrl} 
            alt={instructorName} 
            className={styles.instructorImage}
          />
          <div className={styles.instructorInfo}>
            <span className={styles.instructorName}>{instructorName}</span>
            <span className={styles.instructorTitle}>{instructorTitle}</span>
          </div>
        </div>

        {/* Join/Registered Button */}
        {/* ${isRegistered ? styles.registered : ''} */}
        <button 
          className={`${styles.joinButton}`}
          onClick={onJoin}
          disabled={isRegistered}
        >
          <div className={styles.outlookIcon}>
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3v10h12V3H2zm0 1h12v8H2V4z"/>
              <path d="M4 6h8v1H4V6zm0 2h8v1H4V8z"/>
            </svg>
          </div>
          {/* {isRegistered ? 'Registered' :  */}
          Join
        </button>

        {/* Info Notice (only if not registered) */}
        {!isRegistered && (
          <div className={styles.infoNotice}>
            <span className={styles.infoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M7.9987 14.6693C11.6806 14.6693 14.6654 11.6845 14.6654 8.0026C14.6654 4.32071 11.6806 1.33594 7.9987 1.33594C4.3168 1.33594 1.33203 4.32071 1.33203 8.0026C1.33203 11.6845 4.3168 14.6693 7.9987 14.6693Z" fill="#2B5FAC"/>
<path d="M8 10.6667V8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 5.33594H8.00667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
            </span>
            <span className={styles.infoText}>
              You will be redirected to Outlook for approval once
            </span>
          </div>
        )}
      </div>
    </div>
  );
};