import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import VivaEngageHeader from './components/VivaEngageHeader';
import { IVivaEngageHeaderProps } from './components/IVivaEngageHeaderProps';

export interface IVivaEngageHeaderWebPartProps { }

export default class VivaEngageHeaderWebPart
  extends BaseClientSideWebPart<IVivaEngageHeaderWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IVivaEngageHeaderProps> = React.createElement(
      VivaEngageHeader,
      {} // hard-coded; no props
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
