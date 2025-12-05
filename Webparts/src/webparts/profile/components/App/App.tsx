
import * as React from "react";
import MainPage from "../ProfileComponent/MainPage";
import LeaveShellPage from "../Shell/LeaveShellPage";
import { Option } from "../NavSegment/NavSegment";
import { WebPartContext } from "@microsoft/sp-webpart-base";
export type AppView = "main" | "forms";

export interface IAppProps {
  className?: string;
  context:WebPartContext
}

export interface IAppState {
  currentView: AppView;
  selectedTab?: Option;
}

export default class App extends React.Component<IAppProps, IAppState> {
  public state: IAppState = {
    currentView: "main",
    selectedTab: undefined,
  };

  private handleNavigateToLeave = (): void => {
    this.setState({ currentView: "forms", selectedTab: "Apply Leave" });
  };

  private handleNavigateToHRLetter = (): void => {
    this.setState({ currentView: "forms", selectedTab: "HR Letters" });
  };

  // private handleNavigateToHoliday = (): void => {
  //   this.setState({ currentView: "forms", selectedTab: "Holiday List" });
  // };

  private handleBackToMain = (): void => {
    this.setState({ currentView: "main", selectedTab: undefined });
  };

  public render(): React.ReactElement<IAppProps> {
    const { currentView, selectedTab } = this.state;

    if (currentView === "main") {
      return (
        <MainPage
          onNavigateToLeave={this.handleNavigateToLeave}
          onNavigateToHRLetter={this.handleNavigateToHRLetter}
          // onNavigateToHoliday={this.handleNavigateToHoliday}
          context = {this.props.context}
        />
      );
    }
    return (
      <LeaveShellPage
        initialTab={selectedTab}
        onBack={this.handleBackToMain}
      />
    );
  }
}