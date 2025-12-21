
import type { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ILetsMeetGalleryProps {
  context: WebPartContext;
  sitePagesListTitle?: string;   
  contentTypeName?: string;     
  maxItems?: number;
  letsMeetDescription?: string;             
}
