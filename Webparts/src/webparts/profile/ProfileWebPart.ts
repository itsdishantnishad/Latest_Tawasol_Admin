
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "ProfileWebPartStrings";
import Profile from "./components/Profile";
import { IProfileProps } from "./components/IProfileProps";

import { setupSP } from "./components/services/spSetup";

export interface IProfileWebPartProps {
  description: string;

  // ✅ NEW: 10 badges (name + image url)
  badge1Name?: string;  badge1ImageUrl?: string;
  badge2Name?: string;  badge2ImageUrl?: string;
  badge3Name?: string;  badge3ImageUrl?: string;
  badge4Name?: string;  badge4ImageUrl?: string;
  badge5Name?: string;  badge5ImageUrl?: string;
  badge6Name?: string;  badge6ImageUrl?: string;
  badge7Name?: string;  badge7ImageUrl?: string;
  badge8Name?: string;  badge8ImageUrl?: string;
  badge9Name?: string;  badge9ImageUrl?: string;
  badge10Name?: string; badge10ImageUrl?: string;
}

export default class ProfileWebPart extends BaseClientSideWebPart<IProfileWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  // ✅ NEW: helper to build badges array
  private _getBadgesFromProperties(): Array<{ name: string; imageUrl: string }> {
    const badges: Array<{ name: string; imageUrl: string }> = [];
    const props: any = this.properties;

    for (let i = 1; i <= 10; i++) {
      const name = (props[`badge${i}Name`] || "").trim();
      const imageUrl = (props[`badge${i}ImageUrl`] || "").trim();
      if (name && imageUrl) {
        badges.push({ name, imageUrl });
      }
    }
    return badges;
  }

  public render(): void {
  
    const badges = this._getBadgesFromProperties();
    console.log("[ProfileWebPart] badges from properties:", badges);
    const element: React.ReactElement<IProfileProps> = React.createElement(Profile, {
      description: this.properties.description,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName,
      context: this.context,

      // ✅ NEW
      badges,
    });

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    setupSP(this.context);
    this._environmentMessage = await this._getEnvironmentMessage();
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

