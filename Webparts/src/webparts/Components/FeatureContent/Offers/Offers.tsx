import * as React from 'react';
import styles from './Offers.module.scss';
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

export interface IOffer {
    id: string;
    title: string;
    location: string;
    discount: string;
    image: string;
    category: string;
    isFavorite?: boolean;
    url: string;
}

export interface IOffersProps {
    offers?: IOffer[];
    onViewAll?: () => void;
    seeAllURL?: string;
}

const defaultOffers: IOffer[] = [
    {
        id: '1',
        title: 'Al Mandhar',
        location: 'Jumeirah Al Qasar',
        discount: 'Upto 50% Discount',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
        category: 'Food',
        isFavorite: false,
        url: '#'
    },
    {
        id: '2',
        title: 'Al Mandhar',
        location: 'Jumeirah Al Qasar',
        discount: 'Upto 50% Discount',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        category: 'Restaurant',
        isFavorite: false,
        url: '#'
    },
    {
        id: '3',
        title: 'Al Mandhar',
        location: 'Jumeirah Al Qasar',
        discount: 'Upto 50% Discount',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
        category: 'Travel',
        isFavorite: true,
        url: '#'
    },
    {
        id: '4',
        title: 'Al Mandhar',
        location: 'Jumeirah Al Qasar',
        discount: 'Upto 50% Discount',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        category: 'Food',
        isFavorite: false,
        url: '#'
    },
    {
        id: '5',
        title: 'Al Mandhar',
        location: 'Jumeirah Al Qasar',
        discount: 'Upto 50% Discount',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        category: 'Food',
        isFavorite: false,
        url: '#'
    },
];

export const Offers: React.FC<IOffersProps> = (props) => {
    const offers = props.offers || defaultOffers;
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : offers.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < offers.length - 1 ? prev + 1 : 0));
    };
    console.log(handlePrev)
    console.log(handleNext)
    const getVisibleOffers = () => {
        const visible = [];
        for (let i = -2; i <= 2; i++) {
            const index = (currentIndex + i + offers.length) % offers.length;
            visible.push({ ...offers[index], offset: i });
        }
        return visible;
    };

    const visibleOffers = getVisibleOffers();

    return (
        <div className={styles.offersContainer}>
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
                    <h2 className={styles.title}>Get Offers & Discounts</h2>
                    <div className={styles.decorativeLineRight}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={leftHeadingLine} alt="left headline line" />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Save more with benefits designed for you
                </p>
            </div>

            {/* Carousel */}
            <div className={styles.carouselContainer}>
                <div className={styles.carousel}>
                    {visibleOffers.map((offer, index) => {
                        const isActive = offer.offset === 0;
                        const absOffset = Math.abs(offer.offset);

                        return (
                            <div
                                key={`${offer.id}-${index}`}
                                className={`${styles.offerCard} ${isActive ? styles.active : ''}`}
                                style={{
                                    transform: `translateX(${offer.offset * 320}px) scale(${isActive ? 1 : 0.85}) rotate(${offer.offset * 5}deg)`,
                                    opacity: absOffset > 1 ? 0.3 : 1,
                                    zIndex: 5 - absOffset,
                                }}
                            >
                                <div className={styles.imageWrapper}>
                                    <img src={offer.image} alt={offer.title} className={styles.offerImage} />
                                    <div className={styles.cardOverlay}>
                                        <span className={styles.categoryBadge}>{offer.category}</span>
                                        <button className={styles.favoriteButton}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill={offer.isFavorite ? "#DC2626" : "none"} stroke={offer.isFavorite ? "#DC2626" : "white"} strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.offerInfo}>
                                    <h3 className={styles.offerTitle}>{offer.title}</h3>
                                    <p className={styles.offerLocation}>{offer.location}</p>
                                    <p className={styles.offerDiscount}>{offer.discount}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
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

export default Offers;

