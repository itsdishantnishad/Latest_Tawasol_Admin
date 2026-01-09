import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EventAndTrainingWebPartStrings';
import EventAndTraining from './components/EventAndTraining';
import { IEventAndTrainingProps } from './components/IEventAndTrainingProps';
import { listServices } from "../services/listServices";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { GraphMeetingsProvider } from '../services/meetingServices/GraphMeetingsProvider';

export interface IEventAndTrainingWebPartProps {
  description: string;
  context: any;
}



export default class EventAndTrainingWebPart extends BaseClientSideWebPart<IEventAndTrainingWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private trainingItem: any;
  private EventItem: any;
  private spService: listServices;
  public render(): void {
    const element: React.ReactElement<IEventAndTrainingProps> = React.createElement(
      EventAndTraining,
      {       
        trainingItem: this.trainingItem,
        EventItem: this.EventItem,
        MeetingsData: this._meetings || [],
        context:this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _meetings: any[] = [];

  async onInit(): Promise<void> {
    this.spService = new listServices(this.context);
    this.trainingItem = await this.spService.getAllTraining();
    this.EventItem = await this.spService.getAllEvents();
     const graph = await this.context.msGraphClientFactory.getClient("3");
    const provider = new GraphMeetingsProvider(graph);
    this._meetings = await provider.getUpcoming(7, 50);
    this.render();
  }
 

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
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
