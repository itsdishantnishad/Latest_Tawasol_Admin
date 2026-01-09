import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBadgeItem {
  name: string;
  imageUrl: string;
}

/**
 * React component props (Profile Header component)
 */
export interface IProfilePageHeaderProps {
  context: WebPartContext;
  badges?: IBadgeItem[];
  fullName?: string;
  department?: string;
  selectedBadge?: IBadgeItem | null;
}

/**
 * WebPart property pane props (10 badges - same as your existing webpart)
 */
export interface IProfilePageHeaderWebPartProps {
  description: string;

  badge1Name?: string;  badge1ImageUrl?: string;
  badge2Name?: string;  badge2ImageUrl?: string;
  badge3Name?: string;  badge3ImageUrl?: string;
  badge4Name?: string;  badge4ImageUrl?: string;
  badge5Name?: string;  badge5ImageUrl?: string;
  badge6Name?: string;  badge6ImageUrl?: string;
  badge7Name?: string;  badge7ImageUrl?: string;
  badge8Name?: string;  badge8ImageUrl?: string;
  badge9Name?: string;  badge9ImageUrl?: string;
  badge10Name?: string; badge10ImageUrl?: string;
}
