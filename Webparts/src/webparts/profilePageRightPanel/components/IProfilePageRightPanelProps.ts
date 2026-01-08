import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IProfilePageRightPanelProps {
  context: WebPartContext;

  // Optional navigation targets (so buttons still work after old App.tsx is deleted)
  applyLeaveUrl?: string;
  hrLetterUrl?: string;

  // RightSection options
  sticky?: boolean;
  stickyTop?: number;
  eventsTrainingTab?: "events" | "training";

  className?: string;
}
