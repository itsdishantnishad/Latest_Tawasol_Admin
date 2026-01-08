import * as React from "react";
import styles from "./ProfilePageRightPanel.module.scss";
import { IProfilePageRightPanelProps } from "./IProfilePageRightPanelProps";

// ✅ Local import after you move RightSectionComponent into this webpart
import RightSection from "./RightSectionComponent/RightSection/RightSection";

export default class ProfilePageRightPanel extends React.Component<IProfilePageRightPanelProps> {

  private handleApplyLeave = (): void => {
    const url = (this.props.applyLeaveUrl || "").trim();
    if (url) window.open(url, "_self");
  };

  private handleRequestHRLetter = (): void => {
    const url = (this.props.hrLetterUrl || "").trim();
    if (url) window.open(url, "_self");
  };

  public render(): React.ReactElement<IProfilePageRightPanelProps> {
    const { context, sticky, stickyTop, eventsTrainingTab, className } = this.props;

    return (
      <div className={[styles.wrapper, className || ""].join(" ")}>
        <RightSection
          context={context}
          sticky={sticky}
          stickyTop={stickyTop}
          eventsTrainingTab={eventsTrainingTab}
          onApplyLeave={this.handleApplyLeave}
          onRequestHRLetter={this.handleRequestHRLetter}
        />
      </div>
    );
  }
}
