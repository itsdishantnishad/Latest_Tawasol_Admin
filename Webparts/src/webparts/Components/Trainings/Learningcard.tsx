import * as React from 'react';
import styles from './LearningLinks.module.scss';

export interface ILearningLink {
  id: number;
  title: string;
  logo: string;
  logoAlt: string;
  url: string;
  backgroundColor?: string;
}

export interface ILearningLinksProps {
  title?: string;
  description?: string;
  links: ILearningLink[];
}

export const LearningLinks: React.FC<ILearningLinksProps> = ({
  title = "Learning Links",
  description = "Enhance your knowledge with our learning links.",
  links
}) => {
  const handleLinkClick = (url: string, linkTitle: string) => {
    console.log(`Navigating to: ${linkTitle} - ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.learningLinks}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      {/* Links Grid */}
      <div className={styles.linksGrid}>
        {links.map((link) => (
          <div 
            key={link.id} 
            className={styles.linkCard}
            onClick={() => handleLinkClick(link.url, link.title)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLinkClick(link.url, link.title);
              }
            }}
          >
            {/* Logo Section */}
            <div 
              className={styles.logoContainer}
            >
              <img 
                src={link.logo} 
                alt={link.logoAlt} 
                className={styles.logo}
              />
            </div>

            {/* Title Section */}
            <div className={styles.linkTitle}>
              <h3>{link.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};