import * as React from 'react';
import  { useState } from 'react';
import type { IFeatureWheelProps } from './IFeatureWheelProps';
import Wheel from '../../Components/Wheel/Wheel';
import Gallery from '../../Components/Gallery/Gallery';
import Documents from '../../Components/FeatureContent/Documents/Documents';
import Events from '../../Components/FeatureContent/Events/Events';
import LetsCelebrate from '../../Components/FeatureContent/LetsCelebrate/LetsCelebrate';
import Meeting from '../../Components/FeatureContent/Meeting/Meeting';
import ServiceLinks from '../../Components/FeatureContent/ServiceLinks/ServiceLinks';
import Forms from '../../Components/FeatureContent/Forms/Forms';
import Dashboard from '../../Components/FeatureContent/Dashboard/Dashboard';
import Offers from '../../Components/FeatureContent/Offers/Offers';
import Training from '../../Components/FeatureContent/Training/Training';
import styles from './FeatureWheel.module.scss';
// import leftHeadingLine from "../images/leftArrow.svg"
// import rightHeadingLine from "../images/rightArrow.svg"
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

const FeatureWheelHeader = ({ title, subtitle }: { title: string, subtitle: string }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
          <div className={styles.decorativeLineLeft}>
              {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                  <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                  <circle cx="9" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
              </svg> */}
              <img src={rightHeadingLine} alt="rightArrow" />
          </div>
          <h2 className={styles.title}>A Glimpse through our lens</h2>
          <div className={styles.decorativeLineRight}>
              {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                  <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                  <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
              </svg> */}
              <img src={leftHeadingLine} alt="leftArrow" />
          </div>
      </div>
      <p className={styles.subtitle}>
        Recent milestones and cherished memories we've Immortalised
      </p>
    </div>
  );
};

const FeatureWheel: React.FC<IFeatureWheelProps> = (props:any) => {
  const [selectedFeature, setSelectedFeature] = useState('gallery');

  const handleViewAll = () => {
    // Handle view all action - can navigate to appropriate page
    console.log('View all clicked for:', selectedFeature);
  };

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case 'gallery':
        return (
          <section className={styles.gallerySection}>
            <FeatureWheelHeader
              title="A Glimpse through our lens"
              subtitle="Recent milestones and cherished memories we've Immortalised"
            />
            <Gallery onViewAll={handleViewAll} />
          </section>
        );
      case 'documents':
        return <Documents onViewAll={handleViewAll} />;
      case 'events':
        return <Events onViewAll={handleViewAll} />;
      case 'employee_events':
        return <LetsCelebrate onViewAll={handleViewAll} />;
      case 'meetings':
        return <Meeting onViewAll={handleViewAll} />;
      case 'service_links':
        return <ServiceLinks onViewAll={handleViewAll} />;
      case 'forms':
        return <Forms onViewAll={handleViewAll} />;
      case 'dashboard':
        return <Dashboard onViewAll={handleViewAll} />;
      case 'offers':
        return <Offers onViewAll={handleViewAll} />;
      case 'training':
        return <Training onViewAll={handleViewAll} />;
      default:
        return (
          <section className={styles.gallerySection}>
            <FeatureWheelHeader
              title="A Glimpse through our lens"
              subtitle="Recent milestones and cherished memories we've Immortalised"
            />
            <Gallery onViewAll={handleViewAll} />
          </section>
        );
    }
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

      {/* Dynamic Feature Content */}
      {renderFeatureContent()}
    </div>
  );
};

export default FeatureWheel;
