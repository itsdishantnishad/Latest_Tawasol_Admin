import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import GreetingsBanner from './components/GreetingsBanner';
import { IGreetingsBannerProps } from './components/IGreetingsBannerProps';

export interface IGreetingsBannerWebPartProps {}

export default class GreetingsBannerWebPart extends BaseClientSideWebPart<IGreetingsBannerWebPartProps> {
  private _renderTimerId: number | undefined;

  public render(): void {
    const element: React.ReactElement<IGreetingsBannerProps> = React.createElement(GreetingsBanner, {
      spfxContext: this.context,
      getGraphClient: async () => this.context.msGraphClientFactory.getClient('3')
    });

    // 1 sec delay
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
    }
    this._renderTimerId = window.setTimeout(() => {
      ReactDom.render(element, this.domElement);
    }, 1000);
  }

  protected onDispose(): void {
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
