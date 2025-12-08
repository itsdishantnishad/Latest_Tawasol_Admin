import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EventDetailWebPartStrings';
import EventDetail from './components/EventDetail';
import { IEventDetailProps } from './components/IEventDetailProps';
import { listServices } from '../services/listServices';
export interface IEventDetailWebPartProps {
  description: string;
}

export default class EventDetailWebPart extends BaseClientSideWebPart<IEventDetailWebPartProps> {

   private eventItem: any[] = [];
   private spService: listServices;

  public render(): void {
    const element: React.ReactElement<IEventDetailProps> = React.createElement(
      EventDetail,
      {
       eventItem: this.eventItem,
       context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

     public async onInit(): Promise<void> {
    await super.onInit();

    this.spService = new listServices(this.context);

    // const pageId = this.context.pageContext.listItem?.id;
    const pageId = 60; // temp hardcoded for testing

    if (pageId) {
      try {
        this.eventItem = await this.spService.getEventsByID(pageId);
      } catch (err) {
        console.error('Error loading event item by ID', err);
        this.eventItem = [];
      }
    } else {
      // no list item bound to this page
      this.eventItem = [];
    }

    // ✅ ensure we render with the loaded data
    this.render();
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }
    const {
      semanticColors
    } = currentTheme;

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
