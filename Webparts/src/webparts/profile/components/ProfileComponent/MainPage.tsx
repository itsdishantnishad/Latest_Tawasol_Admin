
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
  context: WebPartContext;
  badges?: Array<{ name: string; imageUrl: string }>;  
}

export default class MainPage extends React.Component<IMainPageProps> {
  public render(): React.ReactElement<IMainPageProps> {
    const { onNavigateToLeave, onNavigateToHRLetter } = this.props;
    
    console.log("[MainPage] Badges:", this.props.badges);

    return (
      <div className={[styles.pageInner, this.props.className || ""].join(" ")}>
        <ProfileHeader 
          badges={this.props.badges}  
        />
        <div className={styles.columns}>
          <div className={styles.leftCol} role="region" aria-label="Main feed">
            <LeftSection />
          </div>

          <aside className={styles.rightCol} role="complementary" aria-label="Sidebar widgets">
            {/* <RightSection
              onApplyLeave={onNavigateToLeave}
              onRequestHRLetter={onNavigateToHRLetter}
              context={this.props.context}
            /> */}
          </aside>
        </div>
      </div>
    );
  }
}