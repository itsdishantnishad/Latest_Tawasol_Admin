import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'TrainingPageDetailWebPartStrings';
import TrainingPageDetail from './components/TrainingPageDetail';
import { ITrainingPageDetailProps } from './components/ITrainingPageDetailProps';
import { listServices } from '../services/listServices';

export interface ITrainingPageDetailWebPartProps {
  description: string;
}

export default class TrainingPageDetailWebPart
  extends BaseClientSideWebPart<ITrainingPageDetailWebPartProps> {

  // ✅ make it an array by default
  private trainingItem: any[] = [];
  private spService: listServices;

  public render(): void {
    const element: React.ReactElement<ITrainingPageDetailProps> = React.createElement(
      TrainingPageDetail,
      {
        trainingItem: this.trainingItem,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  public async onInit(): Promise<void> {
    await super.onInit();

    this.spService = new listServices(this.context);

    const pageId = this.context.pageContext.listItem?.id;
    // const pageId = 101; // temp hardcoded for testing

    if (pageId) {
      try {
        this.trainingItem = await this.spService.getTrainingByID(pageId);
      } catch (err) {
        console.error('Error loading training item by ID', err);
        this.trainingItem = [];
      }
    } else {
      // no list item bound to this page
      this.trainingItem = [];
    }

    // ✅ ensure we render with the loaded data
    this.render();
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
