import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import GreetingsBanner from './components/GreetingsBanner';
import { IGreetingsBannerProps } from './components/IGreetingsBannerProps';

export interface IGreetingsBannerWebPartProps {}

export default class GreetingsBannerWebPart extends BaseClientSideWebPart<IGreetingsBannerWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IGreetingsBannerProps> = React.createElement(GreetingsBanner, {
      spfxContext: this.context,
      getGraphClient: async () => this.context.msGraphClientFactory.getClient('3')
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
