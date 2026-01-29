import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { Spinner, SpinnerSize } from "@fluentui/react";

import VivaEngageHeader from "./components/VivaEngageHeader";
import { IVivaEngageHeaderProps } from "./components/IVivaEngageHeaderProps";

export interface IVivaEngageHeaderWebPartProps {}

export default class VivaEngageHeaderWebPart extends BaseClientSideWebPart<IVivaEngageHeaderWebPartProps> {
  private _delayHandle: number | undefined;

  public render(): void {
    // If render() is called again, cancel the previous pending timer
    if (this._delayHandle) {
      window.clearTimeout(this._delayHandle);
      this._delayHandle = undefined;
    }

    // Show loader immediately
    const loader = React.createElement(
      "div",
      {
        style: {
          minHeight: "200px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff4ea"
        }
      },
      React.createElement(Spinner, {
        label: "Loading...",
        size: SpinnerSize.large
      })
    );

    ReactDom.render(loader, this.domElement);

    // Render the actual webpart after 2 seconds
    this._delayHandle = window.setTimeout(() => {
      const element: React.ReactElement<IVivaEngageHeaderProps> = React.createElement(VivaEngageHeader, {});
      ReactDom.render(element, this.domElement);
    }, 2000);
  }

  protected onDispose(): void {
    if (this._delayHandle) {
      window.clearTimeout(this._delayHandle);
      this._delayHandle = undefined;
    }
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
