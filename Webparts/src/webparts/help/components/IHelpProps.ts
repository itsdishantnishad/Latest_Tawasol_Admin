import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IHelpProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;   
  listTitle: string;
  chatBotDeepLink?: string;
  showChatBot?: boolean;
}