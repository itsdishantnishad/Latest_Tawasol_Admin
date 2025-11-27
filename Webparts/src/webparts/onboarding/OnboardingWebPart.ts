// src/webparts/onboarding/OnboardingWebPart.ts
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-webpart-base';

// ✅ correct paths for your folder structure
import Onboarding from './components/Onboarding';
import { IOnboardingProps } from './components/IOnboardingProps';

export interface IOnboardingWebPartProps {
  startUrl?: string; // e.g., /sites/Intranet/Home.aspx
}

export default class OnboardingWebPart extends BaseClientSideWebPart<IOnboardingWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IOnboardingProps> = React.createElement(Onboarding, {
      onStart: () => {
        const url = this.properties.startUrl?.trim() || this.context.pageContext.web.absoluteUrl;
        window.location.href = url;
      },
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('startUrl', { label: 'Start URL (on last slide)' }),
              ],
            },
          ],
        },
      ],
    };
  }
}
