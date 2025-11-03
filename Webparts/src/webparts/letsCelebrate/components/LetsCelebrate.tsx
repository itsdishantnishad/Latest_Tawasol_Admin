import * as React from 'react';
// import styles from './LetsCelebrate.module.scss';
import stylesNav from '../../Components/NavTabs/NavTabs.module.scss';
import type { ILetsCelebrateProps } from './ILetsCelebrateProps';
import NewJoiner from './NewJoiner/NewJoiner';
import { BirthdayData } from './Birthday/BirthdayData';
import Birthday from './Birthday/Birthday';
import { listServices } from '../../services/listServices';
import NavTabs, { NavTabsOption } from '../../Components/NavTabs/NavTabs'; // adjust path if needed

export interface ILetsCelebrateState {
  selectedTab: 'birthdays' | 'anniversaries' | 'newJoiners';
  newJoinersData: any[];
}

export default class LetsCelebrate extends React.Component<ILetsCelebrateProps, ILetsCelebrateState> {
  private spService: listServices;

  constructor(props: ILetsCelebrateProps) {
    super(props);
    this.state = {
      selectedTab: 'birthdays',
      newJoinersData: []
    };
    this.spService = new listServices(this.props.context);
  }

  async componentDidMount() {
    const newJoinerData = await this.spService.getNewJoiners("New Joiner");
    this.setState({ newJoinersData: newJoinerData });
  }

  private handleTabChange = (tab: ILetsCelebrateState['selectedTab']) => {
    this.setState({ selectedTab: tab });
  }

  public render(): React.ReactElement<ILetsCelebrateProps> {
    const { selectedTab, newJoinersData } = this.state;

    const tabs: NavTabsOption<ILetsCelebrateState['selectedTab']>[] = [
      { key: 'birthdays', label: 'Birthdays' },
      { key: 'anniversaries', label: 'Anniversaries' },
      { key: 'newJoiners', label: 'New Joiners' },
    ];

    return (
      <div>
        <NavTabs
          tabs={tabs}
          value={selectedTab}
          onChange={this.handleTabChange}
          className={stylesNav.navTabs} // wrapper styles in LetsCelebrate.module.scss
          tabClassName={stylesNav.tab} // optional per-tab styles
        />

        <div>
          {(selectedTab === 'birthdays' || selectedTab === 'anniversaries') && (
            <Birthday items={BirthdayData} />
          )}

          {selectedTab === 'newJoiners' && (
            <NewJoiner items={newJoinersData} />
          )}
        </div>
      </div>
    );
  }
}
