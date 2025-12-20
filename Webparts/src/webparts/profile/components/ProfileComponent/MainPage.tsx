import * as React from "react";
import styles from "./MainPage.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import ProfileHeader from "../ProflleHeaderComp/ProfileHeaderComp";
import LeftSection from "../LeftSectionComponent/LeftSection/LeftSection";
import RightSection from "../RightSectionComponent/RightSection/RightSection";

export interface IMainPageProps {
  className?: string;
  onNavigateToLeave?: () => void;
  onNavigateToHRLetter?: () => void;
  // onNavigateToHoliday?: () => void;
  context: WebPartContext;
}

export default class MainPage extends React.Component<IMainPageProps> {
  public render(): React.ReactElement<IMainPageProps> {
    const { onNavigateToLeave, onNavigateToHRLetter } = this.props;

    return (
      <div className={[styles.pageInner, this.props.className || ""].join(" ")}>
        <ProfileHeader context={this.props.context} />

        <div className={styles.columns}>
          <div className={styles.leftCol} role="region" aria-label="Main feed">
            <LeftSection />
          </div>

          <aside className={styles.rightCol} role="complementary" aria-label="Sidebar widgets">
            <RightSection
              onApplyLeave={onNavigateToLeave}
              onRequestHRLetter={onNavigateToHRLetter}
              // onViewHoliday={onNavigateToHoliday}
              context={this.props.context}
            />
          </aside>
        </div>
      </div>
    );
  }
}
