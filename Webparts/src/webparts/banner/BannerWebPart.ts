import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';


import * as strings from 'BannerWebPartStrings';
import Banner from './components/Banner';
import { IBannerProps } from './components/IBannerProps';

export interface IBannerWebPartProps {
  bannerTitle: string;
  bannerSubTitle: string;
  bannerType: string;
}

export enum BannerType {
  TYPE_1 = 'Banner 1',
  TYPE_2 = 'Banner 2',
  TYPE_3 = 'Banner 3'
}

export default class BannerWebPart extends BaseClientSideWebPart<IBannerWebPartProps> {



  public render(): void {
    const element: React.ReactElement<IBannerProps> = React.createElement(
      Banner,
      {
        ...this.properties
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
                PropertyPaneChoiceGroup('bannerType',
                  {
                    label: "Select banner type",
                    options: [
                      {
                        key: BannerType.TYPE_1,
                        text: BannerType.TYPE_1,
                        iconProps: {
                          officeFabricIconFontName: "MicrosoftStaffhubLogo"
                        }
                      },
                      {
                        key: BannerType.TYPE_2,
                        text: BannerType.TYPE_2,
                        iconProps: {
                          officeFabricIconFontName: "Home"
                        }
                      },
                      {
                        key: BannerType.TYPE_3,
                        text: BannerType.TYPE_3,
                        iconProps: {
                          officeFabricIconFontName: "Page"
                        }
                      }
                    ]
                  }),
                PropertyPaneTextField('bannerTitle', {
                  label: "Please enter banner title"
                }),
                PropertyPaneTextField('bannerSubTitle', {
                  label: "Please enter description below title"
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
