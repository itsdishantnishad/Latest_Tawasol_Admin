import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ITeamOrganisationStructureProps {
  context: WebPartContext;
  /** Optional override from the property pane; if empty we’ll use the enum default */
  listTitle?: string;
}
