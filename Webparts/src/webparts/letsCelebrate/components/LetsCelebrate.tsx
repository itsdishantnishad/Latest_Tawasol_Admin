import * as React from 'react';
// import styles from './LetsCelebrate.module.scss';
import type { ILetsCelebrateProps } from './ILetsCelebrateProps';
import { SelectTabData, SelectTabEvent, Tab, TabList } from "@fluentui/react-components";
import NewJoiner from './NewJoiner/NewJoiner';
import { NewJoinersData } from './NewJoiner/NewJoinerData';
import { BirthdayData } from './Birthday/BirthdayData';
import Birthday from './Birthday/Birthday';

export interface ILetsCelebrateState {
  selectedTab: any;
}

export default class LetsCelebrate extends React.Component<ILetsCelebrateProps, ILetsCelebrateState> {
  public constructor(props: ILetsCelebrateProps) {
    super(props);
    this.state = {
      selectedTab: "global"
    };
  }

  public render(): React.ReactElement<ILetsCelebrateProps> {
    const {

    } = this.props;


    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
      this.setState({
        selectedTab: data.value
      })

      switch (data.value) {
        case "birthday":
          // setNewsArticles([...globalNews]);
          // setNewsType("Company News");
          return;
        case "anniversary":
          // setNewsArticles([...localNews]);
          // setNewsType("Local News");
          return;
        case "newJoiners":
          // setNewsArticles([...subscribedNews]);
          // setNewsType("My News");
          return;
        default:
        // setNewsArticles([...globalNews]);
      }
    };


    return (
      <div>
        <TabList selectedValue={this.state.selectedTab} onTabSelect={onTabSelect} selectTabOnFocus={true} size="large">
          <Tab id="Company News" value="birthday">
            Birthday
          </Tab>
          <Tab id="Local News" value="anniversary">
            Anniversary
          </Tab>
          <Tab id="My News" value="newJoiners">
            New Joiners
          </Tab>
        </TabList>
        <div>
          {this.state.selectedTab === "birthday" &&
            <Birthday items={BirthdayData} />}
          {this.state.selectedTab === "newJoiners" &&
            <NewJoiner items={NewJoinersData}></NewJoiner>
          }
        </div>
      </div>
    );
  }
}
