import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'MoreForYouWebPartStrings';
import MoreForYou from './components/MoreForYou';
import { IMoreForYouProps } from './components/IMoreForYouProps';

export interface IMoreForYouWebPartProps {
  description: string;
  viewAllUrl: string; 
}

export default class MoreForYouWebPart extends BaseClientSideWebPart<IMoreForYouWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IMoreForYouProps> = React.createElement(
      MoreForYou,
      {
        context: this.context,
        viewAllUrl: this.properties.viewAllUrl
      }
    );

    ReactDom.render(element, this.domElement);
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
                }),
                PropertyPaneTextField('viewAllUrl', {
                  label: 'View All URL',
                  placeholder: 'e.g. /sites/Portal/SitePages/News.aspx or https://...'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
