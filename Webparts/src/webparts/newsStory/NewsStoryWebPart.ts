import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "NewsStoryWebPartStrings";
import NewsStory from "./components/NewsStory";
import { INewsStoryProps } from "./components/INewsStoryProps";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

export interface INewsStoryWebPartProps {
  description: string;
  maxItems?: number;
}

export default class NewsStoryWebPart extends BaseClientSideWebPart<INewsStoryWebPartProps> {
  // ✅ Delay React render (ms)
  private readonly _renderDelayMs: number = 1500;

  // ✅ Timer handle
  private _renderTimerId?: number;

  public render(): void {
    // Clear any pending timer (important when properties change / re-render)
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    // ✅ Show shimmer placeholder immediately (NOT spinner)
    this._renderShimmerPlaceholder();

    // ✅ Delay mounting React
    this._renderTimerId = window.setTimeout(() => {
      const element: React.ReactElement<INewsStoryProps> = React.createElement(
        NewsStory,
        {
          interval: 500, // existing behavior
          context: this.context,
          maxItems: this.properties.maxItems || 3,
        }
      );

      ReactDom.render(element, this.domElement);
      this._renderTimerId = undefined;
    }, this._renderDelayMs);
  }

  private _renderShimmerPlaceholder(): void {
    // Unique scope per webpart instance to avoid CSS collisions
    const scope = `nsShimmer_${(this.instanceId || "x").replace(/-/g, "")}`;

    this.domElement.innerHTML = `
      <div class="${scope}">
        <div class="${scope}__header">
          <div class="${scope}__block ${scope}__title"></div>
          <div class="${scope}__block ${scope}__subTitle"></div>
        </div>

        <div class="${scope}__hero ${scope}__block"></div>

        <div class="${scope}__caption">
          <div class="${scope}__block ${scope}__capLine"></div>
          <div class="${scope}__block ${scope}__capLine short"></div>
        </div>
      </div>

      <style>
        .${scope} { padding: 12px; box-sizing: border-box; }

        .${scope}__header { margin-bottom: 12px; }
        .${scope}__hero { width: 100%; height: 240px; border-radius: 16px; margin-bottom: 14px; }
        .${scope}__caption { display: grid; gap: 10px; }

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

        .${scope}__title { width: 45%; height: 18px; margin-bottom: 10px; border-radius: 12px; }
        .${scope}__subTitle { width: 30%; height: 12px; border-radius: 10px; }

        .${scope}__capLine { width: 85%; height: 14px; border-radius: 10px; }
        .${scope}__capLine.short { width: 60%; }

        @keyframes ${scope}__shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      </style>
    `;
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(() => {
      // no-op
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext().then((context) => {
        switch (context.app.host.name) {
          case "Office":
            return this.context.isServedFromLocalhost
              ? strings.AppLocalEnvironmentOffice
              : strings.AppOfficeEnvironment;
          case "Outlook":
            return this.context.isServedFromLocalhost
              ? strings.AppLocalEnvironmentOutlook
              : strings.AppOutlookEnvironment;
          case "Teams":
          case "TeamsModern":
            return this.context.isServedFromLocalhost
              ? strings.AppLocalEnvironmentTeams
              : strings.AppTeamsTabEnvironment;
          default:
            return strings.UnknownEnvironment;
        }
      });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;

    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty("--bodyText", semanticColors.bodyText || null);
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty("--linkHovered", semanticColors.linkHovered || null);
      this.domElement.style.setProperty(
        "--primaryButtonBackground",
        semanticColors.primaryButtonBackground || null
      );
    }
  }

  protected onDispose(): void {
    // ✅ clear pending timer to avoid rendering after dispose
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
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
                PropertyPaneSlider("maxItems", {
                  label: "Number of news items to show",
                  min: 1,
                  max: 50,
                  step: 1,
                  showValue: true,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
