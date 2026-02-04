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
import { GraphMeetingsProvider } from '../services/meetingServices/GraphMeetingsProvider';

export interface IEventAndTrainingWebPartProps {
  description: string;
  context: any;
}

export default class EventAndTrainingWebPart extends BaseClientSideWebPart<IEventAndTrainingWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private trainingItem: any[] = [];
  private EventItem: any[] = [];
  private _meetings: any[] = [];

  private spService: listServices;

  // ✅ loading / error state for shimmer + retry
  private _isLoading: boolean = true;
  private _loadError: unknown = null;

  public render(): void {
    const element: React.ReactElement<IEventAndTrainingProps> = React.createElement(
      EventAndTraining,
      {
        trainingItem: this.trainingItem || [],
        EventItem: this.EventItem || [],
        MeetingsData: this._meetings || [],
        context: this.context,

        // ✅ shimmer support
        isLoading: this._isLoading,
        loadError: this._loadError,
        onRetry: () => this._loadData(true)
      }
    );

    ReactDom.render(element, this.domElement);
  }

  public async onInit(): Promise<void> {
    await super.onInit();

    this.spService = new listServices(this.context);

    // ✅ 1) Render immediately (so webpart never stays blank)
    this._isLoading = true;
    this._loadError = null;
    this.trainingItem = [];
    this.EventItem = [];
    this._meetings = [];
    this.render();

    // ✅ 2) Load data in background (never blocks first paint)
    void this._loadData(false);
  }

  private async _loadData(forceReload: boolean): Promise<void> {
    this._isLoading = true;
    this._loadError = null;
    this.render();

    try {
      // ----- SharePoint list calls (isolate failures) -----
      try {
        this.trainingItem = await this.spService.getAllTraining();
      } catch (e) {
        console.error("getAllTraining failed", e);
        this.trainingItem = [];
        // keep error info but don't block rendering
        this._loadError = this._loadError || e;
      }

      try {
        this.EventItem = await this.spService.getAllEvents();
      } catch (e) {
        console.error("getAllEvents failed", e);
        this.EventItem = [];
        this._loadError = this._loadError || e;
      }

      // ----- Graph meetings (isolate failures) -----
      try {
        const graph = await this.context.msGraphClientFactory.getClient("3");
        const provider = new GraphMeetingsProvider(graph);
        this._meetings = await provider.getUpcoming(7, 50);
      } catch (e) {
        console.error("Graph meetings failed", e);
        this._meetings = [];
        this._loadError = this._loadError || e;
      }

    } finally {
      // ✅ always end loading and re-render
      this._isLoading = false;
      this.render();
    }
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
