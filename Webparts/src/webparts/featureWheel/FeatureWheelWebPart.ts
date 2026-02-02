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
  // Delay React render (ms)
  private readonly _renderDelayMs: number = 1500;

  // Timer handle
  private _renderTimerId?: number;

  public render(): void {
    // Clear pending timer (property changes / rerender)
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    // Show shimmer placeholder immediately (NOT spinner)
    this._renderShimmerPlaceholder();

    // Delay mounting React
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
      this._renderTimerId = undefined;
    }, this._renderDelayMs);
  }

  private _renderShimmerPlaceholder(): void {
    // Unique scope per webpart instance to avoid CSS collisions
    const scope = `fwShimmer_${(this.instanceId || "x").replace(/-/g, "")}`;

    this.domElement.innerHTML = `
      <div class="${scope}">
        <div class="${scope}__row">
          <div class="${scope}__block ${scope}__title"></div>
          <div class="${scope}__block ${scope}__subTitle"></div>
        </div>

        <div class="${scope}__chips">
          ${Array.from({ length: 10 })
            .map(() => `<div class="${scope}__block ${scope}__chip"></div>`)
            .join("")}
        </div>

        <div class="${scope}__content">
          <div class="${scope}__block ${scope}__hero"></div>
          <div class="${scope}__block ${scope}__line"></div>
          <div class="${scope}__block ${scope}__line short"></div>
          <div class="${scope}__block ${scope}__line"></div>
        </div>
      </div>

      <style>
        .${scope} { padding: 14px; box-sizing: border-box; }
        .${scope}__row { margin-bottom: 14px; }
        .${scope}__chips { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
        .${scope}__content { display: grid; gap: 12px; }

        .${scope}__block {
          border-radius: 10px;
          background: linear-gradient(90deg,
            rgba(0,0,0,0.06) 25%,
            rgba(0,0,0,0.12) 37%,
            rgba(0,0,0,0.06) 63%
          );
          background-size: 400% 100%;
          animation: ${scope}__shimmer 1.2s ease-in-out infinite;
        }

        .${scope}__title { width: 55%; height: 22px; margin-bottom: 10px; border-radius: 12px; }
        .${scope}__subTitle { width: 35%; height: 14px; border-radius: 10px; }

        .${scope}__chip { width: 140px; height: 40px; border-radius: 14px; }

        .${scope}__hero { width: 100%; height: 220px; border-radius: 16px; }
        .${scope}__line { width: 100%; height: 14px; border-radius: 10px; }
        .${scope}__line.short { width: 75%; }

        @keyframes ${scope}__shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      </style>
    `;
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
    // Clear pending timer to avoid rendering after dispose
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    ReactDom.unmountComponentAtNode(this.domElement);
    this.domElement.innerHTML = "";
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
                  label: "Please enter URL for 'Training & Development' see all",
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
