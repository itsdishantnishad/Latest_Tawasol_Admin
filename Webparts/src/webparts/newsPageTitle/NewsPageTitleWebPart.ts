import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';


import * as strings from 'NewsPageTitleWebPartStrings';
import NewsPageTitle from './components/NewsPageTitle';
import { INewsPageTitleProps } from './components/INewsPageTitleProps';
import { listServices } from '../services/listServices';

export interface INewsPageTitleWebPartProps {
  description: string;
}

export default class NewsPageTitleWebPart extends BaseClientSideWebPart<INewsPageTitleWebPartProps> {
  private newsItem: any;
  private spService: listServices;

  public render(): void {
    const element: React.ReactElement<INewsPageTitleProps> = React.createElement(
      NewsPageTitle,
      {
        newsItem: this.newsItem
      }
    );

    ReactDom.render(element, this.domElement);
  }

  async onInit(): Promise<void> {
    this.spService = new listServices(this.context);
    const pageId = this.context.pageContext.listItem?.id
    pageId ?
      this.newsItem = await this.spService.getNewsStory(pageId) : "";
    console.log(this.newsItem);
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
