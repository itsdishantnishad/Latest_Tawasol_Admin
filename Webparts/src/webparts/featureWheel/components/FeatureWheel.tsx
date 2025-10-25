import * as React from 'react';
import { useState } from 'react';
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
// const leftHeadingLine: string = require("../images/leftArrow.svg");
// const rightHeadingLine: string = require("../images/rightArrow.svg");

const FeatureWheelHeader = ({ header, subHeader }: { header: string, subHeader: string }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.decorativeLineLeft}>
          {/* <img src={rightHeadingLine} alt="rightArrow" /> */}
        </div>
        <h2 className={styles.title}>{header}</h2>
        <div className={styles.decorativeLineRight}>
          {/* <img src={leftHeadingLine} alt="leftArrow" /> */}
        </div>
      </div>
      <p className={styles.subtitle}>
        {subHeader}
      </p>
    </div>
  );
};

const FeatureWheel: React.FC<IFeatureWheelProps> = (props: any) => {
  const [selectedFeature, setSelectedFeature] = useState('dashboard');

  const handleViewAll = () => {
    // Handle view all action - can navigate to appropriate page
    console.log('View all clicked for:', selectedFeature);
  };

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case 'gallery':
        return <Gallery onViewAll={handleViewAll} />
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
    }
  };

  return (
    <div className={styles.featureWheelContainer}>
      <section className={styles.wheelSection}>
        <Wheel
          selectedFeature={selectedFeature}
          onFeatureSelect={setSelectedFeature}
        />
      </section>
      <FeatureWheelHeader
        header="A Glimpse through our lens"
        subHeader="Recent milestones and cherished memories we've Immortalised"
      />
      {renderFeatureContent()}
    </div>
  );
};

export default FeatureWheel;
