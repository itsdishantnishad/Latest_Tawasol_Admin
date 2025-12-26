// src/webparts/featureWheel/components/FeatureWheel.tsx

import * as React from "react";
import { useState } from "react";
import type { IFeatureWheelProps } from "./IFeatureWheelProps";

import Wheel from "../../Components/Wheel/Wheel";
import Gallery from "../../Components/Gallery/Gallery";
import Documents from "../../Components/FeatureContent/Documents/Documents";
import Events from "../../Components/FeatureContent/Events/Events";
import LetsCelebrate from "../../Components/FeatureContent/LetsCelebrate/LetsCelebrate";
import Meeting from "../../Components/FeatureContent/Meeting/Meeting";
import ServiceLinks from "../../Components/FeatureContent/ServiceLinks/ServiceLinks";
import Forms from "../../Components/FeatureContent/Forms/Forms";
import Dashboard from "../../Components/FeatureContent/Dashboard/Dashboard";
import Offers from "../../Components/FeatureContent/Offers/Offers";
import Training from "../../Components/FeatureContent/Training/Training";
import AboutDHRE from "../../Components/FeatureContent/AboutDHRE/AboutDHRE";
import TaskApprovals from "../../Components/FeatureContent/TaskApprovals/TaskApprovals";
import BeverageMenu from "../../Components/FeatureContent/BeverageMenu/BeverageMenu";

import styles from "./FeatureWheel.module.scss";

const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

const leftHeadingLineMobile: string = require("../images/leftArrowMobile.svg");
const rightHeadingLineMobile: string = require("../images/rightArrowMobile.svg");

interface FeatureTitleProps {
  header: string;
  subHeader: string;
}

const FeatureTitle: React.FC<FeatureTitleProps> = ({ header, subHeader }) => {
  return (
    <div className={styles.titleContainer}>
      <div className={styles.headerContent}>
        <img src={rightHeadingLine} alt="" className={styles.desktopImage} />
        <img src={rightHeadingLineMobile} alt="" className={styles.mobImage} />
        <h2 className={styles.title}>{header}</h2>
        <img src={leftHeadingLine} alt="" className={styles.desktopImage} />
        <img src={leftHeadingLineMobile} alt="" className={styles.mobImage} />
      </div>
      <div className={styles.subtitle}>{subHeader}</div>
    </div>
  );
};

const featureTitleContent: Record<string, { header: string; subHeader: string }> = {
  gallery: {
    header: "A Glimpse through our lens",
    subHeader: "Recent milestones and cherished memories we've Immortalised",
  },
  documents: {
    header: "Policies and Procedures",
    subHeader: "Everything you need, neatly organized",
  },
  events: {
    header: "Upcoming events",
    subHeader: "Stay updated and never miss out on what’s happening",
  },
  employee_events: {
    header: "Let’s Celebrate",
    subHeader: "Wish your peers on their special day",
  },
  meetings: {
    header: "See your Meetings Scheduled",
    subHeader: "Connect, collaborate, and drive decisions together",
  },
  service_links: {
    header: "Service Links",
    subHeader: "Quickly access your most used service links",
  },
  forms: {
    header: "Interactive Forms",
    subHeader: "All your essential forms – legacy, claims, business excellence, and more",
  },
  about_dhre: {
    header: "About DHRE",
    subHeader: "Dive deep into DHRE: Our departments, culture, and core values.",
  },
  tasks: {
    header: "Task Approvals",
    subHeader: "Streamline your work to accomplish more, faster.",
  },
  beverage_menu: {
    header: "Beverage Menu",
    subHeader: "Find your favourite drink to fuel your day",
  },
  dashboard: {
    header: "Dashboard",
    subHeader: "Track everything at a glance – insights made simple!",
  },
  offers: {
    header: "Offers & Benefits",
    subHeader: "Save more with benefits designed for you",
  },
  training: {
    header: "Enroll Yourself in Upcoming Trainings",
    subHeader: "Grow your skills with tailored learning sessions",
  },
};

const FeatureWheel: React.FC<IFeatureWheelProps> = (props) => {
  const [selectedFeature, setSelectedFeature] = useState<string>("gallery");

  const handleViewAll = () => {
    console.log("View all clicked for:", selectedFeature);
  };

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case "gallery":
        return <Gallery context={props.context} seeAllURL={props.imageGallery} onViewAll={handleViewAll} />;

      case "documents":
        return <Documents seeAllURL={props.documents} onViewAll={handleViewAll} />;

      case "events":
        return (
          <Events
            context={props.context}
            seeAllURL={props.upcomingEvents}
            onViewAll={handleViewAll}
            listTitle="Site Pages"
            topCount={4}
          />
        );

      case "employee_events":
        return <LetsCelebrate context={props.context} seeAllURL={props.letsCelebrate} onViewAll={handleViewAll} />;

      case "meetings":
        return <Meeting context={props.context} seeAllURL={props.meeting} onViewAll={handleViewAll} />;

      case "service_links":
        return <ServiceLinks context={props.context} />;

      case "forms":
        return <Forms seeAllURL={props.interactiveForms} onViewAll={handleViewAll} />;

      case "about_dhre":
        return <AboutDHRE context={props.context} />;

      case "tasks":
        return <TaskApprovals context={props.context} seeAllURL={props.taskApprovals} />;

      case "beverage_menu":
        return <BeverageMenu context={props.context} seeAllURL={props.beverageMenu} />;

      case "dashboard":
        return <Dashboard context={props.context} seeAllURL={props.dashboard} onViewAll={handleViewAll} />;

      case "offers":
        return <Offers seeAllURL={props.getOffersAndDiscounts} onViewAll={handleViewAll} />;

      case "training":
        return (
          <Training
            context={props.context}
            seeAllURL={props.trainingAndDevelopment}
            topCount={4}
            listTitle="Site Pages"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.featureWheelContainer}>
      <div className={styles.headingSection}>
        <h1>
          <span>Tawasol</span>, The smarter way to stay connected
        </h1>
        <h6>Scroll to see all the menus under Tawasol</h6>
      </div>

      <section className={styles.wheelSection}>
        <Wheel selectedFeature={selectedFeature} onFeatureSelect={setSelectedFeature} />
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
