export interface IEventAndTrainingProps {
  trainingItem?: any;
  EventItem?: any;
  MeetingsData?: any[];
  context?: any;
  isLoading?: boolean;
  loadError?: unknown;
  onRetry?: () => void;
}
