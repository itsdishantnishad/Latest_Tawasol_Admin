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

import styles from "./FeatureWheelWebPart.module.scss";

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
  /** Delay React render in ms */
  private readonly _renderDelayMilliseconds: number = 1500;

  /** Store timer id so we can clear on re-render/dispose */
  private _reactMountTimerId?: number;

  public render(): void {
    // Clear pending timer on re-render (property changes / refresh)
    if (this._reactMountTimerId) {
      window.clearTimeout(this._reactMountTimerId);
      this._reactMountTimerId = undefined;
    }

    // Show shimmer placeholder immediately
    this._renderWheelShimmerPlaceholder();

    // Delay mounting React component
    this._reactMountTimerId = window.setTimeout(() => {
      const featureWheelElement: React.ReactElement<IFeatureWheelProps> =
        React.createElement(FeatureWheel, {
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
        });

      ReactDom.render(featureWheelElement, this.domElement);
      this._reactMountTimerId = undefined;
    }, this._renderDelayMilliseconds);
  }

  /**
   * ✅ Wheel shimmer placeholder using the same "arc" concept as your Featured Wheel:
   * - Tiles placed on an arc using X/Y (sin/cos)
   * - Slight rotation per tile
   * - Center tile appears larger (active tile feel)
   *
   * NOTE: Styling comes from FeatureWheelWebPart.module.scss (CSS Modules)
   */
  private _renderWheelShimmerPlaceholder(): void {
    // IMPORTANT: explicit number type prevents TS literal narrowing (TS2367)
    const wheelTileCount: number = 13;
    const centerTileIndex: number = Math.floor(wheelTileCount / 2);

    // Arc angles (tune if needed)
    const wheelArcStartAngleDegrees: number = -40;
    const wheelArcEndAngleDegrees: number = 40;

    // Radius controls curve depth + spacing
    const wheelArcRadiusPixels: number = 1100;

    // Helper for degrees->radians
    const degreesToRadians = (degrees: number): number =>
      (degrees * Math.PI) / 180;

    const wheelTilesHtml: string = Array.from({ length: wheelTileCount })
      .map((_, tileIndex) => {
        const normalizedTilePosition: number =
          wheelTileCount === 1 ? 0 : tileIndex / (wheelTileCount - 1);

        const tileAngleDegrees: number =
          wheelArcStartAngleDegrees +
          (wheelArcEndAngleDegrees - wheelArcStartAngleDegrees) *
            normalizedTilePosition;

        const tileAngleRadians: number = degreesToRadians(tileAngleDegrees);

        // X positions across the arc
        const tileOffsetXInPixels: number =
          wheelArcRadiusPixels * Math.sin(tileAngleRadians);

        // Y positions: center highest, sides lower
        const tileOffsetYInPixels: number =
          wheelArcRadiusPixels * (1 - Math.cos(tileAngleRadians));

        // Slight rotation like real wheel cards
        const tileRotationDegrees: number = tileAngleDegrees * 0.55;

        // Center tile on top
        const tileZIndex: number = 100 - Math.abs(tileIndex - centerTileIndex);

        const isCenterTile: boolean = tileIndex === centerTileIndex;

        const tileClassName: string = isCenterTile
          ? `${styles.tile} ${styles.tileActive}`
          : styles.tile;

        return `
          <div
            class="${tileClassName}"
            style="--tileX:${tileOffsetXInPixels}px; --tileY:${tileOffsetYInPixels}px; --tileRot:${tileRotationDegrees}deg; z-index:${tileZIndex};"
          >
            <div class="${styles.tileIcon}"></div>
            <div class="${styles.tileTextLine}"></div>
            <div class="${styles.tileTextLine} ${styles.tileTextLineShort}"></div>
          </div>
        `;
      })
      .join("");

    this.domElement.innerHTML = `
      <div class="${styles.shimmerRoot}">
        <div class="${styles.topLines}">
          <div class="${styles.shimmerBlock} ${styles.lineWide}"></div>
          <div class="${styles.shimmerBlock} ${styles.lineMid}"></div>
        </div>

        <div class="${styles.wheel}">
          ${wheelTilesHtml}
        </div>
      </div>
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
    if (this._reactMountTimerId) {
      window.clearTimeout(this._reactMountTimerId);
      this._reactMountTimerId = undefined;
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
