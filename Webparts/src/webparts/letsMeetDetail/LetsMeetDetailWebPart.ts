import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'LetsMeetDetailWebPartStrings';
import LetsMeetDetail from './components/LetsMeetDetail';
import type { ILetsMeetDetailProps } from './components/ILetsMeetDetailProps';

export interface ILetsMeetDetailWebPartProps {
  description: string;

  // optional props you can control from pane
  contentTypeName: string;
  sitePagesListTitle: string;
  maxSuggestions: number;
  openYouTubeInNewTab: boolean;
}

export default class LetsMeetDetailWebPart extends BaseClientSideWebPart<ILetsMeetDetailWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {

    const element: React.ReactElement<ILetsMeetDetailProps> = React.createElement(
      LetsMeetDetail,
      {
        context: this.context, 
        contentTypeName: this.properties.contentTypeName || "TIRLetsConnect",
        sitePagesListTitle: this.properties.sitePagesListTitle || "Site Pages",
        maxSuggestions: this.properties.maxSuggestions ?? 10,
        openYouTubeInNewTab: this.properties.openYouTubeInNewTab ?? true
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {

    if (!this.properties.contentTypeName) this.properties.contentTypeName = "TIRLetsConnect";
    if (!this.properties.sitePagesListTitle) this.properties.sitePagesListTitle = "Site Pages";
    if (this.properties.maxSuggestions === undefined) this.properties.maxSuggestions = 10;
    if (this.properties.openYouTubeInNewTab === undefined) this.properties.openYouTubeInNewTab = true;

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

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;

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
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('contentTypeName', {
                  label: 'Content Type Name',
                }),
                PropertyPaneTextField('sitePagesListTitle', {
                  label: 'Site Pages Library Title',
                }),
                PropertyPaneSlider('maxSuggestions', {
                  label: 'Max suggestions',
                  min: 1,
                  max: 20
                }),
                PropertyPaneToggle('openYouTubeInNewTab', {
                  label: 'Open YouTube in new tab'
                }),

                // keep your old description if you want (optional)
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
