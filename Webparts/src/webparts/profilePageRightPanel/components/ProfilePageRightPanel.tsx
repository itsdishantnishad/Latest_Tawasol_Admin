import * as React from "react";
import styles from "./ProfilePageRightPanel.module.scss";
import { IProfilePageRightPanelProps } from "./IProfilePageRightPanelProps";
import RightSection from "./RightSectionComponent/RightSection/RightSection";

export default class ProfilePageRightPanel extends React.Component<IProfilePageRightPanelProps> {
  public render(): React.ReactElement<IProfilePageRightPanelProps> {
    const {
      context,
      sticky,
      stickyTop,
      eventsTrainingTab,
      className,
      applyLeaveUrl,
      hrLetterUrl,
      hrLetterHeroUrl,
      eventsTrainingViewAllUrl,
    } = this.props;

    return (
      <div className={[styles.wrapper, className || ""].join(" ")}>
        <RightSection
          context={context}
          sticky={sticky}
          stickyTop={stickyTop}
          eventsTrainingTab={eventsTrainingTab}
          className={className}
          applyLeaveUrl={applyLeaveUrl}
          hrLetterUrl={hrLetterUrl}
          hrLetterHeroUrl={hrLetterHeroUrl}
          eventsTrainingViewAllUrl={eventsTrainingViewAllUrl}
        />
      </div>
    );
  }
}
