import * as React from 'react';
import styles from './Gallery.module.scss';

export interface IGalleryProps {
    images?: IGalleryImage[];
    onViewAll?: () => void;
    seeAllURL?: string;
}

export interface IGalleryImage {
    id: string;
    url: string;
    alt?: string;
}

// Default placeholder images
const defaultImages: IGalleryImage[] = [
    { id: '1', url: 'https://picsum.photos/id/101/600/400', alt: 'Gallery image 1' },
    { id: '2', url: 'https://picsum.photos/id/102/600/400', alt: 'Gallery image 2' },
    { id: '3', url: 'https://picsum.photos/id/103/600/400', alt: 'Gallery image 3' },
    { id: '4', url: 'https://picsum.photos/id/104/600/400', alt: 'Gallery image 4' },
    { id: '5', url: 'https://picsum.photos/id/109/600/400', alt: 'Gallery image 5' },
    { id: '6', url: 'https://picsum.photos/id/106/600/400', alt: 'Gallery image 6' },
    { id: '7', url: 'https://picsum.photos/id/110/600/400', alt: 'Gallery image 7' },
    { id: '8', url: 'https://picsum.photos/id/108/600/400', alt: 'Gallery image 8' },
];

export const Gallery: React.FC<IGalleryProps> = (props) => {
    const images = props.images || defaultImages;

    // const handleViewAll = () => {
    //     if (props.onViewAll) {
    //         props.onViewAll();
    //     }
    // };

    return (
        <div className={styles.galleryContainer}>
            <div className={styles.imageGrid}>
                {/* First Row */}
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

                {/* Second Row */}
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
            </div>

            {/* View All Button */}
            <div className={styles.buttonContainer}>
                {/* <button className={styles.viewAllButton} onClick={handleViewAll}>
                    View All
                </button> */}
                <a href="https://orgessence.sharepoint.com/sites/IntranetRevampTawasol/SitePages/Event-Gallery.aspx" className={styles.viewAllButton}>
                    View All
                </a>
            </div>
        </div>
    );
};

export default Gallery;

