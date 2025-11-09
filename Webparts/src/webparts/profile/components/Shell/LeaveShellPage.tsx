
import * as React from "react";
import css from "./LeaveShellPage.module.scss";

import NavSegment from "../NavSegment/NavSegment";
import Breadcrumb from "./Breadcrumb";

import LeaveFormComponent from "../Forms/LeaveForm/LeaveForm";
import HRLetterComponent from "../Forms/HrLetterForm/HrLetterComp";
//import HolidayListComponent from "../Forms/HolidayListForm/HolidayListComp";

const LeftArrow = require("../../assets/ArrowLeft.svg");
const RightArrow = require("../../assets/ArrowRight.svg");

export type Option = "Apply Leave" | "HR Letters";

export interface ILeaveShellPageProps {
  initialTab?: Option;
  onBack?: () => void;
}

export interface ILeaveShellPageState {
  tab: Option;
}

export default class LeaveShellPage extends React.Component<ILeaveShellPageProps, ILeaveShellPageState> {
  constructor(props: ILeaveShellPageProps) {
    super(props);
    this.state = {
      tab: props.initialTab || "Apply Leave",
    };
  }

  public componentDidUpdate(prevProps: ILeaveShellPageProps): void {
    if (prevProps.initialTab !== this.props.initialTab && this.props.initialTab) {
      this.setState({ tab: this.props.initialTab });
    }
  }

  private renderPane(): React.ReactNode {
    const { tab } = this.state;
    
    switch (tab) {
      case "HR Letters":
        return <HRLetterComponent />;
      // case "Holiday List":
      //   return <HolidayListComponent />;
      case "Apply Leave":
      default:
        return <LeaveFormComponent />;
    }
  }

  public render(): React.ReactElement<ILeaveShellPageProps> {
    const { tab } = this.state;
    const { onBack } = this.props;

    return (
      <div className={css.page}>
        <div className={css.wrapper}>
         
          <Breadcrumb
            leftIconSrc={LeftArrow}
            rightIconSrc={RightArrow}
            onBack={onBack}
            leftText="Back"
            trailStart="Home"
            selectedOption={tab}  
          />

          <div className={css.segmentRow}>
            <NavSegment
              value={tab}
              onChange={(val: Option) => this.setState({ tab: val })}
              labels={["Apply Leave", "HR Letters"]}
            />
          </div>

          <div className={css.content}>
            {this.renderPane()}
          </div>
        </div>
      </div>
    );
  }
}