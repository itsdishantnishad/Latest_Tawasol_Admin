import { WebPartContext } from "@microsoft/sp-webpart-base";
import { AnnouncementBannerListItem } from "../../services/listServices";

export interface IAnnouncementBannerComponentProps {
  context: WebPartContext;
  listTitle?: string; 
}

export interface IAnnouncementBannerComponentState {
  isLoading: boolean;
  errorMessage?: string;
  activeItems: AnnouncementBannerListItem[];
  acknowledgedItemMap: Record<number, boolean>;
  acknowledgingItemId?: number
  isShowingThumbsUpAnimation: boolean;
}
