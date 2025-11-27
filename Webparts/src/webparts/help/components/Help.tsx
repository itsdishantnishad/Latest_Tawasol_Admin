
import * as React from "react";
import type { IHelpProps } from "./IHelpProps";
import App from "./App";

export default class Help extends React.Component<IHelpProps> {
  public render(): React.ReactElement<IHelpProps> {
    return <App {...this.props} />;
  }
}
