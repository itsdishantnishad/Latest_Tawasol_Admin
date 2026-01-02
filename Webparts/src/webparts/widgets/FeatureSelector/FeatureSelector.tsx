import React from "react";
import styles from "./FeatureSelector.module.scss";
import { Feature } from "../../featureWheel/components/FeatureWheel";

interface FeatureSelectorProps {
  features: Feature[];
  onFeatureSelect: (featureId: string) => void;
  selectedFeature: string;
}

interface CardPosition {
  rotation: number;
  translateY: number;
}

const calculateCardPosition = (
  index: number,
  totalCards: number
): CardPosition => {
  const angle = 15.25;
  const arcSpan = angle * 2;
  const baseMaxAngleFromCenter = 15.25;
  const baseMaxTranslateY = 90;
  const progress = totalCards > 1 ? index / (totalCards - 1) : 0;
  const rotation = progress * arcSpan - angle;
  const maxAngleFromCenter = Math.abs(arcSpan) / 2;
  const angleFromCenter = Math.abs(rotation);
  const normalizedRotation = angleFromCenter / maxAngleFromCenter;
  const maxTranslateY =
    baseMaxTranslateY * (maxAngleFromCenter / baseMaxAngleFromCenter);
  const power = 2.2;
  const translateY = maxTranslateY * Math.pow(normalizedRotation, power);

  return {
    rotation,
    translateY,
  };
};

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
  about_dhre: styles.aboutDhreCard,
  tasks: styles.tasksCard,
  beverage_menu: styles.beverageCard,
};

const FeatureSelector: React.FC<FeatureSelectorProps> = ({
  features,
  onFeatureSelect,
  selectedFeature,
}) => {
  return (
    <div className={styles.featureSelector}>
      {features.map((feature, i) => {
        const position = calculateCardPosition(i, features.length);
        const isSelected = feature.id === selectedFeature;

        return (
          <div
            role="button"
            tabIndex={0}
            key={feature.id}
            onClick={() => onFeatureSelect(feature.id)}
            className={`
              ${styles.card}
              ${bgClassById[feature.id]}
              ${isSelected ? styles.cardSelected : ""}
            `}
            style={
              {
                "--rotation": `${position.rotation}deg`,
                "--translateY": `${position.translateY}px`,
              } as React.CSSProperties
            }
          >
            <div className={styles.cardLabel}>{feature.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureSelector;
