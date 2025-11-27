import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface INewsStoryProps {
  interval: number;
  context: WebPartContext;
  detailsPageUrl?: string;
}
