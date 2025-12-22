import type { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ILetsMeetDetailProps {
  context: WebPartContext;
  sitePagesListTitle?: string;
  contentTypeName?: string;
  maxSuggestions?: number;
  openYouTubeInNewTab?: boolean;
}
