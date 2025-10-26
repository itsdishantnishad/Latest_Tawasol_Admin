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

const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

const FeatureTitle = ({ header, subHeader }: { header: string, subHeader: string }) => {
  return (
    <div className={styles.titleContainer}>
      <div className={styles.headerContent}>
        <img src={rightHeadingLine} alt="" />
        <h2 className={styles.title}>{header}</h2>
        <img src={leftHeadingLine} alt="" />
      </div>
      <p className={styles.subtitle}>
        {subHeader}
      </p>
    </div>
  );
};

const featureTitleContent: Record<string, { header: string, subHeader: string }> = {
  gallery: {
    header: "A Glimpse through our lens",
    subHeader: "Recent milestones and cherished memories we've Immortalised"
  },
  documents: {
    header: "Policy and Procedure",
    subHeader: "Everything you need, neatly organized"
  },
  events: {
    header: "Upcoming events",
    subHeader: "Stay updated and never miss out on what’s happening"
  },
  employee_events: {
    header: "Let’s Celebrate",
    subHeader: "Wish your peers on their special day"
  },
  meetings: {
    header: "See your Meetings Scheduled",
    subHeader: "Connect, collaborate, and drive decisions together"
  },
  service_links: {
    header: "Service Links",
    subHeader: "Quickly access your most used service links"
  },
  forms: {
    header: "Interactive Forms",
    subHeader: "All your essential forms – legacy, claims, business excellence, and more"
  },
  dashboard: {
    header: "Dashboard",
    subHeader: "Track everything at a glance – insights made simple!"
  },
  offers: {
    header: "Get Offers & Discounts",
    subHeader: "Save more with benefits designed for you"
  },
  training: {
    header: "Enroll Yourself in Upcoming Trainings",
    subHeader: "Grow your skills with tailored learning sessions"
  }
}

const FeatureWheel: React.FC<IFeatureWheelProps> = (props: any) => {
  const [selectedFeature, setSelectedFeature] = useState('service_links');

  const handleViewAll = () => {
    // Handle view all action - can navigate to appropriate page
    console.log('View all clicked for:', selectedFeature);
  };

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case 'gallery':
        return <Gallery seeAllURL={props.imageGallery} onViewAll={handleViewAll} />
      case 'documents':
        return <Documents seeAllURL={props.documents} onViewAll={handleViewAll} />;
      case 'events':
        return <Events seeAllURL={props.upcomingEvents} onViewAll={handleViewAll} />;
      case 'employee_events':
        return <LetsCelebrate seeAllURL={props.letsCelebrate} onViewAll={handleViewAll} />;
      case 'meetings':
        return <Meeting seeAllURL={props.meeting} onViewAll={handleViewAll} />;
      case 'service_links':
        return <ServiceLinks onViewAll={handleViewAll} />;
      case 'forms':
        return <Forms seeAllURL={props.interactiveForms} onViewAll={handleViewAll} />;
      case 'dashboard':
        return <Dashboard seeAllURL={props.dashboard} onViewAll={handleViewAll} />;
      case 'offers':
        return <Offers seeAllURL={props.getOffersAndDiscounts} onViewAll={handleViewAll} />;
      case 'training':
        return <Training seeAllURL={props.trainingAndDevelopment} onViewAll={handleViewAll} />;
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
      <FeatureTitle
        header={featureTitleContent[selectedFeature].header}
        subHeader={featureTitleContent[selectedFeature].subHeader}
      />
      {renderFeatureContent()}
    </div>
  );
};

export default FeatureWheel;
