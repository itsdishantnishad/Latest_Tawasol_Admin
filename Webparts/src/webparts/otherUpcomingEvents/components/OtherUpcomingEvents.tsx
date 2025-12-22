import * as React from 'react';
import styles from './OtherUpcomingEvents.module.scss';
import type { IOtherUpcomingEventsProps } from './IOtherUpcomingEventsProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class OtherUpcomingEvents extends React.Component<IOtherUpcomingEventsProps> {
  
  private getUpcomingEvents = () => {
    const { EventItem: AllEventItems } = this.props;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // Filter events that are after current date
    const upcomingEvents = AllEventItems
      .filter((event:any) => {
        // Parse the ISO date string from eventStartDate
        const eventDateStr = event.eventStartDate.split('\n\n')[1]; // Get ISO format date
        const eventDate = new Date(eventDateStr);
        return eventDate >= currentDate;
      })
      // Sort by start date (earliest first)
      .sort((a:any, b:any) => {
        const dateA = new Date(a.eventStartDate.split('\n\n')[1]);
        const dateB = new Date(b.eventStartDate.split('\n\n')[1]);
        return dateA.getTime() - dateB.getTime();
      })
      // Get only first 3 events
      .slice(0, 3);

    return upcomingEvents;
  };

  private formatDate = (dateString: string): string => {
    // Extract ISO date from the format "12/22/2025 8:30:00 AM\n\n2025-12-22T08:30:00Z"
    const isoDate = dateString.split('\n\n')[1];
    const date = new Date(isoDate);
    
    // Format as "7 June 2024"
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  public render(): React.ReactElement<IOtherUpcomingEventsProps> {
    const upcomingEvents = this.getUpcomingEvents();

    return (
      <div className={styles.otherUpcomingEvents}>
        <div className={styles.eventsContainer}>
          {upcomingEvents.map((event:any, index:any) => (
            <div key={event.ID} className={styles.eventCard}>
              <a href={event.pageUrl} className={styles.eventLink}>
                <div className={styles.eventImageWrapper}>
                  <img 
                    src={event.newsImage} 
                    alt={escape(event.title)}
                    className={styles.eventImage}
                  />
                  <span className={styles.upcomingBadge}>Upcoming</span>
                </div>
                <div className={styles.eventContent}>
                  <h3 className={styles.eventTitle}>{escape(event.title)}</h3>
                  <p className={styles.eventDate}>
                    {this.formatDate(event.eventStartDate)}
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }
}