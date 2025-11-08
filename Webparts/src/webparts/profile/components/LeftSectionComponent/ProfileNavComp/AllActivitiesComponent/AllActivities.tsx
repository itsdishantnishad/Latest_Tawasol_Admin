import * as React from "react";

export interface IAllActivitiesProps {
  className?: string;
  message?: string; 
}

export default class AllActivities extends React.Component<IAllActivitiesProps> {
  static defaultProps: Partial<IAllActivitiesProps> = {
    message: "All Activities page",
  };

  render(): React.ReactNode {
    const { className, message } = this.props;
    return (
      <div className={className ?? ""} aria-label="All Activities">
        {message}
      </div>
    );
  }
}
