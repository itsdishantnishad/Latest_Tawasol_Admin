import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";

import * as strings from "ProfilePageHeaderWebPartStrings";

import ProfilePageHeader from "./components/ProfilePageHeader";
import {
  IBadgeItem,
  IProfilePageHeaderProps,
  IProfilePageHeaderWebPartProps,
} from "./components/IProfilePageHeaderProps";

import { setupSP } from "../services/Profile/spSetup";

export default class ProfilePageHeaderWebPart extends BaseClientSideWebPart<IProfilePageHeaderWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  protected async onInit(): Promise<void> {
    await super.onInit();
    setupSP(this.context);
    this._environmentMessage = await this._getEnvironmentMessage();
  }

  public render(): void {
    const badges = this._getBadgesFromProperties();

    const element: React.ReactElement<IProfilePageHeaderProps> = React.createElement(ProfilePageHeader, {
      context: this.context,
      badges,
    });

    ReactDom.render(element, this.domElement);
  }

  private _getBadgesFromProperties(): IBadgeItem[] {
    const badges: IBadgeItem[] = [];
    const props: any = this.properties;

    for (let i = 1; i <= 10; i++) {
      const name = (props[`badge${i}Name`] || "").trim();
      const imageUrl = (props[`badge${i}ImageUrl`] || "").trim();
      if (name && imageUrl) badges.push({ name, imageUrl });
    }

    return badges;
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext().then((context) => {
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty("--bodyText", semanticColors.bodyText || null);
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty("--linkHovered", semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const badgeFields: any[] = [];

    for (let i = 1; i <= 10; i++) {
      badgeFields.push(
        PropertyPaneTextField(`badge${i}Name`, { label: `Badge ${i} Name` }),
        PropertyPaneTextField(`badge${i}ImageUrl`, { label: `Badge ${i} Image URL` })
      );
    }

    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
            {
              groupName: "Badges (Up to 10)",
              groupFields: badgeFields,
            },
          ],
        },
      ],
    };
  }
}
