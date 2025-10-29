import * as React from 'react';
import styles from './LetsCelebrate.module.scss';
import type { ILetsCelebrateProps } from './ILetsCelebrateProps';
import NewJoiner from './NewJoiner/NewJoiner';
import { BirthdayData } from './Birthday/BirthdayData';
import Birthday from './Birthday/Birthday';
import { listServices } from '../../services/listServices';

// If you want to reuse the NewJoiner tab styles, import them (optional)
// import newJoinerStyles from './NewJoiner/NewJoiner.module.scss';

export interface ILetsCelebrateState {
  selectedTab: 'birthdays' | 'anniversaries' | 'newJoiners';
  newJoinersData: any[];
}

export default class LetsCelebrate extends React.Component<ILetsCelebrateProps, ILetsCelebrateState> {
  private spService: listServices;

  constructor(props: ILetsCelebrateProps) {
    super(props);
    this.state = {
      // map old "birthday" -> "birthdays" to follow the new UI naming
      selectedTab: 'birthdays',
      newJoinersData: []
    };
    this.spService = new listServices(this.props.context);
  }

  async componentDidMount() {
    const newJoinerData = await this.spService.getNewJoiners("New Joiner");
    this.setState({ newJoinersData: newJoinerData });
  }

  private handleTabClick = (tab: ILetsCelebrateState['selectedTab']) => {
    this.setState({ selectedTab: tab });
  }

  public render(): React.ReactElement<ILetsCelebrateProps> {
    const { selectedTab, newJoinersData } = this.state;

    // Simple tab config — adjust labels/classes to match your styles
    const tabs = [
      { key: 'birthdays' as const, label: 'Birthdays' },
      { key: 'anniversaries' as const, label: 'Anniversaries' },
      { key: 'newJoiners' as const, label: 'New Joiners' },
    ];

    return (
      <div>
        {/* New tab UI (button-based). Replace className values with your SCSS names. */}
        <div className={styles.letsCelebrateTabs}> 
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.letsCelebrateTab} ${selectedTab === tab.key ? styles.active : ''}`}
              onClick={() => this.handleTabClick(tab.key)}
              type="button"
              aria-pressed={selectedTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {(selectedTab === 'birthdays' || selectedTab === 'anniversaries') && (
            // The old component expected BirthdayData; you can adapt BirthdayData
            // to contain either birthdays or anniversaries as needed.
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
