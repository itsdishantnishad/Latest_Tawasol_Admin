import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, DisplayMode } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'GlobalBannerWebPartStrings';
import Banner from './components/GlobalBanner';
import { IBannerProps } from './components/IGlobalBannerProps';
import { initUrlConstants } from '../assets/constants';

export interface IBannerWebPartProps {
  titleFirst: string;
  titleSecond: string;
  bannerSubTitle: string;
  customBannerUrl: string;
}

export default class BannerWebPart extends BaseClientSideWebPart<IBannerWebPartProps> {

  protected async onInit(): Promise<void> {
    initUrlConstants(this.context);
    return super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<IBannerProps> = React.createElement(Banner, {
      ...this.properties,
      displayMode: this.displayMode
    });

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
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('titleFirst', {
                  label: 'Put the First Title which you want to be in Red Text and Italic',
                  placeholder: 'e.g., Our'
                }),
                PropertyPaneTextField('titleSecond', {
                  label: 'Put the Second Title which you want to be in Black Text',
                  placeholder: 'e.g., Values'
                }),
                PropertyPaneTextField('bannerSubTitle', {
                  label: 'Description below title',
                  placeholder: 'Leave blank to use Default Banner'
                }),
                PropertyPaneTextField('customBannerUrl', {
                  label: 'Banner Image/SVG URL',
                  placeholder: 'Paste SVG/image URL from Site Assets › Global Banner Folder'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
