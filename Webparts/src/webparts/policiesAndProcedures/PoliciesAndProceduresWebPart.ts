//import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import Landing from './components/Landing';
import GlobalBreadcrumbs from '../assets/GlobalBreadcrumbs';
import { initUrlConstants } from '../assets/constants';

// ✅ Shared shimmer wrapper
import { LoadingBoundary } from '../Components/LoadingShimmer';

export interface IPoliciesAndProceduresWebPartProps {
  title: string;
}

export default class PoliciesAndProceduresWebPart
  extends BaseClientSideWebPart<IPoliciesAndProceduresWebPartProps> {

  private _renderTimerId?: number;
  private readonly _renderDelayMs: number = 1500;

  protected async onInit(): Promise<void> {
    initUrlConstants(this.context);
    return super.onInit();
  }

  public render(): void {
    // clear any pending render
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    // ✅ Shimmer immediately (no spinner/loader)
    const shimmer = React.createElement(LoadingBoundary, {
      loading: true,
      preset: "card" as any,
      count: 8,
      ariaLabel: "Loading Policies & Procedures",
      children: React.createElement("div", { style: { minHeight: 420 } }),
    });

    ReactDom.render(shimmer, this.domElement);

    // ✅ Delay actual mount
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
