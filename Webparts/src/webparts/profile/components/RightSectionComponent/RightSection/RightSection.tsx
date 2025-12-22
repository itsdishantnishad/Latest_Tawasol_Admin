import * as React from "react";
import styles from "./RightSection.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";

import ApplyLeaveCard from "../LeaveComponent/ApplyLeave";
import HrLettersCard from "../HRLetterComponent/HRLetter";
import UpcomingEventsCard from "../EventsTrainingComponent/EventTraining";
import JoinedCommunitiesCard from "../JoinedCommunitiesComponent/JoinedCommunities";

export interface IRightSectionProps {
  className?: string;
  onApplyLeave?: () => void;
  onRequestHRLetter?: () => void;
  sticky?: boolean;
  stickyTop?: number;
  eventsTrainingTab?: "events" | "training";
  context: WebPartContext;
}

export default class RightSection extends React.Component<IRightSectionProps> {
  public static defaultProps = {
    sticky: true,
    stickyTop: 16,
  };

  public render(): React.ReactElement<IRightSectionProps> {
    const { className, onApplyLeave, onRequestHRLetter, sticky, stickyTop, context } = this.props;

    return (
      <aside
        className={[styles.rightWrap, sticky ? styles.isSticky : "", className || ""].join(" ")}
        style={sticky ? { top: stickyTop } : undefined}
        aria-label="Sidebar"
      >
        {/* Events / Training */}
        <div className={styles.block}>
          <UpcomingEventsCard currentTab={this.props.eventsTrainingTab} context={context} />
        </div>

        {/* Apply for Leave */}
        <div className={styles.block}>
          <ApplyLeaveCard context={context} onApply={onApplyLeave} />
        </div>

        {/* HR Letters */}
        <div className={styles.block}>
          <HrLettersCard onRequest={onRequestHRLetter} />
        </div>

        {/* Joined Communities */}
        <div className={styles.block}>
          <JoinedCommunitiesCard />
        </div>
      </aside>
    );
  }
}
