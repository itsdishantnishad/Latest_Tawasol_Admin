import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'AboutDhrePageTitleWebPartStrings';
import AboutDhrePageTitle from './components/AboutDhrePageTitle';
import { IAboutDhrePageTitleProps } from './components/IAboutDhrePageTitleProps';

export interface IAboutDhrePageTitleWebPartProps {
  title: string;
  description: string;
  imageUrl: string;

}

export default class AboutDhrePageTitleWebPart extends BaseClientSideWebPart<IAboutDhrePageTitleWebPartProps> {



  public render(): void {
    const element: React.ReactElement<IAboutDhrePageTitleProps> = React.createElement(
      AboutDhrePageTitle,
      {
        title: this.properties.title || "About DHRE",
        description: this.properties.description || "Add description from property pane.",
        imageUrl: this.properties.imageUrl || "",

      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this
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
          header: { description: "About DHRE" },
          groups: [
            {
              groupName: "Content",
              groupFields: [
                PropertyPaneTextField("title", {
                  label: "Title",
                }),
                PropertyPaneTextField("description", {
                  label: "Description",
                  multiline: true,
                  rows: 4,
                }),
                PropertyPaneTextField("imageUrl", {
                  label: "Image URL (PNG/JPG)",
                  description: "e.g., https://tenant.sharepoint.com/sites/site/Shared%20Documents/banner.jpg",
                }),
              ],
            },
          ],
        },
      ],
    };
  }

}
