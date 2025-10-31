import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'GlobalBannerWebPartStrings';
import Banner from './components/GlobalBanner';
import { IBannerProps } from './components/IGlobalBannerProps';

export enum BannerType {
  TYPE_1 = 'Default Banner',
  TYPE_2 = 'Document Banner',
  TYPE_3 = 'Plain Banner'
}

export interface IBannerWebPartProps {
  bannerTitle: string;        // optional override
  bannerSubTitle: string;     // optional override
  bannerType: BannerType;     // strictly selected; no runtime fallback
  customBannerUrl: string;    // optional; overrides preset SVGs
}

export default class BannerWebPart extends BaseClientSideWebPart<IBannerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IBannerProps> = React.createElement(Banner, {
      ...this.properties
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
                PropertyPaneChoiceGroup('bannerType', {
                  label: 'Select banner type',
                  options: [
                    { key: BannerType.TYPE_1, text: BannerType.TYPE_1, iconProps: { officeFabricIconFontName: 'MicrosoftStaffhubLogo' } },
                    { key: BannerType.TYPE_2, text: BannerType.TYPE_2, iconProps: { officeFabricIconFontName: 'Home' } },
                    { key: BannerType.TYPE_3, text: BannerType.TYPE_3, iconProps: { officeFabricIconFontName: 'GripperBarHorizontal' } }
                  ]
                }),
                PropertyPaneTextField('bannerTitle', {
                  label: 'Please enter banner title',
                  placeholder: 'Leave blank to use default from constants.ts'
                }),
                PropertyPaneTextField('bannerSubTitle', {
                  label: 'Please enter description below title',
                  placeholder: 'Leave blank to use default from constants.ts'
                }),
                PropertyPaneTextField('customBannerUrl', {
                  label: 'Optional: Custom Banner Image URL',
                  placeholder: 'Paste an image URL to override the preset SVG'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
