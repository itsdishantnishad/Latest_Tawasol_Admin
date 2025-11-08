import * as React from "react";

export interface IMyBookmarkProps {
  className?: string;
  message?: string; 
}

export default class MyBookmark extends React.Component<IMyBookmarkProps> {
  static defaultProps: Partial<IMyBookmarkProps> = {
    message: "My Bookmarks page",
  };

  render(): React.ReactNode {
    const { className, message } = this.props;
    return (
      <div className={className ?? ""} aria-label="My Bookmarks">
        {message}
      </div>
    );
  }
}
