import * as React from 'react';
import styles from './LearningLinks.module.scss';

export interface ILearningLink {
  id: number;
  title: string;
  logo: string; // expected to be a URL/path to the image
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
    // keep this for debugging if you want, or remove in production
    console.log(`Navigating to: ${linkTitle} - ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent, url: string, linkTitle: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLinkClick(url, linkTitle);
    }
  };

  return (
    <div className={styles.learningLinks}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.linksGrid}>
        {links.map((link) => {
          // build inline style for the logo container
          const logoStyle: React.CSSProperties = {
            backgroundImage: link.logo ? `url(${link.logo})` : undefined,
            backgroundColor: link.backgroundColor || undefined
          };

          return (
            <div
              key={link.id}
              className={styles.linkCard}
              role="button"
              tabIndex={0}
              aria-label={`Open learning link: ${link.title}`}
              onClick={() => handleLinkClick(link.url, link.title)}
              onKeyDown={(e) => handleKeyDown(e, link.url, link.title)}
            >
              <div
                className={styles.logoContainer}
                style={logoStyle}
                // put the alt text into aria-hidden=false if you want screen readers to read it,
                // but since this is decorative we keep it hidden from AT and rely on the aria-label above.
                aria-hidden={!!link.logo}
              />

              <div className={styles.linkTitle}>
                <h3>{link.title}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LearningLinks;