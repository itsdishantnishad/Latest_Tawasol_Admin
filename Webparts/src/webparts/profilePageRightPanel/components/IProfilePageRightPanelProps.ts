import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IProfilePageRightPanelProps {
  context: WebPartContext;
  applyLeaveUrl?: string;
  hrLetterUrl?: string;
  hrLetterHeroUrl?: string;
  eventsTrainingViewAllUrl?: string;
  sticky?: boolean;
  stickyTop?: number;
  eventsTrainingTab?: "events" | "training";
  className?: string;
}