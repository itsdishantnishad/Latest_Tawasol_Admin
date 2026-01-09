import * as React from "react";
import styles from "./RightSection.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";

import ApplyLeaveCard from "../LeaveComponent/ApplyLeave";
import HrLettersCard from "../HRLetterComponent/HRLetter";
import UpcomingEventsCard from "../EventsTrainingComponent/EventTraining";
// import JoinedCommunitiesCard from "../JoinedCommunitiesComponent/JoinedCommunities";

export interface IRightSectionProps {
  className?: string;
  sticky?: boolean;
  stickyTop?: number;
  eventsTrainingTab?: "events" | "training";
  context: WebPartContext;

  //  ADD THIS (your error is because this was missing)
  applyLeaveUrl?: string;

  // already present
  hrLetterUrl?: string;
  hrLetterHeroUrl?: string;
}

export default class RightSection extends React.Component<IRightSectionProps> {
  public static defaultProps = {
    sticky: true,
    stickyTop: 16,
  };

  public render(): React.ReactElement<IRightSectionProps> {
    const {
      className,
      sticky,
      stickyTop,
      context,
      eventsTrainingTab,
      applyLeaveUrl,
      hrLetterUrl,
      hrLetterHeroUrl,
    } = this.props;

    return (
      <aside
        className={[
          styles.rightWrap,
          sticky ? styles.isSticky : "",
          className || "",
        ].join(" ")}
        style={sticky ? { top: stickyTop } : undefined}
        aria-label="Sidebar"
      >
        {/* Events / Training */}
        <div className={styles.block}>
          <UpcomingEventsCard currentTab={eventsTrainingTab} context={context} />
        </div>

        {/* Apply for Leave */}
        <div className={styles.block}>
          <ApplyLeaveCard context={context} applyUrl={applyLeaveUrl} />
        </div>

        {/* HR Letters */}
        <div className={styles.block}>
          <HrLettersCard requestUrl={hrLetterUrl} heroUrl={hrLetterHeroUrl} />
        </div>

        {/* Joined Communities */}
        {/* <div className={styles.block}>
          <JoinedCommunitiesCard />
        </div> */}
      </aside>
    );
  }
}
