import * as React from 'react';
import styles from './Wheel.module.scss';

interface Feature {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
}

const features: Feature[] = [
    {
        id: "gallery",
        title: "Image Gallery",
        subtitle: "Past events images and memories",
        icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg",
    },
    {
        id: "documents",
        title: "Documents",
        subtitle: "All files in one place",
        icon: "",
    },
    {
        id: "events",
        title: "Events",
        subtitle: "Discover whats happening next",
        icon: "",
    },
    {
        id: "employee_events",
        title: "Let’s Celebrate",
        subtitle: "Birthday, anniversary & new joiners",
        icon: "",
    },
    {
        id: "meetings",
        title: "Meeting",
        subtitle: "Connect, discuss, move forward",
        icon: "",
    },
    {
        id: "service_links",
        title: "Service Links",
        subtitle: "Quick access, zero hassle",
        icon: "",
    },
    {
        id: "forms",
        title: "Interactive Forms",
        subtitle: "All interactive forms In one place",
        icon: "",
    },
    {
        id: "dashboard",
        title: "Dashboard",
        subtitle: "Track, analyze, optimize",
        icon: "",
    },
    {
        id: "offers",
        title: "Offers",
        subtitle: "Exclusive deals just for you",
        icon: "",
    },
    {
        id: "training",
        title: "Training",
        subtitle: "Grow skills, unlock new doors",
        icon: "",
    },
];

interface FeatureWheelProps {
    onFeatureSelect: (featureId: string) => void;
    selectedFeature: string;
}

const Wheel = ({ onFeatureSelect, selectedFeature }: FeatureWheelProps) => {
    const selectedIndex = features.findIndex((f) => f.id === selectedFeature);
    const totalFeatures = features.length;
    // Create an infinite array of cards for seamless scrolling
    const getVisibleCards = () => {
        const visibleCards = [];
        // Show 7 cards: 3 before, selected in center, 3 after
        for (let i = -3; i <= 3; i++) {
            const index = (selectedIndex + i + totalFeatures * 300) % totalFeatures;
            visibleCards.push({
                ...features[index],
                position: i,
                actualIndex: index,
            });
        }
        return visibleCards;
    };

    const handleCardClick = (featureId: string) => {
        onFeatureSelect(featureId);
    };

    const visibleCards = getVisibleCards();

    const bgClassById: Record<string, string> = {
        gallery: styles.galleryCard,
        documents: styles.documentsCard,
        events: styles.eventsCard,
        employee_events: styles.celebrateCard,
        meetings: styles.meetingCard,
        service_links: styles.serviceLinksCard,
        forms: styles.interactiveFormsCard,
        dashboard: styles.dashboardCard,
        offers: styles.offersCard,
        training: styles.trainingCard,
    };

    return (
        <div className={styles.wheelContainer}>
            {/* Central arrow pointer */}
            <div className={styles.centralArrow}>
                <div className={styles.arrow} />
            </div>

            {/* Carousel container - cards arranged in an arc */}
            <div className={styles.carouselContainer}>
                {visibleCards.map((card) => {
                    const isSelected = card.position === 0;
                    const position = card.position;

                    // Calculate arc position
                    // Cards at positions: -3, -2, -1, 0, 1, 2, 3
                    const startAngle = -50;
                    const endAngle = 50;
                    const angleRange = endAngle - startAngle;
                    const angle = startAngle + (angleRange / 6) * (position + 3);

                    // Arc radius
                    const radius = 800;
                    const radians = (angle * Math.PI) / 180;
                    const x = Math.sin(radians) * radius;
                    const y = -Math.cos(radians) * radius + radius + 10;

                    // Card rotation to follow arc
                    const cardRotation = angle;

                    // Calculate opacity and blur based on position
                    const absPosition = Math.abs(position);
                    const opacity = absPosition === 3 ? 0.4 : absPosition === 2 ? 0.7 : absPosition === 1 ? 0.9 : 1;
                    const blur =
                        absPosition === 4
                            ? "blur(0px)"
                            : absPosition === 2
                                ? "blur(0px)"
                                : absPosition === 1
                                    ? "blur(0px)"
                                    : "blur(0px)";
                    const scale = isSelected ? 1.05 : 1;

                    return (
                         <button
                            key={`${card.id}-${position}`}
                            onClick={() => handleCardClick(card.id)}
                            className={styles.card}
                            style={{
                                transform: `translate(calc(-50% + ${x}px), ${y}px) rotate(${cardRotation}deg) scale(${scale})`,
                                transformOrigin: "center center",
                                opacity,
                                filter: blur,
                                zIndex: isSelected ? 10 : absPosition === 1 ? 8 : absPosition === 2 ? 5 : absPosition === 3 ? 2 : 0,
                            }}
                        >
                            <div
                                className={`${styles.cardInner} ${bgClassById[card.id] || ""} ${isSelected ? styles.cardSelected : ""}`}
                            >
                                <div className={styles.cardTextContainer}>
                                    <div className={`${styles.cardTitle}`}>
                                        {card.title}
                                    </div>
                                    <div className={`${styles.cardSubtitle}`}>
                                        {card.subtitle}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    )
};

export default Wheel;