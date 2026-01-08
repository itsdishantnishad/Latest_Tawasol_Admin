import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneDropdown
} from "@microsoft/sp-property-pane";

import * as strings from "ProfilePageRightPanelWebPartStrings";

import ProfilePageRightPanel from "./components/ProfilePageRightPanel";
import { IProfilePageRightPanelProps } from "./components/IProfilePageRightPanelProps";

export interface IProfilePageRightPanelWebPartProps {
  description: string;

  applyLeaveUrl?: string;
  hrLetterUrl?: string;

  sticky?: boolean;
  stickyTop?: string;

  eventsTrainingTab?: "events" | "training";
}

export default class ProfilePageRightPanelWebPart extends BaseClientSideWebPart<IProfilePageRightPanelWebPartProps> {

  public render(): void {
    const stickyTopNum = this._parseNumber(this.properties.stickyTop, 16);

    const element: React.ReactElement<IProfilePageRightPanelProps> = React.createElement(ProfilePageRightPanel, {
      context: this.context,

      applyLeaveUrl: (this.properties.applyLeaveUrl || "").trim(),
      hrLetterUrl: (this.properties.hrLetterUrl || "").trim(),

      sticky: this.properties.sticky !== false, // default true
      stickyTop: stickyTopNum,

      eventsTrainingTab: this.properties.eventsTrainingTab || "events",
    });

    ReactDom.render(element, this.domElement);
  }

  private _parseNumber(value: string | undefined, fallback: number): number {
    const n = parseInt((value || "").trim(), 10);
    return isNaN(n) ? fallback : n;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", { label: strings.DescriptionFieldLabel }),

                PropertyPaneTextField("applyLeaveUrl", { label: "Apply Leave URL" }),
                PropertyPaneTextField("hrLetterUrl", { label: "HR Letter URL" }),

                PropertyPaneToggle("sticky", { label: "Sticky Right Panel", onText: "On", offText: "Off" }),
                PropertyPaneTextField("stickyTop", { label: "Sticky Top (px)", description: "Default: 16" }),

                PropertyPaneDropdown("eventsTrainingTab", {
                  label: "Default Events/Training Tab",
                  options: [
                    { key: "events", text: "Events" },
                    { key: "training", text: "Training" }
                  ],
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
