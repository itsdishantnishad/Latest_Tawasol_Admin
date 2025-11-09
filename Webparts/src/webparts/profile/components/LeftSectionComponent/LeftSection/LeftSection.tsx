 
import * as React from "react";
import styles from "./LeftSection.module.scss";
import NavSegment, { NavKey } from "../ProfileNavComp/NavSegComp";
import ProfileShareComp from "../ProfileStorySummary/ProfileShareComp";
import ProfileStoryList from "../ProfileStoryComp/ProfileStory";
import AllActivities from "../ProfileNavComp/AllActivitiesComponent/AllActivities"; 
import MyBookmark from "../ProfileNavComp/MyBookmarkComponent/MyBookmark";

export interface ILeftSectionProps {
  className?: string;
  headerProps?: Record<string, unknown>;
  navProps?: Record<string, unknown>;
  storyProps?: Record<string, unknown>;
  summaryProps?: Record<string, unknown>;
}

interface ILeftSectionState {
  activeTab: NavKey;
}

export default class LeftSection extends React.Component<
  ILeftSectionProps,
  ILeftSectionState
> {
  constructor(props: ILeftSectionProps) {
    super(props);
    this.state = {
      activeTab: "storyline",
    };
  }

  private handleTabChange = (value: NavKey) => {
    this.setState({ activeTab: value });
  };

  private renderContent() {
    const { storyProps, summaryProps } = this.props;
    const { activeTab } = this.state;

    switch (activeTab) {
      case "storyline":
        return (
          <>
            <div className={styles.block}>
              <ProfileShareComp {...(storyProps as any)} />
            </div>
            <div className={styles.block}>
              <ProfileStoryList {...(summaryProps as any)} />
            </div>
          </>
        );

      case "activities":
        return (
          <div className={styles.block}>
            <AllActivities />
          </div>
        );

      case "bookmarks":
        return (
          <div className={styles.block}>
            <MyBookmark/>
          </div>
        );

      default:
        return null;
    }
  }

  public render(): React.ReactElement<ILeftSectionProps> {
    const { className, navProps } = this.props;

    return (
      <section
        className={[styles.leftWrap, className || ""].join(" ")}
        aria-label="Profile content"
      >
        <div className={styles.block}>
          <NavSegment
            {...(navProps as any)}
            value={this.state.activeTab}
            onChange={this.handleTabChange}
          />
        </div>
        {this.renderContent()}
      </section>
    );
  }
}