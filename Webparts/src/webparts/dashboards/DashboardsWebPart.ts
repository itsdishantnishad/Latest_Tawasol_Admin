import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import Dashboard from './components/Dashboards';

export interface IDashboardWebPartProps {
  // keep empty for now (all data comes from lists)
}

export default class DashboardWebPart extends BaseClientSideWebPart<IDashboardWebPartProps> {
  public render(): void {
    const element: React.ReactElement = React.createElement(Dashboard, {
      context: this.context
    } as any);

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
