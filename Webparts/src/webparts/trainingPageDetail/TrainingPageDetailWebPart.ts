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

export default class TrainingPageDetailWebPart extends BaseClientSideWebPart<ITrainingPageDetailWebPartProps> {
  private trainingItem: any;
  private spService: listServices;

  public render(): void {
    const element: React.ReactElement<ITrainingPageDetailProps> = React.createElement(
      TrainingPageDetail,
      {
        trainingItem: this.trainingItem
      }
    );

    ReactDom.render(element, this.domElement);
  }

  async onInit(): Promise<void> {
    this.spService = new listServices(this.context);
    const pageId = this.context.pageContext.listItem?.id
    pageId ?
      this.trainingItem = await this.spService.getTraining(pageId) : "";
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
