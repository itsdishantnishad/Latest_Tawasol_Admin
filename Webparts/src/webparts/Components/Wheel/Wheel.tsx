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
    {
        id: "about_dhre",
        title: "About DHRE",
        subtitle: "Journey through DHRE",
        icon: "",
    },
];

interface FeatureWheelProps {
    onFeatureSelect: (featureId: string) => void;
    selectedFeature: string;
}

const Wheel: React.FC<FeatureWheelProps> = ({ onFeatureSelect, selectedFeature }) => {
    const selectedIndex = features.findIndex((f) => f.id === selectedFeature);
    const totalFeatures = features.length;
    // Create an array of cards showing all features
    const getVisibleCards = () => {
        const visibleCards = [];
        // Show all features positioned around the wheel
        for (let i = 0; i < totalFeatures; i++) {
            // Calculate position relative to selected feature
            let relativePosition = i - selectedIndex;
            // Normalize to -totalFeatures/2 to totalFeatures/2 range
            if (relativePosition > totalFeatures / 2) {
                relativePosition -= totalFeatures;
            } else if (relativePosition < -totalFeatures / 2) {
                relativePosition += totalFeatures;
            }
            visibleCards.push({
                ...features[i],
                position: relativePosition,
                actualIndex: i,
            });
        }
        return visibleCards;
    };

    const handleCardClick = (featureId: string) => {
        onFeatureSelect(featureId);
    };

    const visibleCards = getVisibleCards();
    // Calculate max position once for angle normalization
    const maxPosition = Math.max(...visibleCards.map(c => Math.abs(c.position)));

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
        about_dhre: styles.aboutDhreCard
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
                    // Only allow clicks on selected card and immediate neighbors (left: -1, right: +1)
                    const isClickable = Math.abs(position) <= 1;

                    // Calculate arc position
                    // Distribute all features across the arc
                    const startAngle = -100;
                    const endAngle = 100;
                    const angleRange = endAngle - startAngle;
                    // Normalize position to 0-1 range, then map to angle range
                    const normalizedPosition = (position + maxPosition) / (maxPosition * 2);
                    const angle = startAngle + angleRange * normalizedPosition;

                    // Arc radius
                    const radius = 650;
                    const radians = (angle * Math.PI) / 180;
                    const x = Math.sin(radians) * radius;
                    const y = -Math.cos(radians) * radius + radius + 10;

                    // Card rotation to follow arc
                    const cardRotation = angle;
                    const scale = isSelected ? 1.05 : 1;

                    return (
                        <button
                            key={card.id}
                            onClick={() => isClickable && handleCardClick(card.id)}
                            disabled={!isClickable}
                            className={styles.card}
                            style={{
                                transform: `translate(calc(-50% + ${x}px), ${y}px) rotate(${cardRotation}deg) scale(${scale})`,
                                pointerEvents: isClickable ? 'auto' : 'none',
                                cursor: isClickable ? 'pointer' : 'default',
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
