import * as React from 'react';
import type { IEventAndTrainingProps } from './IEventAndTrainingProps';
import EventsTrainingsToggle from '../components/toggle/toggle';
import { LoadingBoundary } from '../../Components/LoadingShimmer/LoadingBoundary';

export interface IEventAndTrainingState {
  selectedTab: any;
}

export default class EventAndTraining extends React.Component<IEventAndTrainingProps, IEventAndTrainingState> {
  constructor(props: IEventAndTrainingProps) {
    super(props);
    this.state = {
      selectedTab: "event"
    };
  }

  public render(): React.ReactElement<IEventAndTrainingProps> {
    const {
      trainingItem: AlltrainingItem,
      EventItem: AllEventItems,
      MeetingsData,
      isLoading,
      loadError,
      onRetry
    } = this.props;

    return (
      <LoadingBoundary
        loading={!!isLoading}
        error={loadError}
        errorMessage="Some data failed to load. You can retry."
        onRetry={onRetry}
        preset="card"
        count={3}
        gap={14}
        ariaLabel="Loading Events & Trainings"
      >
        <EventsTrainingsToggle
          Trainingdata={AlltrainingItem || []}
          Eventdata={AllEventItems || []}
          MeetingsData={MeetingsData || []}
          context={this.props.context}
        />
      </LoadingBoundary>
    );
  }
}
