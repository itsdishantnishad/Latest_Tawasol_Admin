
import * as React from 'react';
import styles from './Events.module.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");
const Location_Icon_URL = require("../assets/LocationIcon.png");
const Time_Icon_URL = require("../assets/clockIcon.png");

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

const timeCountDown = (startDate: Date, nowMs: number): string => {
  const diffMs = Math.max(startDate.getTime() - nowMs, 0);
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

  // NOTE: status/isRegistered finalized in component using localStorage
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

  const [nowMs, setNowMs] = React.useState<number>(Date.now());

  React.useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const storageKey = React.useMemo(() => {
    try {
      const webUrl = (props.siteUrl || props.context?.pageContext.web.absoluteUrl || '').replace(/\/$/, '');
      const login = props.context?.pageContext.user.loginName || 'anonymous';
      return `tawasol_events_registered::${webUrl}::${login}`;
    } catch {
      return 'tawasol_events_registered';
    }
  }, [props.context, props.siteUrl]);

  const readRegisteredIds = React.useCallback((): Set<string> => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return new Set<string>();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set<string>(parsed.map((x) => String(x)));
      return new Set<string>();
    } catch {
      return new Set<string>();
    }
  }, [storageKey]);

  const writeRegisteredIds = React.useCallback((ids: Set<string>) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const applyRegistrationState = React.useCallback((list: IEvent[]): IEvent[] => {
    const ids = readRegisteredIds();
    const now = new Date();

    return (list || []).map((ev) => {
      const start = ev.startDate || null;
      const end = ev.endDate || null;

      const isPast =
        (end && end < now) ||
        (!end && start && start < now);

      const isRegistered = ids.has(ev.id);

      const status: IEvent['status'] =
        isPast ? 'past' : (isRegistered ? 'registered' : 'upcoming');

      return { ...ev, isRegistered, status };
    });
  }, [readRegisteredIds]);

  const handleRegister = React.useCallback((eventId: string) => {
    window.alert('Power Automate flow will be added');
    const ids = readRegisteredIds();
    ids.add(String(eventId));
    writeRegisteredIds(ids);
    setEvents((prev) => applyRegistrationState(prev));
  }, [applyRegistrationState, readRegisteredIds, writeRegisteredIds]);


  React.useEffect(() => {
    if (props.events && props.events.length > 0) {
      setEvents(applyRegistrationState(props.events));
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
          `?$select=Id,Title,BannerImageUrl,TIREventStartDate,TIREventEndDate,TIRLocation,TIREventCategory` +
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
            } catch(error) {
              console.log(error)
            }
            return item;
          })
        );

        const mapped: IEvent[] = (itemsWithLabels || [])
          .map(mapItemToEvent)
          .filter((event: IEvent) => event.date.day && event.date.month)
          .slice(0, top);

      
        setEvents(applyRegistrationState(mapped));
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
    props.topCount,
    applyRegistrationState
  ]);

 
  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || '').trim();

    if (!props.context) {
      return configured || '#';
    }

    const webUrl = props.context.pageContext.web.absoluteUrl.replace(/\/$/, '');
    const origin = new URL(webUrl).origin;

    const raw = configured || 'SitePages/Events-And-Trainings.aspx';

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    if (raw.startsWith('/')) {
      return `${origin}${raw}`;
    }

    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, props.context]);
  // --- END ---

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
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <img className={styles.decorativeLineLeft} src={leftHeadingLine} alt="" />
          <h2 className={styles.title}>Events</h2>
          <img className={styles.decorativeLineRight} src={rightHeadingLine} alt="" />
        </div>
        <p className={styles.subtitle}>Discover celebrations and entertainment happening around you.</p>
      </div>

      <div className={styles.eventsGrid}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div
              className={styles.eventImage}
              style={{ backgroundImage: `url(${event.image})` }}
            >
              {/* ✅ Pills hidden for now */}
              {/*
              <div className={styles.statusBadge}>
                {event.status === 'registered' && (
                  <span className={styles.registeredBadge}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#10B981" />
                      <path
                        d="M5 8L7 10L11 6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Registered
                  </span>
                )}

                {event.status === 'upcoming' && (
                  <span className={styles.upcomingBadge}>Upcoming</span>
                )}
              </div>
              */}

              <div className={styles.dateBadge}>
                <div className={styles.day}>{event.date.day}</div>
                <div className={styles.month}>{event.date.month}</div>
              </div>

              <div className={styles.categoryBadge}>{event.category}</div>
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

              {event.status === 'past' && (
                <p className={styles.pastEvent}>Past Event</p>
              )}

              {event.status === 'registered' &&
                event.startDate &&
                event.startDate.getTime() > nowMs && (
                  <div className={styles.countdownBar}>
                    <span className={styles.countdownLabel}>Events starts in</span>
                    <span className={styles.countdownValue}>
                      {timeCountDown(event.startDate, nowMs)}
                    </span>
                  </div>
                )}

              {event.status === 'upcoming' && (
                <button
                  className={styles.registerButton}
                  onClick={() => handleRegister(event.id)}
                >
                  Register
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <a href={viewAllHref} className={styles.viewAllButton}>
          View All
        </a>
      </div>
    </div>
  );
};

export default Events;
