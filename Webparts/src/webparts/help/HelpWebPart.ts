
// import * as React from 'react';
// import * as ReactDom from 'react-dom';
// import { Version } from '@microsoft/sp-core-library';
// import {
//   type IPropertyPaneConfiguration,
//   PropertyPaneTextField,
//   PropertyPaneToggle
// } from "@microsoft/sp-property-pane";
// import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
// import { IReadonlyTheme } from '@microsoft/sp-component-base';

// import * as strings from 'HelpWebPartStrings';
// import Help from './components/Help';
// import { IHelpProps } from './components/IHelpProps';

// export interface IHelpWebPartProps {
//   description: string;
//   chatBotDeepLink?: string;
//   showChatBot?: boolean; // ✅ new
// }

// export default class HelpWebPart extends BaseClientSideWebPart<IHelpWebPartProps> {

//   private _isDarkTheme: boolean = false;
//   private _environmentMessage: string = '';

//   public render(): void {
//     const element: React.ReactElement<IHelpProps> = React.createElement(
//       Help,
//       {
//         description: this.properties.description,
//         isDarkTheme: this._isDarkTheme,
//         environmentMessage: this._environmentMessage,
//         hasTeamsContext: !!this.context.sdks.microsoftTeams,
//         userDisplayName: this.context.pageContext.user.displayName,
//         context: this.context,
//         listTitle: "Help Center",
//         chatBotDeepLink: this.properties.chatBotDeepLink,
//         showChatBot: this.properties.showChatBot !== false
//       }
//     );

//     ReactDom.render(element, this.domElement);
//   }

//   protected onInit(): Promise<void> {
//     // Default ON (so existing pages don’t suddenly hide it)
//     if (this.properties.showChatBot === undefined) {
//       this.properties.showChatBot = true;
//     }

//     return this._getEnvironmentMessage().then(message => {
//       this._environmentMessage = message;
//     });
//   }

//   private _getEnvironmentMessage(): Promise<string> {
//     if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
//       return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
//         .then(context => {
//           let environmentMessage: string = '';
//           switch (context.app.host.name) {
//             case 'Office': // running in Office
//               environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
//               break;
//             case 'Outlook': // running in Outlook
//               environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
//               break;
//             case 'Teams': // running in Teams
//             case 'TeamsModern':
//               environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
//               break;
//             default:
//               environmentMessage = strings.UnknownEnvironment;
//           }

//           return environmentMessage;
//         });
//     }

//     return Promise.resolve(
//       this.context.isServedFromLocalhost
//         ? strings.AppLocalEnvironmentSharePoint
//         : strings.AppSharePointEnvironment
//     );
//   }

//   protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
//     if (!currentTheme) {
//       return;
//     }

//     this._isDarkTheme = !!currentTheme.isInverted;
//     const { semanticColors } = currentTheme;

//     if (semanticColors) {
//       this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
//       this.domElement.style.setProperty('--link', semanticColors.link || null);
//       this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
//     }
//   }

//   protected onDispose(): void {
//     ReactDom.unmountComponentAtNode(this.domElement);
//   }

//   protected get dataVersion(): Version {
//     return Version.parse('1.0');
//   }

//   protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
//     return {
//       pages: [
//         {
//           header: {
//             description: strings.PropertyPaneDescription
//           },
//           groups: [
//             {
//               groupName: strings.BasicGroupName,
//               groupFields: [
//                 PropertyPaneTextField("description", {
//                   label: strings.DescriptionFieldLabel
//                 }),

//                 PropertyPaneToggle("showChatBot", {
//                   label: "Show Help Bot",
//                   onText: "On",
//                   offText: "Off"
//                 }),

//                 PropertyPaneTextField("chatBotDeepLink", {
//                   label: "Chatbot deep link",
//                   placeholder: "Paste chatbot URL / deep link here"
//                 })
//               ]
//             }
//           ]
//         }
//       ]
//     };
//   }
// }















// MetaBot Attached Code
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'HelpWebPartStrings';
import Help from './components/Help';
import { IHelpProps } from './components/IHelpProps';

export interface IHelpWebPartProps {
  description: string;

  // Existing NaviBot
  chatBotDeepLink?: string;
  showChatBot?: boolean;

  // New Metapods widget
  metapodsChatbotId?: string;
  metapodsClientId?: string;
  showMetapodsWidget?: boolean;
}

export default class HelpWebPart extends BaseClientSideWebPart<IHelpWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IHelpProps> = React.createElement(
      Help,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context: this.context,
        listTitle: "Help Center",

        // Existing NaviBot
        chatBotDeepLink: this.properties.chatBotDeepLink,
        showChatBot: this.properties.showChatBot !== false,

        // New Metapods widget
        metapodsChatbotId: this.properties.metapodsChatbotId,
        metapodsClientId: this.properties.metapodsClientId,
        showMetapodsWidget: this.properties.showMetapodsWidget !== false
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    if (this.properties.showChatBot === undefined) {
      this.properties.showChatBot = true;
    }

    if (this.properties.showMetapodsWidget === undefined) {
      this.properties.showMetapodsWidget = true;
    }

    if (!this.properties.metapodsClientId) {
      this.properties.metapodsClientId = "DHRE";
    }

    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams':
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
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
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel
                }),

                PropertyPaneToggle("showChatBot", {
                  label: "Show NaviBot",
                  onText: "On",
                  offText: "Off"
                }),

                PropertyPaneTextField("chatBotDeepLink", {
                  label: "NaviBot deep link",
                  placeholder: "Paste NaviBot URL / deep link here"
                }),

                PropertyPaneToggle("showMetapodsWidget", {
                  label: "Show Metapods widget",
                  onText: "On",
                  offText: "Off"
                }),

                PropertyPaneTextField("metapodsChatbotId", {
                  label: "Metapods chatbot ID",
                  placeholder: "Paste Metapods chatbot ID here"
                }),

                PropertyPaneTextField("metapodsClientId", {
                  label: "Metapods client ID",
                  placeholder: "DHRE"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}