// src/webparts/featureWheel/FeatureWheelWebPart.ts

import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "FeatureWheelWebPartStrings";
import FeatureWheel from "./components/FeatureWheel";
import { IFeatureWheelProps } from "./components/IFeatureWheelProps";

export interface IFeatureWheelWebPartProps {
  letsCelebrate: string;
  trainingAndDevelopment: string;
  upcomingEvents: string;
  getOffersAndDiscounts: string;
  imageGallery: string;
  documents: string;
  meeting: string;
  interactiveForms: string;
  dashboard: string;
  taskApprovals: string;
  beverageMenu: string;
}

export default class FeatureWheelWebPart extends BaseClientSideWebPart<IFeatureWheelWebPartProps> {
  // ✅ TIMER: delay mounting whole webpart
  private _renderTimerId?: number;

  public render(): void {
    // clear any pending render (important when properties change / re-render)
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    // ✅ delay the whole ReactDom.render
    this._renderTimerId = window.setTimeout(() => {
      const element: React.ReactElement<IFeatureWheelProps> = React.createElement(
        FeatureWheel,
        {
          letsCelebrate: this.properties.letsCelebrate,
          trainingAndDevelopment: this.properties.trainingAndDevelopment,
          upcomingEvents: this.properties.upcomingEvents,
          getOffersAndDiscounts: this.properties.getOffersAndDiscounts,
          imageGallery: this.properties.imageGallery,
          documents: this.properties.documents,
          meeting: this.properties.meeting,
          interactiveForms: this.properties.interactiveForms,
          dashboard: this.properties.dashboard,
          beverageMenu: this.properties.beverageMenu,
          taskApprovals: this.properties.taskApprovals,
          context: this.context,
        }
      );

      ReactDom.render(element, this.domElement);
    }, 500); // ✅ 5 seconds (change if needed)
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(() => {
      return;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams":
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onDispose(): void {
    // ✅ clear pending timer to avoid rendering after dispose
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("letsCelebrate", {
                  label: "Please enter URL for 'Let's Celebrate' see all",
                }),
                PropertyPaneTextField("trainingAndDevelopment", {
                  label:
                    "Please enter URL for 'Training & Development' see all",
                }),
                PropertyPaneTextField("upcomingEvents", {
                  label: "Please enter URL for 'Upcoming events' see all",
                }),
                PropertyPaneTextField("getOffersAndDiscounts", {
                  label: "Please enter URL for 'Offers & Benefits' view all",
                }),
                PropertyPaneTextField("imageGallery", {
                  label: "Please enter URL for 'Image Gallery' see all",
                }),
                PropertyPaneTextField("documents", {
                  label: "Please enter URL for 'Documents' see all",
                }),
                PropertyPaneTextField("meeting", {
                  label: "Please enter URL for 'Meeting' view all",
                }),
                PropertyPaneTextField("interactiveForms", {
                  label: "Please enter URL for 'Interactive Forms' view all",
                }),
                PropertyPaneTextField("dashboard", {
                  label: "Please enter URL for 'Dashboard' view all",
                }),
                PropertyPaneTextField("beverageMenu", {
                  label: "Please enter URL for 'Beverage Menu' view all",
                }),
                PropertyPaneTextField("taskApprovals", {
                  label: "Please enter URL for 'Task Approvals' view all",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
