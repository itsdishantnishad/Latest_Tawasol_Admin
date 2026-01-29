import * as React from "react";
import moment from "moment";

import EventCard from "../Events/EventCard";
import Trainingcard from "../Trainings/TrainingCard";
import MeetingCard from "../TeamsMeeting/MeetingCard";
import CalendarViewComponent from "../Events/Calendarview/CalendarView";

import styles from "../Events/Allevents.module.scss";
import { SPHttpClient } from "@microsoft/sp-http";

interface IAllComponentProps {
  filteredEvents: any[];
  filteredTrainings: any[];
  filteredMeetings: any[];
  context?: any;
  viewMode: "list" | "calendar";
}

const safeStr = (v: any) => String(v ?? "").split("\n")[0].trim();

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

/** Robust date parser (ISO-prefer + UTC-safe) */
const parseSPDate = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === "object") {
    const dt = (value as any)?.dateTime || (value as any)?.DateTime;
    if (dt) {
      const rawObj = pickBestDateText(dt);
      const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(rawObj);
      const looksIso =
        /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(rawObj);

      const normalized =
        looksIso && !hasTz
          ? `${rawObj.includes(" ") ? rawObj.replace(" ", "T") : rawObj}Z`
          : rawObj;

      const dObj = new Date(normalized);
      return isNaN(dObj.getTime()) ? null : dObj;
    }
  }

  const raw = pickBestDateText(value);
  if (!raw) return null;

  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
  const looksIso =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(raw);

  const normalized =
    looksIso && !hasTz
      ? `${raw.includes(" ") ? raw.replace(" ", "T") : raw}Z`
      : raw;

  const d1 = new Date(normalized);
  if (!isNaN(d1.getTime())) return d1;

  const m = moment(
    normalized,
    [
      moment.ISO_8601,
      "DD/MM/YYYY",
      "DD/MM/YYYY HH:mm",
      "DD/MM/YYYY HH:mm:ss",
      "DD/MM/YYYY hh:mm A",
      "MM/DD/YYYY",
      "MM/DD/YYYY HH:mm",
      "MM/DD/YYYY HH:mm:ss",
      "MM/DD/YYYY hh:mm A",
      "YYYY-MM-DD",
      "YYYY-MM-DD HH:mm",
      "YYYY-MM-DD HH:mm:ss",
    ],
    false
  );

  return m.isValid() ? m.toDate() : null;
};

const pickId = (x: any): string =>
  safeStr(
    x?.trainingId ??
      x?.meetingId ??
      x?.iCalUId ??
      x?.ID ??
      x?.Id ??
      x?.id ??
      x?.ListItemID ??
      x?.ListItemId ??
      x?.listItemId ??
      ""
  ) || "";

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const isNotNull = <T,>(x: T | null | undefined): x is T => !!x;
const sortAsc = (a: { start: Date }, b: { start: Date }) =>
  a.start.getTime() - b.start.getTime();

/**
 * ✅ FIX: Registration flag normalizer
 * Handles boolean / number / string / and also status text
 */
const normalizeIsRegistered = (item: any): boolean => {
  const raw =
    item?.isRegistered ??
    item?.isregistered ??
    item?.IsRegistered ??
    item?.Registered ??
    item?.registered;

  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;

  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase();
    if (["1", "true", "yes", "y"].includes(s)) return true;
    if (["0", "false", "no", "n"].includes(s)) return false;
  }

  const st = String(item?.status ?? item?.Status ?? "").trim().toLowerCase();
  if (st.includes("register")) return true;

  return false;
};

/** ✅ same helpers as AllEvents.tsx (your schema uses TIRRegisteredUsers) */
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

/** Ensure TrainingCard gets the fields it expects */
const mapTrainingForCard = (item: any, index: number): any | null => {
  const startRaw =
    item?.trainingStartDate ??
    item?.startDate ??
    item?.start ??
    item?.eventStartDate ??
    item?.TIRTrainingStartDate ??
    item?.TIREventStartDate;

  const endRaw =
    item?.trainingEndDate ??
    item?.endDate ??
    item?.end ??
    item?.eventEndDate ??
    item?.TIRTrainingEndDate ??
    item?.TIREventEndDate;

  const startParsed = parseSPDate(startRaw);
  if (!startParsed) return null;

  const endParsed = parseSPDate(endRaw) || startParsed;

  const start: Date = startParsed;
  const end: Date = endParsed;

  const spIdNum = Number(item?.ID ?? item?.Id ?? item?.id ?? 0) || 0;
  const id = pickId(item) || String(spIdNum || index + 1);

  const meetingLink = safeStr(
    item?.joiningURL ||
      item?.joiningUrl ||
      item?.meetingLink ||
      item?.MeetingLink ||
      item?.joinUrl
  );

  const pageUrl = safeStr(item?.pageUrl || item?.Path || item?.path || "#");

  const timeRange = `${fmtTime(start)} - ${fmtTime(end)}`;

  const durationDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  const isReg = normalizeIsRegistered(item) || !!meetingLink;

  return {
    ...item,

    id,
    ID: id,
    trainingId: spIdNum || Number(id) || index + 1,

    imageUrl: item?.newsImage || item?.imageUrl || "",
    category: item?.category || item?.Category || "Training",
    title: item?.title || item?.Title || "Training",

    timeRange,
    time: timeRange,

    startDate: safeStr(startRaw) || start.toISOString(),
    endDate: safeStr(endRaw) || end.toISOString(),

    duration: `${durationDays} day${durationDays > 1 ? "s" : ""}`,

    location: safeStr(item?.location),
    meetingLink,
    joinUrl: meetingLink || "#",
    pageUrl,

    start,
    end,
    Eventtype: "Trainings",
    isRegistered: isReg,
    isregistered: isReg,
    status: isReg ? "Registered" : "Upcoming",
  };
};

const Allcomponent: React.FC<IAllComponentProps> = ({
  filteredEvents = [],
  filteredTrainings = [],
  filteredMeetings = [],
  context,
  viewMode,
}) => {
  const now = new Date();
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");

  // ✅ FIX: Load registered Event IDs from "Registered User Event" → TIRRegisteredUsers (same as AllEvents.tsx)
  const [myRegisteredEventIds, setMyRegisteredEventIds] = React.useState<number[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!context) {
          if (!cancelled) setMyRegisteredEventIds([]);
          return;
        }

        // get userId
        let userId: number | undefined =
          (context.pageContext as any)?.legacyPageContext?.userId;

        if (!userId) {
          const meUrl = `${context.pageContext.web.absoluteUrl}/_api/web/currentuser?$select=Id`;
          const meRes = await context.spHttpClient.get(meUrl, SPHttpClient.configurations.v1);
          if (!meRes.ok) {
            if (!cancelled) setMyRegisteredEventIds([]);
            return;
          }
          const me = await meRes.json();
          userId = Number(me?.Id) || 0;
        }

        if (!userId) {
          if (!cancelled) setMyRegisteredEventIds([]);
          return;
        }

        const url =
          `${context.pageContext.web.absoluteUrl}` +
          `/_api/web/lists/getbytitle('${encodeURIComponent("Registered User Event")}')/items` +
          `?$top=1&$select=Id,AuthorId,TIRRegisteredUsers&$filter=AuthorId eq ${userId}`;

        const resp = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
        if (!resp.ok) {
          if (!cancelled) setMyRegisteredEventIds([]);
          return;
        }

        const json = await resp.json();
        const row = Array.isArray(json?.value) ? json.value[0] : null;
        const ids = parseNumericIdList(row?.TIRRegisteredUsers);

        if (!cancelled) setMyRegisteredEventIds(ids);
      } catch {
        if (!cancelled) setMyRegisteredEventIds([]);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [context]);

  const parsedEvents: any[] = React.useMemo(() => {
    return (filteredEvents || [])
      .map((item: any, idx: number) => {
        const startRaw =
          item?.eventStartDate ??
          item?.TIREventStartDate ??
          item?.startDate ??
          item?.start ??
          item?.eventDateTime;

        const endRaw =
          item?.eventEndDate ??
          item?.TIREventEndDate ??
          item?.endDate ??
          item?.end;

        const startParsed = parseSPDate(startRaw);
        if (!startParsed) return null;

        const endParsed = parseSPDate(endRaw) || startParsed;

        const start: Date = startParsed;
        const end: Date = endParsed;

        const eventIdNum =
          Number(
            item?.ID ??
              item?.Id ??
              item?.id ??
              item?.ListItemID ??
              item?.ListItemId ??
              0
          ) || 0;

        const id =
          pickId(item) ||
          String(eventIdNum || Number(item?.ID ?? item?.Id ?? item?.id ?? 0) || idx + 1);

        // ✅ IMPORTANT FIX: registration based on TIRRegisteredUsers list
        const isReg =
          (eventIdNum ? myRegisteredEventIds.includes(eventIdNum) : false) ||
          normalizeIsRegistered(item);

        const day = start.toLocaleDateString("en-US", { weekday: "long" });
        const date = String(start.getDate()).padStart(2, "0");
        const month = start.toLocaleDateString("en-US", { month: "short" });

        return {
          ...item,
          ID: id,
          id,

          day,
          date,
          month,

          title: item?.title || item?.Title || "Untitled",
          category: item?.category || item?.Category || "",
          imageUrl: item?.newsImage || item?.imageUrl || item?.Image || "",
          time: `${fmtTime(start)} - ${fmtTime(end)}`,
          location: safeStr(item?.location),
          pageUrl: safeStr(item?.pageUrl || item?.Path || item?.path || ""),
          eventDateTime: start,

          isregistered: isReg,
          isRegistered: isReg,
          status: isReg ? "Registered" : "Upcoming",

          start,
          end,
          Eventtype: item?.Eventtype || "Events",
        };
      })
      .filter(isNotNull);
  }, [filteredEvents, myRegisteredEventIds]);

  const parsedTrainings: any[] = React.useMemo(() => {
    return (filteredTrainings || [])
      .map((it: any, idx: number) => mapTrainingForCard(it, idx))
      .filter(isNotNull);
  }, [filteredTrainings]);

  const meetings: any[] = React.useMemo(
    () => (filteredMeetings || []).slice(),
    [filteredMeetings]
  );

  const isUpcomingOrOngoing = (start?: Date, end?: Date) => {
    const s = start instanceof Date ? start : undefined;
    const e = end instanceof Date ? end : undefined;
    const effectiveEnd = e || s;
    if (!effectiveEnd) return false;
    return effectiveEnd.getTime() >= now.getTime();
  };

  const allUpcomingEvents = React.useMemo(
    () =>
      [...parsedEvents]
        .filter((e) => isUpcomingOrOngoing(e.start, e.end))
        .sort(sortAsc),
    [parsedEvents, now]
  );

  const myUpcomingEvents = React.useMemo(
    () =>
      [...parsedEvents]
        .filter((e) => (e.isRegistered || e.isregistered) && isUpcomingOrOngoing(e.start, e.end))
        .sort(sortAsc),
    [parsedEvents, now]
  );

  const allUpcomingTrainings = React.useMemo(
    () =>
      [...parsedTrainings]
        .filter((t) => isUpcomingOrOngoing(t.start, t.end))
        .sort(sortAsc),
    [parsedTrainings, now]
  );

  const myUpcomingTrainings = React.useMemo(
    () =>
      [...parsedTrainings]
        .filter((t) => (t.isRegistered || t.isregistered) && isUpcomingOrOngoing(t.start, t.end))
        .sort(sortAsc),
    [parsedTrainings, now]
  );

  const upcomingMeetings = React.useMemo(() => {
    return (meetings || []).filter((m) => {
      const s =
        m?.start instanceof Date
          ? m.start
          : parseSPDate(m?.start?.dateTime ?? m?.start);
      const e =
        m?.end instanceof Date ? m.end : parseSPDate(m?.end?.dateTime ?? m?.end);

      if (!s && !e) return true;
      return isUpcomingOrOngoing(s || undefined, e || undefined);
    });
  }, [meetings, now]);

  const showCalendar = viewMode !== "list";

  const allCalendarItems = React.useMemo(
    () => [...allUpcomingEvents, ...allUpcomingTrainings, ...upcomingMeetings],
    [allUpcomingEvents, allUpcomingTrainings, upcomingMeetings]
  );

  const myCalendarItems = React.useMemo(
    () => [...myUpcomingEvents, ...myUpcomingTrainings, ...upcomingMeetings],
    [myUpcomingEvents, myUpcomingTrainings, upcomingMeetings]
  );

  const showLegend = !showCalendar;

  return (
    <>
      <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "all" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("all")}
            type="button"
          >
            All Events & Trainings
          </button>

          <button
            className={`${styles.tabButton} ${
              activeTab === "my" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("my")}
            type="button"
          >
            My Events & Trainings
          </button>
        </div>
      </div>

      {showLegend && (
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchEvent}`} />
            <span>Events</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchTraining}`} />
            <span>Trainings</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchTeams}`} />
            <span>Teams Meeting</span>
          </div>
        </div>
      )}

      {activeTab === "all" ? (
        showCalendar ? (
          <CalendarViewComponent events={allCalendarItems} context={context} from="All" />
        ) : (
          <>
            <h2 className={styles.heading}>Events</h2>
            <div className={styles.eventsWrapper}>
              {allUpcomingEvents.length > 0 ? (
                allUpcomingEvents.map((e, i) => (
                  <EventCard key={e.id || i} {...(e as any)} />
                ))
              ) : (
                <div className={styles.emptyState}>No upcoming events found.</div>
              )}
            </div>

            <h2 className={styles.heading}>Trainings</h2>
            <div className={styles.eventsWrapper}>
              {allUpcomingTrainings.length > 0 ? (
                allUpcomingTrainings.map((t, i) => (
                  <Trainingcard key={t.id || i} {...(t as any)} context={context} />
                ))
              ) : (
                <div className={styles.emptyState}>No upcoming trainings found.</div>
              )}
            </div>

            <h2 className={styles.heading}>Meetings</h2>
            <div className={styles.eventsWrapper}>
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((m, i) => (
                  <MeetingCard key={m?.id || i} event={m} />
                ))
              ) : (
                <div className={styles.emptyState}>No meetings scheduled for you.</div>
              )}
            </div>
          </>
        )
      ) : showCalendar ? (
        <CalendarViewComponent events={myCalendarItems} context={context} from="My" />
      ) : (
        <>
          <h2 className={styles.heading}>Events</h2>
          <div className={styles.eventsWrapper}>
            {myUpcomingEvents.length > 0 ? (
              myUpcomingEvents.map((e, i) => (
                <EventCard key={e.id || i} {...(e as any)} />
              ))
            ) : (
              <div className={styles.emptyState}>No registered upcoming events.</div>
            )}
          </div>

          <h2 className={styles.heading}>Trainings</h2>
          <div className={styles.eventsWrapper}>
            {myUpcomingTrainings.length > 0 ? (
              myUpcomingTrainings.map((t, i) => (
                <Trainingcard key={t.id || i} {...(t as any)} context={context} />
              ))
            ) : (
              <div className={styles.emptyState}>No registered upcoming trainings.</div>
            )}
          </div>

          <h2 className={styles.heading}>Meetings</h2>
          <div className={styles.eventsWrapper}>
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((m, i) => (
                <MeetingCard key={m?.id || i} event={m} />
              ))
            ) : (
              <div className={styles.emptyState}>No meetings scheduled for you.</div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Allcomponent;
