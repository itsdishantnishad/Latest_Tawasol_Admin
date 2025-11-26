
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'FormsLibraryWebPartStrings';
import { IFormsLibraryProps } from './components/IFormsLibraryProps';
import App from './components/App';

export interface IFormsLibraryWebPartProps {
  libraryTitle: string;
}

export default class FormsLibraryWebPart
  extends BaseClientSideWebPart<IFormsLibraryWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IFormsLibraryProps> = React.createElement(
      App,
      {
        context: this.context,
        libraryTitle: this.properties.libraryTitle || 'Forms Library'
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
                PropertyPaneTextField('libraryTitle', {
                  label: 'Forms library title',
                  value: 'Forms Library'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}















