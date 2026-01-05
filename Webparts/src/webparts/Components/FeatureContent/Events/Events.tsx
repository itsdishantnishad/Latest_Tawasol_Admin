import * as React from 'react';
import styles from './Events.module.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
import ConditionalLink from '../../ConditionalLink/ConditionalLink';
import EventRegistration from '../../Events/Registration/RegistrationModal';
import { EventsTrainingsTabKey } from "../../NavTabs/eventsTrainingsTabs";

const Location_Icon_URL = require("../assets/LocationIcon.svg");
const Time_Icon_URL = require("../assets/clockIcon.svg");

/** SITE-LEVEL TIR EVENT CONTENT TYPE BASE ID */
const TIR_EVENT_CT_BASE_ID =
  '0x0101009D1CB255DA76424F860D91F20E6C41180091B43BD03BCDD947979C2884C4C8FF39';

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
  location?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isRegistered?: boolean;
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

  let imageUrl = 'https://via.placeholder.com/400x250?text=Event';
  const banner = item.BannerImageUrl;

  if (banner) {
    if (typeof banner === 'string') {
      const firstPart = banner.split(',')[0].trim();
      if (firstPart) imageUrl = firstPart;
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
    status: 'upcoming',
    location: item.TIRLocation || '',
    startDate: start,
    endDate: end,
    isRegistered: false
  };
};

export const Events: React.FC<IEventsProps> = (props) => {
  const [events, setEvents] = React.useState<IEvent[]>(props.events || []);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);

  // ======================
  //  DYNAMIC VIEW-ALL URL 
  // ======================
  const webUrl: string | undefined =
    props.context?.pageContext.web.absoluteUrl.replace(/\/$/, "");

  const origin: string | undefined = webUrl
    ? new URL(webUrl).origin
    : undefined;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();
    const raw = configured || "SitePages/Events-and-Trainings.aspx";

    if (!webUrl || !origin) return raw;

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    if (raw.startsWith("/")) {
      return `${origin}${raw}`;
    }

    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // =========================================================

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

        const webUrl = props.siteUrl || props.context!.pageContext.web.absoluteUrl;
        const listTitle = props.listTitle || 'Site Pages';
        const top = props.topCount || 4;
        const fetchTop = Math.max(top * 3, 20);
        const safeListTitle = listTitle.replace(/'/g, "''");

        const requestUrl =
          `${webUrl}/_api/web/lists/getbytitle('${safeListTitle}')/items` +
          `?$select=Id,Title,BannerImageUrl,TIREventStartDate,TIREventEndDate,TIRLocation,TIREventCategory,ContentTypeId` +
          `&$filter=startswith(ContentTypeId,'${TIR_EVENT_CT_BASE_ID}') and TIREventStartDate ne null` +
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

        const itemsWithLabels = await Promise.all(
          (json.value || []).map(async (item: any) => {
            try {
              const textUrl =
                `${webUrl}/_api/web/lists/getbytitle('${safeListTitle}')/items(${item.Id})/FieldValuesAsText`;

              const textResponse = await props.context!.spHttpClient.get(
                textUrl,
                SPHttpClient.configurations.v1
              );

              if (textResponse.ok) {
                const textJson = await textResponse.json();
                const textData = textJson.d || textJson.value || textJson;

                return {
                  ...item,
                  TIREventCategory: textData.TIREventCategory || item.TIREventCategory,
                  TIREventCategory_0: textData.TIREventCategory
                };
              }
            } catch {
              // ignore
            }
            return item;
          })
        );

        const mapped: IEvent[] = itemsWithLabels
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
  }, [
    props.events,
    props.context,
    props.listTitle,
    props.siteUrl,
    props.topCount
  ]);

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
      <div className={styles.eventsGrid}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div
              className={styles.eventImage}
              style={{ backgroundImage: `url(${event.image})` }}
            >
              <div className={styles.dateBadge}>
                <div className={styles.day}>{event.date.day}</div>
                <div className={styles.month}>{event.date.month}</div>
              </div>

              {event.category && (
                <div className={styles.categoryBadge}>{event.category}</div>
              )}
            </div>

            <div className={styles.eventContent}>
              <h3 className={styles.eventTitle}>{event.title}</h3>

              <div className={styles.metaRow}>
                <img className={styles.metaIcon} src={Time_Icon_URL} alt="" />
                <span className={styles.metaText}>{event.time}</span>
              </div>

              {!!event.location && (
                <div className={styles.metaRow}>
                  <img className={styles.metaIcon} src={Location_Icon_URL} alt="" />
                  <span className={styles.metaText}>{event.location}</span>
                </div>
              )}
              <button
                className={styles.registerButton}
                onClick={() => {
                  setSelectedEventId(event.id);
                  setIsRegisterOpen(true);
                }}
              >
                Register
              </button>
            </div>
          </div>
        ))}
      </div>

      {isRegisterOpen && selectedEventId && props.context && (
        <EventRegistration
          isOpen={isRegisterOpen}
          onDismiss={() => setIsRegisterOpen(false)}
          context={props.context}
          eventId={selectedEventId}
        />
      )}

      <div className={styles.buttonContainer}>
        <ConditionalLink
          to={`${viewAllHref}?tab=${EventsTrainingsTabKey.Events}`}
        >
          <PrimaryButton label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Events;
