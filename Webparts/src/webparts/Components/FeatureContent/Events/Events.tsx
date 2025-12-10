
import * as React from 'react';
import styles from './Events.module.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

export interface IEvent {
  id: string;
  title: string;
  time: string;
  category: string;
  image: string;
  date: {
    day: string;
    month: string;
  };
  status: 'registered' | 'past' | 'upcoming';
  eventStartTime?: string;
}

export interface IEventsProps {
  events?: IEvent[];
  onViewAll?: () => void;
  seeAllURL?: string;
  context?: WebPartContext;
  listTitle?: string;   
  siteUrl?: string;     
  topCount?: number;  
}

const formatTime = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDay = (date: Date | null): string => {
  if (!date) return '';
  return date.getDate().toString().padStart(2, '0');
};

const formatMonth = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleString(undefined, { month: 'short' }).toUpperCase();
};

const mapItemToEvent = (item: any): IEvent => {
  const start = item.TIREventStartDate ? new Date(item.TIREventStartDate) : null;
  const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : null;

  const time =
    start && end
      ? `${formatTime(start)} - ${formatTime(end)}`
      : start
      ? formatTime(start)
      : '';

  const now = new Date();
  let status: IEvent['status'] = 'upcoming';

  if (end && end < now) {
    status = 'past';
  } else if (start && start <= now && (!end || end >= now)) {
    status = 'registered';
  }

  // Managed metadata → category
  let categoryLabel = '';

  if (item.TIREventCategory) {
    if (typeof item.TIREventCategory === 'string') {
      categoryLabel = item.TIREventCategory;
    } else if (item.TIREventCategory.Label) {
      categoryLabel = item.TIREventCategory.Label;
    }
  }

  if (!categoryLabel && item.TIREventCategory_0) {
    categoryLabel = item.TIREventCategory_0;
  }

  // Banner image 
  let imageUrl = 'https://via.placeholder.com/400x250?text=Event';
  const banner = item.BannerImageUrl;

  if (banner) {
    if (typeof banner === 'string') {
      const firstPart = banner.split(',')[0].trim();
      if (firstPart) {
        imageUrl = firstPart;
      }
    } else if (banner.Url) {
      imageUrl = banner.Url;
    }
  }

  return {
    id: item.Id.toString(),
    title: item.Title || 'Untitled Event',
    time,
    category: categoryLabel,
    image: imageUrl,
    date: {
      day: formatDay(start),
      month: formatMonth(start)
    },
    status,
    eventStartTime: undefined 
  };
};

export const Events: React.FC<IEventsProps> = (props) => {
  const [events, setEvents] = React.useState<IEvent[]>(props.events || []);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (props.events && props.events.length > 0) {
      setEvents(props.events);
      return;
    }
    if (!props.context) {
      setEvents([]);
      return;
    }

    const loadEvents = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const webUrl =
          props.siteUrl || props.context!.pageContext.web.absoluteUrl;
        const listTitle = props.listTitle || 'Site Pages';
        const top = props.topCount || 4;

        const fetchTop = Math.max(top * 3, 20);
        const safeListTitle = listTitle.replace(/'/g, "''");

        const requestUrl =
          `${webUrl}/_api/web/lists/getbytitle('${safeListTitle}')/items` +
          `?$select=Id,Title,BannerImageUrl,TIREventStartDate,TIREventEndDate,TIRLocation` +
          `&$filter=TIREventStartDate ne null` +
          `&$orderby=TIREventStartDate desc` +
          `&$top=${fetchTop}`;

        const response: SPHttpClientResponse =
          await props.context!.spHttpClient.get(
            requestUrl,
            SPHttpClient.configurations.v1
          );

        if (!response.ok) {
          throw new Error(`SharePoint request failed: ${response.statusText}`);
        }

        const json = await response.json();

        if (!json.value || json.value.length === 0) {
          setEvents([]);
          return;
        }

        // Fetch FieldValuesAsText for each item to get managed metadata labels
        const itemsWithLabels = await Promise.all(
          (json.value || []).map(async (item: any) => {
            try {
              const textUrl = `${webUrl}/_api/web/lists/getbytitle('${safeListTitle}')/items(${item.Id})/FieldValuesAsText`;
              const textResponse: SPHttpClientResponse =
                await props.context!.spHttpClient.get(
                  textUrl,
                  SPHttpClient.configurations.v1
                );

              if (textResponse.ok) {
                const textJson: any = await textResponse.json();
                const textData = textJson.d || textJson.value || textJson;
                return { ...item, ...textData };
              }
            } catch {
              // ignore and use original item
            }
            return item;
          })
        );

        const mapped: IEvent[] = (itemsWithLabels || [])
          .map(mapItemToEvent)
          .filter((event: IEvent) => event.date.day && event.date.month)
          .slice(0, top);

        setEvents(mapped);
      } catch (e: any) {
        setError(e?.message || 'Unknown error');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [props.events, props.context, props.listTitle, props.siteUrl, props.topCount]);

  if (loading) {
    return <div className={styles.eventsContainer}>Loading events...</div>;
  }

  if (error) {
    return (
      <div className={styles.eventsContainer}>
        <p style={{ color: 'red' }}>Error loading events: {error}</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className={styles.eventsContainer}>
        <p>No events found</p>
      </div>
    );
  }

  return (
    <div className={styles.eventsContainer}>
      {/* Events Grid */}
      <div className={styles.eventsGrid}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div
              className={styles.eventImage}
              style={{ backgroundImage: `url(${event.image})` }}
            >
              <div className={styles.statusBadge}>
                {/* Registered pill (for registered events) */}
                {event.status === 'registered' && (
                  <span className={styles.registeredBadge}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#10B981" />
                      <path  d="M5 8L7 10L11 6"  stroke="white" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Registered
                  </span>
                )}

                {/* Upcoming pill (future, not registered) */}
                {event.status === 'upcoming' && (
                  <span className={styles.upcomingBadge}>
                    Upcoming
                  </span>
                )}
              </div>

              <div className={styles.dateBadge}>
                <div className={styles.day}>{event.date.day}</div>
                <div className={styles.month}>{event.date.month}</div>
              </div>
              <div className={styles.categoryBadge}>{event.category}</div>
            </div>

            <div className={styles.eventContent}>
              <h3 className={styles.eventTitle}>{event.title}</h3>
              <p className={styles.eventTime}>{event.time}</p>

              {/* Past event label */}
              {event.status === 'past' && (
                <p className={styles.pastEvent}>Past Event</p>
              )}

              {/* Countdown / starting info (e.g. "Event starting in 14:59:00") */}
              {event.eventStartTime && (
                <p className={styles.startingTime}>{event.eventStartTime}</p>
              )}

              {/* Register button – only for upcoming (not registered) events */}
              {event.status === 'upcoming' && (
                <button className={styles.registerButton}>Register</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className={styles.buttonContainer}>
        <a href={props.seeAllURL} className={styles.viewAllButton}>
          View All
        </a>
      </div>
    </div>
  );
};

export default Events;
