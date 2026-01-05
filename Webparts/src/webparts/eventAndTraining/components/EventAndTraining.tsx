import * as React from 'react';
import styles from './EventAndTraining.module.scss';
import type { IEventAndTrainingProps } from './IEventAndTrainingProps';
// import { SelectTabData, SelectTabEvent, Tab, TabList } from "@fluentui/react-components";
// import AllEvents from '../../Components/Events/AllEvents';
// import Training from '../../Components/Trainings/Training';
import EventsTrainingsToggle from '../components/toggle/toggle';
import { CardTitle } from './cardTitle/cardTitle';
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
    const { trainingItem: AlltrainingItem, EventItem: AllEventItems,MeetingsData } =
      this.props;

    // const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    //   this.setState({
    //     selectedTab: data.value
    //   })
    // }


    return (
       <>
        {/* <div className={styles.bannerContainer}>
          <CardTitle />
        </div> */}
        <EventsTrainingsToggle
          Trainingdata={AlltrainingItem}
          Eventdata={AllEventItems}
          MeetingsData={MeetingsData}
          context={this.props.context}
        />
      </>
      // <>
      //   <TabList selectedValue={this.state.selectedTab} onTabSelect={onTabSelect} selectTabOnFocus={true} size="large">
      //     <Tab id="Events" value="events">
      //       Events
      //     </Tab>
      //     <Tab id="trainings" value="trainings">
      //       Trainings
      //     </Tab>
      //   </TabList>
      //   {this.state.selectedTab === "events" && <AllEvents {...this.props} />}
      //   {this.state.selectedTab === "trainings" && <Training {...this.props} />}
      // </>
    );
  }
}
