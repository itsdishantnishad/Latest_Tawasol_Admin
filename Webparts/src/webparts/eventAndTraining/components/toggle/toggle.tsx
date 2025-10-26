import * as React from 'react';
import styles from './EventsTrainingsToggle.module.scss';
import { Icon } from '@fluentui/react/lib/Icon';
import Trainingmodule from '../../../Components/Trainings/Training';
import Allevents from '../../../Components/Events/AllEvents';

export interface IEventsTrainingsToggleProps {
  onToggleChange?: (selectedTab: 'events' | 'trainings') => void;
  onSearchChange?: (searchText: string) => void;
  Trainingdata?: any[];
  Eventdata?: any[];
  context?: any;
}

const EventsTrainingsToggle: React.FC<IEventsTrainingsToggleProps> = ({
  Trainingdata = [],
  Eventdata = [],
  context,
  onToggleChange,
  onSearchChange
}) => {
  const [selectedTab, setSelectedTab] = React.useState<'events' | 'trainings'>('events');
  const [searchText, setSearchText] = React.useState<string>('');

  const handleToggle = (tab: 'events' | 'trainings') => {
    setSelectedTab(tab);
    setSearchText(''); 
    onToggleChange?.(tab);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setSearchText(text);
    onSearchChange?.(text);
  };

  // Filter data based on search text and active tab
  const filteredEvents = React.useMemo(() => {
    if (!searchText) return Eventdata;
    return Eventdata.filter(event =>
      event.title?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [Eventdata, searchText]);

  const filteredTrainings = React.useMemo(() => {
    if (!searchText) return Trainingdata;
    return Trainingdata.filter(training =>
      training.title?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [Trainingdata, searchText]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.toggleWrapper}>
          <div className={styles.toggleContainer}>
            <button
              className={`${styles.toggleButton} ${selectedTab === 'events' ? styles.active : ''}`}
              onClick={() => handleToggle('events')}
            >
              Events
            </button>
            <button
              className={`${styles.toggleButton} ${selectedTab === 'trainings' ? styles.active : ''}`}
              onClick={() => handleToggle('trainings')}
            >
              Trainings
            </button>
          </div>
        </div>

        <div className={styles.searchContainer}>
          <Icon iconName="Search" className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={`Search ${selectedTab === 'events' ? 'Events' : 'Trainings'}`}
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div>
        {selectedTab === 'events' ? (
          <Allevents          
            AllEventItems={filteredEvents}
            context={context}
          />
        ) : (
          <Trainingmodule           
            AllTrainingdata={filteredTrainings}
          />
        )}
      </div>
    </>
  );
};

export default EventsTrainingsToggle;
