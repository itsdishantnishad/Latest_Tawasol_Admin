// export interface IEventGalleryProps {
//   context: any;
//   EventItem?: any;
// }


import type { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IEventGalleryProps {
  context: WebPartContext;
  EventItem: any[];

  sitePagesListTitle: string;
  contentTypeName: string;
  maxItems: number;
  letsMeetDescription: string;
}
