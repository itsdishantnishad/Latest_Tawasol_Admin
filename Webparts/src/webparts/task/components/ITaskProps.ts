// src/webparts/task/components/ITaskProps.ts
import { HttpClient } from '@microsoft/sp-http';

export interface ITaskProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  userEmail: string;
  httpClient: HttpClient;
}
