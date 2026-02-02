//import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';

import Landing from './components/Landing';
import GlobalBreadcrumbs from '../assets/GlobalBreadcrumbs';
import { initUrlConstants } from '../assets/constants';

// ✅ Shared shimmer wrapper (Option 1)
import { LoadingBoundary } from '../Components/LoadingShimmer';

export interface IPoliciesAndProceduresWebPartProps {
  title: string;
}

export default class PoliciesAndProceduresWebPart
  extends BaseClientSideWebPart<IPoliciesAndProceduresWebPartProps> {

  // ✅ Delay mounting the whole webpart (shimmer shows instantly)
  private _renderTimerId?: number;
  private readonly _renderDelayMs: number = 1500;

  protected async onInit(): Promise<void> {
    initUrlConstants(this.context);
    return super.onInit();
  }

  public render(): void {
    // clear any pending render (important when properties change / re-render)
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    // ✅ Show shimmer immediately (no spinner/loader)
    const shimmer = React.createElement(LoadingBoundary, {
      loading: true,
      preset: 'card' as any,
      count: 10,
      ariaLabel: 'Loading Policies and Procedures',
      // children to reserve space
      children: React.createElement('div', { style: { minHeight: 520 } })
    });

    ReactDom.render(shimmer, this.domElement);

    // ✅ Delay the actual render
    this._renderTimerId = window.setTimeout(() => {
      const element = React.createElement(Landing, {
        title: this.properties.title || 'Policies & Procedures',
        context: this.context
      });

      ReactDom.render(element, this.domElement);
      this._renderTimerId = undefined;
    }, this._renderDelayMs);
  }

  protected onDispose(): void {
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    ReactDom.unmountComponentAtNode(this.domElement);
  }
  //protected get dataVersion(): Version { return Version.parse('1.0'); }
}
