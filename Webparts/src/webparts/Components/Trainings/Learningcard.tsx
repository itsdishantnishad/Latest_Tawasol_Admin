// import * as React from 'react';
// import styles from './LearningLinks.module.scss';

// export interface ILearningLink {
//   id: number;
//   title: string;
//   logo: string; // expected to be a URL/path to the image
//   logoAlt: string;
//   url: string;
//   backgroundColor?: string;
// }

// export interface ILearningLinksProps {
//   title?: string;
//   description?: string;
//   links: ILearningLink[];
// }

// export const LearningLinks: React.FC<ILearningLinksProps> = ({
//   title = "Learning Links",
//   description = "Enhance your knowledge with our learning links.",
//   links
// }) => {
//   const handleLinkClick = (url: string, linkTitle: string) => {
//     // keep this for debugging if you want, or remove in production
//     console.log(`Navigating to: ${linkTitle} - ${url}`);
//     window.open(url, '_blank', 'noopener,noreferrer');
//   };

//   const handleKeyDown = (e: React.KeyboardEvent, url: string, linkTitle: string) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault();
//       handleLinkClick(url, linkTitle);
//     }
//   };

//   return (
//     <div className={styles.learningLinks}>
//       <div className={styles.header}>
//         <h1 className={styles.title}>{title}</h1>
//         <p className={styles.description}>{description}</p>
//       </div>

//       <div className={styles.linksGrid}>
//         {links.map((link) => {

//           return (
//             <div
//               key={link.id}
//               className={styles.linkCard}
//               role="button"
//               tabIndex={0}
//               aria-label={`Open learning link: ${link.title}`}
//               onClick={() => handleLinkClick(link.url, link.title)}
//               onKeyDown={(e) => handleKeyDown(e, link.url, link.title)}
//             >
//               <div
//                 className={styles.logoContainer}
//                 style={{ backgroundColor: link.backgroundColor }}
//               >
//                 {link.logo && (
//                   <img
//                     src={link.logo}
//                     alt={link.logoAlt}
//                     className={styles.logoImage}
//                     loading="lazy"
//                   />
//                 )}
//               </div>

//               {/* <div className={styles.linkTitle}>
//                 <h3>{link.title}</h3>
//               </div> */}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
// export default LearningLinks;



import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './LearningLinks.module.scss';

export const LearningLinks: React.FC<any> = ({ title, description, links }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.learningLinks}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.linksGrid}>
        {links.map((link: any) => {
          const isLogoType = !!link.backgroundColor;

          return (
            <div 
              key={link.id} 
              className={`${styles.linkCard} ${isLogoType ? styles.isLogoType : styles.isContentType}`} 
              onClick={() => window.open(link.url, '_blank')}
            >
              {isMobile ? (
                <div 
                  className={styles.logoContainer} 
                  style={isLogoType ? { backgroundColor: link.backgroundColor } : {}}
                >
                  <img src={link.logo} alt={link.logoAlt} className={styles.logoImage} />
                </div>
              ) : (
                <div className={styles.logoContainer} style={{ backgroundColor: link.backgroundColor }}>
                  {link.logo && (
                    <img src={link.logo} alt={link.logoAlt} className={styles.logoImage} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningLinks;