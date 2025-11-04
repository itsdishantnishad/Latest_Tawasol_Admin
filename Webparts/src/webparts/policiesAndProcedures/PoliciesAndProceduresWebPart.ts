import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import Landing from './components/Landing';

export interface IPoliciesAndProceduresWebPartProps {
  title: string;
}

export default class PoliciesAndProceduresWebPart
  extends BaseClientSideWebPart<IPoliciesAndProceduresWebPartProps> {

  public render(): void {
    const element = React.createElement(Landing, {
      title: this.properties.title || 'Policies & Procedures'
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
}
