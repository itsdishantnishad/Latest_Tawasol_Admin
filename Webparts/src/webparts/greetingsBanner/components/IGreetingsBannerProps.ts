import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

export interface IGreetingsBannerProps {
  spfxContext: WebPartContext;
  getGraphClient: () => Promise<MSGraphClientV3>;
}
