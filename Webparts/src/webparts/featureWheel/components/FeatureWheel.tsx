import React, { useState } from 'react';
import type { IFeatureWheelProps } from './IFeatureWheelProps';
import Wheel from '../../Components/Wheel/Wheel';
import Gallery from '../../Components/Gallery/Gallery';
import styles from './FeatureWheel.module.scss';

const FeatureWheelHeader = ({ title, subtitle }: { title: string, subtitle: string }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.decorativeLineLeft}>
          <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
            <circle cx="9" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
          </svg>
        </div>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.decorativeLineRight}>
          <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className={styles.subtitle}>
        {subtitle}
      </p>
    </div>
  );
};

const FeatureWheel: React.FC<IFeatureWheelProps> = (props) => {
  const [selectedFeature, setSelectedFeature] = useState('gallery');

  const handleViewAll = () => {
    // Handle view all action - can navigate to gallery page
    console.log('View all clicked');
  };

  return (
    <div className={styles.featureWheelContainer}>
      {/* Feature Wheel Section */}
      <section className={styles.wheelSection}>
        <Wheel
          selectedFeature={selectedFeature}
          onFeatureSelect={setSelectedFeature}
        />
      </section>

      <section className={styles.gallerySection}>
        <FeatureWheelHeader
          title="A Glimpse through our lens"
          subtitle="Recent milestones and cherished memories we've Immortalised"
        />
        {/* Gallery Section */}
        <Gallery onViewAll={handleViewAll} />
      </section>
    </div>
  );
};

export default FeatureWheel;
