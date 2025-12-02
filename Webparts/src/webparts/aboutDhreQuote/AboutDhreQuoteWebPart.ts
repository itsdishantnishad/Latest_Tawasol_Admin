import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'AboutDhreQuoteWebPartStrings';
import AboutDhreQuote from './components/AboutDhreQuote';
import { IAboutDhreQuoteProps } from './components/IAboutDhreQuoteProps';

export interface IAboutDhreQuoteWebPartProps {
 title: string;
  description: string;
  role: string;

}

export default class AboutDhreQuoteWebPart extends BaseClientSideWebPart<IAboutDhreQuoteWebPartProps> {



  public render(): void {
    const element: React.ReactElement<IAboutDhreQuoteProps> = React.createElement(
      AboutDhreQuote,
      {
          title: this.properties.title || "Khaled Al Malik",
      description:
        this.properties.description ||
        "To be a globally diversified holding company creating long-term, sustainable value for Dubai and For the Good of Tomorrow",
      role: this.properties.role || "CEO – Dubai Holding Real Estate",

      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
     
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
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
               PropertyPaneTextField("title", { label: "Name / Title" }),
                PropertyPaneTextField("role", { label: "Role / Sub-title" }),
                PropertyPaneTextField("description", {
                  label: "Quote / Description",
                  multiline: true,
                  rows: 4,
                }),
 
              ]
            }
          ]
        }
      ]
    };
  }
}
