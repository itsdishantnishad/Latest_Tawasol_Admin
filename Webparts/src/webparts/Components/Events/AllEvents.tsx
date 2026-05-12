import * as React from "react";
import moment from "moment";
import styles from "./Allevents.module.scss";
import EventCard from "./EventCard";
import PreviousEventCard from "./PreviousCard/PreviousEvents";
import CalendarViewComponent from "./Calendarview/CalendarView";
const NoEventsImage = require("../../assets/NoEventsImage.png");
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IAlleventsProps {
  AllEventItems: any;
  context?: any;
  viewtype?: string; // "list" or "calendar"
  isMobileView?: boolean
}

const uniqNums = (arr: number[]) =>
  Array.from(new Set(arr.filter((n) => Number.isFinite(n) && n > 0)));

const parseNumericIdList = (raw: any): number[] => {
  const text = String(raw || "");
  const tokens = text
    .split(/[,;\n\r]+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  const ids = tokens
    .filter((t) => /^\d+$/.test(t))
    .map((t) => parseInt(t, 10));

  return uniqNums(ids);
};

/** ✅ Prefer ISO token if SharePoint provides "display\nISO" */
const pickBestDateText = (v: any): string => {
  const s = String(v ?? "").trim();
  if (!s) return "";

  const parts = s
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const iso =
    parts.find((p) => /^\d{4}-\d{2}-\d{2}T/.test(p)) ||
    parts.find((p) => /\d{4}-\d{2}-\d{2}T/.test(p));

  return iso || parts[0] || "";
};

// ✅ MAIN parsing formats
const parseSPDate = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === "object" && value?.dateTime) {
    const rawObj = pickBestDateText(value.dateTime);

    const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(rawObj);
    const looksIso =
      /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(rawObj);

    const normalized =
      looksIso && !hasTz
        ? `${rawObj.includes(" ") ? rawObj.replace(" ", "T") : rawObj}Z`
        : rawObj;

    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }

  const raw = pickBestDateText(value);
  if (!raw) return null;

  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
  const looksIso =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(raw);

  const normalizedRaw =
    looksIso && !hasTz
      ? `${raw.includes(" ") ? raw.replace(" ", "T") : raw}Z`
      : raw;

  const d1 = new Date(normalizedRaw);
  if (!isNaN(d1.getTime())) return d1;

  const m = moment(
    normalizedRaw,
    [
      moment.ISO_8601,
      "DD/MM/YYYY",
      "DD/MM/YYYY HH:mm",
      "DD/MM/YYYY HH:mm:ss",
      "DD/MM/YYYY hh:mm A",
      "MM/DD/YYYY",
      "MM/DD/YYYY HH:mm",
      "MM/DD/YYYY hh:mm A",
      "YYYY-MM-DD HH:mm:ss",
    ],
    false
  );

  return m.isValid() ? m.toDate() : null;
};

const AllEvents: React.FC<IAlleventsProps> = (props) => {
  const now = new Date();
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
  const [showAllPrevious, setShowAllPrevious] = React.useState(false);

  const sp: SPFI | null = React.useMemo(() => {
    try {
      return props.context ? spfi().using(SPFx(props.context)) : null;
    } catch {
      return null;
    }
  }, [props.context]);

  const [myRegisteredIds, setMyRegisteredIds] = React.useState<number[]>([]);

  const getCurrentUserId = React.useCallback(async (): Promise<number> => {
    const legacyId = (props.context?.pageContext as any)?.legacyPageContext
      ?.userId;
    if (legacyId) return Number(legacyId);

    if (sp) {
      const me: any = await sp.web.currentUser.select("Id")();
      return Number(me?.Id || 0);
    }
    return 0;
  }, [props.context, sp]);

  const loadMyRegisteredIds = React.useCallback(async () => {
    if (!sp || !props.context) return;

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setMyRegisteredIds([]);
        return;
      }

      const rows: any[] = await sp.web.lists
        .getByTitle("Registered User Event")
        .items.select("Id", "AuthorId", "TIRRegisteredUsers", "Modified")
        .filter(`AuthorId eq ${userId}`)
        .top(5000)();

      const all: number[] = [];
      (rows || []).forEach((r) =>
        all.push(...parseNumericIdList(r?.TIRRegisteredUsers))
      );

      setMyRegisteredIds(uniqNums(all));
    } catch (e) {
      console.error("loadMyRegisteredIds failed", e);
      setMyRegisteredIds([]);
    }
  }, [sp, props.context, getCurrentUserId]);

  React.useEffect(() => {
    loadMyRegisteredIds();
  }, [loadMyRegisteredIds]);

  const parsedEvents = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (props.AllEventItems || [])
      .map((item: any) => {
        const start = parseSPDate(item?.eventStartDate);
        const end = parseSPDate(item?.eventEndDate);

        if (!start || !end) return null;

        const location = String(item?.location ?? "").split("\n")[0].trim();

        const eventId =
          Number(
            item?.ID ??
            item?.Id ??
            item?.id ??
            item?.ListItemID ??
            item?.ListItemId ??
            0
          ) || 0;

        const isReg = eventId ? myRegisteredIds.includes(eventId) : false;

        const fmt = (d: Date) =>
          d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

        const time = `${fmt(start)} - ${fmt(end)}`;

        const cardDate = start.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        return {
          ...item,
          start,
          end,
          Eventtype: "Events",
          ID: eventId,

          date: String(start.getDate()).padStart(2, "0"),
          month: months[start.getMonth()],
          day: days[start.getDay()],

          title: item?.title || "Untitled",
          time,
          location,
          eventDateTime: start,
          eventEndDateTime: end,
          cardDate,
          category: item?.category,
          imageUrl: item?.newsImage || "",

          isregistered: isReg,
          isRegistered: isReg,
          status: isReg ? "Registered" : "Upcoming",
        };
      })
      .filter(Boolean);
  }, [props.AllEventItems, myRegisteredIds]);

  const upcomingEvents = parsedEvents.filter((e: any) => {
    const end = e?.eventEndDateTime ? new Date(e.eventEndDateTime) : null;
    const start = e?.eventDateTime ? new Date(e.eventDateTime) : null;

    if (end && !isNaN(end.getTime())) return end.getTime() >= now.getTime();
    if (start && !isNaN(start.getTime())) return start.getTime() >= now.getTime();
    return false;
  });

  const previousEvents = parsedEvents.filter((e: any) => {
    const end = e?.eventEndDateTime ? new Date(e.eventEndDateTime) : null;
    const start = e?.eventDateTime ? new Date(e.eventDateTime) : null;

    if (end && !isNaN(end.getTime())) return end.getTime() < now.getTime();
    if (start && !isNaN(start.getTime())) return start.getTime() < now.getTime();
    return false;
  });

  const previousEventsSorted = React.useMemo(() => {
    return [...previousEvents].sort(
      (a: any, b: any) =>
        (b.eventDateTime?.getTime?.() || 0) - (a.eventDateTime?.getTime?.() || 0)
    );
  }, [previousEvents]);

  const previousEventsToRender = showAllPrevious
    ? previousEventsSorted
    : previousEventsSorted.slice(0, 3);

  const myEvents = parsedEvents.filter((e: any) => e.isregistered);

  const showCalendar = props.viewtype !== "list";


  const sourceList = activeTab === "my" ? myEvents : parsedEvents;

  const todayStart = moment().startOf("day");
  const todayEnd = moment().endOf("day");

  const hasTodayEvent = sourceList.some((item: any) => {
    const dt = item?.eventDateTime ? moment(item.eventDateTime) : null;
    return dt && dt.isBetween(todayStart, todayEnd, undefined, "[]");
  });

  const todayDividerText = hasTodayEvent
    ? `${moment().format("MMM D")} • Today`
    : moment().format("MMM D");


  return (
    <>
      <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>
          <button
            className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""
              }`}
            onClick={() => setActiveTab("all")}
          >
            All Events
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "my" ? styles.activeTab : ""
              }`}
            onClick={() => setActiveTab("my")}
          >
            My Events
          </button>
        </div>
      </div>

      {activeTab === "all" ? (
        <>
          {showCalendar && (
            <>
              <CalendarViewComponent
                events={parsedEvents}
                context={props.context}
                from="Events"
              />
              {props.isMobileView && (
                <div className={styles.mobileDateDivider}>
                  <span>{todayDividerText}</span>
                </div>
              )}
            </>
          )}

          {(!showCalendar || props.isMobileView) && (
            <div className={styles.eventsContainer}>
              <div className={styles.eventsWrapper}>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event: any, index: any) => (
                    <EventCard key={index} {...event} />
                  ))
                ) : (
                  <p>No upcoming events found.</p>
                )}
              </div>

              <div className={styles.previousEventsContainer}>
                <div className={styles.previousHeaderRow}>
                  <h2 className={styles.heading}>Previous Events</h2>
                </div>

                <div className={styles.gridLayout}>
                  {previousEventsToRender.length > 0 ? (
                    previousEventsToRender.map((event: any, index: any) => (
                      <PreviousEventCard
                        key={index}
                        title={event.title}
                        date={event.cardDate}
                        imageUrl={event.imageUrl}
                        imageCount={0}
                        pageUrl={event?.pageUrl}
                      />
                    ))
                  ) : (
                    <p>No previous events found.</p>
                  )}
                </div>

                {!showAllPrevious && previousEventsSorted.length > 3 && (
                  <button
                    type="button"
                    className={styles.viewAllButton}
                    onClick={() => setShowAllPrevious(true)}
                    aria-label="View all previous events"
                  >
                    View All
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {showCalendar && (
            <>
              <CalendarViewComponent
                events={myEvents}
                context={props.context}
                from="Events"
              />

              {props.isMobileView && (
                <div className={styles.mobileDateDivider}>
                  <span>{todayDividerText}</span>
                </div>
              )}
            </>
          )}
          {(!showCalendar || props.isMobileView) && (
            <div className={styles.eventsContainer}>
              <div className={styles.eventsWrapper}>
                {myEvents.length > 0 ? (
                  myEvents.map((event: any, index: any) => (
                    <EventCard key={index} {...event} />
                  ))
                ) : (
                  <div className={styles.noEventsCard}>
                    <img
                      src={NoEventsImage}
                      alt="No Events"
                      className={styles.noEventsImg}
                    />
                    <h3 className={styles.noEventsTitle}>No Events</h3>
                    <p className={styles.noEventsText}>No upcoming events for you</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AllEvents;
