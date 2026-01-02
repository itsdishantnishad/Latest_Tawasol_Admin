import * as React from 'react';
import styles from './Gallery.module.scss';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import ConditionalLink from '../ConditionalLink/ConditionalLink';

export interface IGalleryProps {
  images?: IGalleryImage[];
  onViewAll?: () => void;
  seeAllURL?: string;
  // Strong typing possible with WebPartContext; using any for now:
  context: any;
}

export interface IGalleryImage {
  id: string;
  url: string;
  alt?: string;
}

/**
 * Local gallery images – files:
 *  ./images/1.jpg ... ./images/9.jpg
 */
const img1: string = require('./assets/1.jpg');
const img2: string = require('./assets/2.jpg');
const img3: string = require('./assets/3.jpg');
const img4: string = require('./assets/4.jpg');
const img5: string = require('./assets/5.jpg');
const img6: string = require('./assets/6.jpg');
const img7: string = require('./assets/7.jpg');
const img8: string = require('./assets/8.jpg');
// const img9: string = require('./assets/9.jpg');

// Default gallery images (ordered 1 → 9)
const defaultImages: IGalleryImage[] = [
  { id: '1', url: img1, alt: 'Group photo at Eid Al Etihad event' },
  { id: '2', url: img2, alt: 'Guests talking near Dubai Holding Real Estate signage' },
  { id: '3', url: img3, alt: 'Dubai Holding Real Estate sign at event' },
  { id: '4', url: img4, alt: 'Wide view of event with Burj Al Arab in background' },
  { id: '5', url: img5, alt: 'Women preparing traditional items at a table' },
  { id: '6', url: img6, alt: 'Two women posing by Eid Al Etihad backdrop' },
  { id: '7', url: img7, alt: 'Audience seated facing stage at outdoor event' },
  { id: '8', url: img8, alt: 'Mascot posing with a child at the event' },
  //   { id: '9', url: img9, alt: 'Children with face paint posing for a photo' }
];

export const Gallery: React.FC<IGalleryProps> = (props) => {
  const images = props.images || defaultImages;

  // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, '');
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || '').trim();

    // If nothing configured, default to a page in the current site:
    //   /sites/ThisSite/SitePages/Image-Gallery.aspx
    const raw = configured || 'SitePages/Image-Gallery.aspx';

    // Absolute URL -> keep path, move to current tenant origin
    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    // Root-relative (/sites/YourSite/SitePages/Page.aspx)
    if (raw.startsWith('/')) {
      return `${origin}${raw}`;
    }

    // Web-relative (SitePages/Page.aspx)
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.imageGrid}>
        {/* First Row – images 1–4 */}
        <div className={styles.row}>
          {images.slice(0, 4).map((image, index) => (
            <div
              key={image.id}
              className={`${styles.imageItem} ${index === 0 || index === 3 ? styles.shortImage : styles.tallImage
                }`}
            >
              <img src={image.url} alt={image.alt || `Gallery image ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Second Row – images 5–8 */}
        <div className={styles.row}>
          {images.slice(4, 8).map((image, index) => (
            <div
              key={image.id}
              className={`${styles.imageItem} ${index === 0 || index === 3 ? styles.shortImage : styles.tallImage
                }`}
            >
              <img src={image.url} alt={image.alt || `Gallery image ${index + 5}`} />
            </div>
          ))}
        </div>

        {/* Third Row – image 9 (full width, if present) */}
        {images[8] && (
          <div className={styles.row}>
            <div className={`${styles.imageItem} ${styles.shortImage}`}>
              <img
                src={images[8].url}
                alt={images[8].alt || 'Gallery image 9'}
              />
            </div>
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className={styles.buttonContainer}>
        <ConditionalLink to={viewAllHref}>
          <PrimaryButton label='View All' />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Gallery;
