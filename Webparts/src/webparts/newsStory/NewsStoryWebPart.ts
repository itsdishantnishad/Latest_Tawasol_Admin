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

  public render(): void {
    // ✅ FIX: Direct render - component manages its own loading state
    // Removed delayed mounting and innerHTML shimmer that was causing race conditions
    const element: React.ReactElement<INewsStoryProps> = React.createElement(
      NewsStory,
      {
        interval: 500,
        context: this.context,
        maxItems: this.properties.maxItems || 3,
      }
    );

    ReactDom.render(element, this.domElement);
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
