
import * as React from "react";
import styles from "./MainPage.module.scss";

import ProfileHeader from "../LeftSectionComponent/ProflleHeaderComp/ProfileHeaderComp";
import LeftSection from "../LeftSectionComponent/LeftSection/LeftSection";
import RightSection from "../RightSectionComponent/RightSection/RightSection";

export interface IMainPageProps {
  className?: string;
  onNavigateToLeave?: () => void;
  onNavigateToHRLetter?: () => void;
  // onNavigateToHoliday?: () => void;
}

export default class MainPage extends React.Component<IMainPageProps> {
  public render(): React.ReactElement<IMainPageProps> {
    const { onNavigateToLeave, onNavigateToHRLetter} = this.props;

    return (
      <div className={[styles.pageInner, this.props.className || ""].join(" ")}>
        <ProfileHeader />
        <div className={styles.columns}>
          <div className={styles.leftCol} role="region" aria-label="Main feed">
            <LeftSection />
          </div>

          <aside className={styles.rightCol} role="complementary" aria-label="Sidebar widgets">
            <RightSection
              onApplyLeave={onNavigateToLeave}
              onRequestHRLetter={onNavigateToHRLetter}
              // onViewHoliday={onNavigateToHoliday}
            />
          </aside>
        </div>
      </div>
    );
  }
}