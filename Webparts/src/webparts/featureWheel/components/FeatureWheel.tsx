import React, { useState } from 'react';
import type { IFeatureWheelProps } from './IFeatureWheelProps';
import Wheel from '../../Components/Wheel/Wheel';
import Gallery from '../../Components/Gallery/Gallery';
import styles from './FeatureWheel.module.scss';

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

      {/* Gallery Section */}
      <section className={styles.gallerySection}>
        <Gallery onViewAll={handleViewAll} />
      </section>
    </div>
  );
};

export default FeatureWheel;
