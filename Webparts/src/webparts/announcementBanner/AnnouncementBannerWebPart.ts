import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import AnnouncementBannerComponent from './components/AnnouncementBanner';
import { IAnnouncementBannerComponentProps } from './components/IAnnouncementBannerProps';
import { ListName } from '../services/Constants';

export interface IAnnouncementBannerWebPartProps {
  listTitle?: string;
}

export default class AnnouncementBannerWebPart
  extends BaseClientSideWebPart<IAnnouncementBannerWebPartProps> {

  public render(): void {
    const componentElement: React.ReactElement<IAnnouncementBannerComponentProps> =
      React.createElement(AnnouncementBannerComponent, {
        context: this.context,
        listTitle: this.properties.listTitle || ListName.ANNOUNCEMENT_BANNER
      });

    ReactDom.render(componentElement, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: 'Announcement Banner Settings' },
        groups: [{
          groupName: 'Data',
          groupFields: [
            PropertyPaneTextField('listTitle', {
              label: 'List Title',
              description: 'Defaults to "Announcement Banner"'
            }),
          ]
        }]
      }]
    };
  }
}
