import * as React from "react";
import moment from "moment";

import EventCard from "../Events/EventCard";
import Trainingcard from "../Trainings/TrainingCard";
import MeetingCard from "../TeamsMeeting/MeetingCard";
import CalendarViewComponent from "../Events/Calendarview/CalendarView";

import styles from "../Events/Allevents.module.scss";
import { SPHttpClient, MSGraphClientV3 } from "@microsoft/sp-http";

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
      "M/D/YYYY h:mm A",
      "M/D/YYYY h:mm:ss A",
      "M/D/YYYY H:mm",
      "M/D/YYYY",
      "DD/MM/YYYY",
      "DD/MM/YYYY HH:mm",
    ],
    true
  );

  return m.isValid() ? m.toDate() : null;
};

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

const daysBetween = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
};

const isNotNull = <T,>(x: T | null | undefined): x is T => x !== null && x !== undefined;

const toServerRelativeUrl = (pathOrUrl: string): string => {
  const s = String(pathOrUrl || "").trim();
  if (!s) return "";
  try {
    if (/^https?:\/\//i.test(s)) {
      return new URL(s).pathname;
    }
  } catch {
    // ignore
  }
  return s;
};

const escapeODataString = (s: string): string => String(s || "").replace(/'/g, "''");

const safeUrlFromHyperlinkField = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return String(v?.Url ?? v?.url ?? "").trim();
};

const parseNumericIdList = (raw: any): number[] => {
  const s = String(raw ?? "").trim();
  if (!s) return [];

  const parts = s
    .split(/[,;|\s]+/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const nums = parts
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n) && n > 0);

  return Array.from(new Set(nums));
};

type PersonInfo = { name: string; avatarUrl: string };

type TrainingMeta = { id: number; joinUrl: string };

type SettledResult<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: any };

const allSettled = async <T,>(promises: Promise<T>[]): Promise<SettledResult<T>[]> => {
  return Promise.all(
    promises.map((p) =>
      p.then((value) => ({ status: 'fulfilled', value } as const))
       .catch((reason) => ({ status: 'rejected', reason } as const))
    )
  );
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

  // ----------------------------
  // Graph: resolve instructor name + avatar (cache by email)
  // ----------------------------
  const [personByEmail, setPersonByEmail] = React.useState<Record<string, PersonInfo>>({});
  const personCacheRef = React.useRef<Record<string, PersonInfo>>({});

  const blobToDataUrl = React.useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const toBase64Utf8 = React.useCallback((input: string): string => {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  const getDefaultAvatar = React.useCallback(
    (nameOrEmail: string): string => {
      const safe = String(nameOrEmail || "").trim() || "User";
      const initials = safe
        .split(" ")
        .map((n) => n?.trim()?.[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

      const colors = [
        "#0078D4",
        "#00A4EF",
        "#50E6FF",
        "#8764B8",
        "#881798",
        "#E43BA6",
        "#E74856",
        "#F7630C",
        "#FFB900",
        "#00CC6A",
      ];

      const colorIndex =
        safe.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

      const bgColor = colors[colorIndex];

      const svg = `
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" fill="${bgColor}"/>
        <text x="50%" y="50%"
              text-anchor="middle"
              dy=".35em"
              font-family="Segoe UI, Arial, sans-serif"
              font-size="20"
              font-weight="600"
              fill="white">
          ${initials}
        </text>
      </svg>
    `.trim();

      return `data:image/svg+xml;base64,${toBase64Utf8(svg)}`;
    },
    [toBase64Utf8]
  );

  const ensurePeopleFromGraph = React.useCallback(
    async (emails: string[]) => {
      const ctx = context;
      if (!ctx?.msGraphClientFactory) return;

      const unique = Array.from(
        new Set((emails || []).map((e) => String(e || "").trim()).filter(Boolean))
      );
      const missing = unique.filter((e) => !personCacheRef.current[e]);
      if (!missing.length) return;

      const graph: MSGraphClientV3 = await ctx.msGraphClientFactory.getClient("3");

      const updates: Record<string, PersonInfo> = {};

      for (const email of missing) {
        let displayName = email;

        // 1) display name
        try {
          const user = await graph.api(`/users/${email}`).select("displayName").get();
          if (user?.displayName) displayName = user.displayName;
        } catch {
          // ignore
        }

        // 2) photo (fallback to initials)
        let avatarUrl = "";
        try {
          const photoResponse = await graph.api(`/users/${email}/photo/$value`).get();

          let blob: Blob;
          if (photoResponse instanceof ArrayBuffer) {
            blob = new Blob([photoResponse], { type: "image/jpeg" });
          } else if (photoResponse instanceof Blob) {
            blob = photoResponse;
          } else {
            throw new Error("Unexpected photo response type");
          }

          avatarUrl = await blobToDataUrl(blob);
        } catch {
          avatarUrl = getDefaultAvatar(displayName || email);
        }

        updates[email] = { name: displayName, avatarUrl };
      }

      if (Object.keys(updates).length) {
        setPersonByEmail((prev) => {
          const next = { ...prev, ...updates };
          personCacheRef.current = next;
          return next;
        });
      }
    },
    [context, blobToDataUrl, getDefaultAvatar]
  );

  // ✅ Load registered Event IDs from "Registered User Event" → TIRRegisteredUsers
  const [myRegisteredEventIds, setMyRegisteredEventIds] = React.useState<number[]>([]);

  // ✅ Load my Registered Training IDs from "Registered Training" → TIRTrainingID
  const [myRegisteredTrainingIds, setMyRegisteredTrainingIds] = React.useState<number[]>([]);

  // ✅ Resolve Site Pages meta by FileRef (Id + TIRJoiningURL)
  const [trainingMetaByFileRef, setTrainingMetaByFileRef] = React.useState<Record<string, TrainingMeta>>({});

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!context) {
          if (!cancelled) {
            setMyRegisteredEventIds([]);
            setMyRegisteredTrainingIds([]);
          }
          return;
        }

        // get userId
        let userId: number | undefined = (context.pageContext as any)?.legacyPageContext?.userId;

        if (!userId) {
          const meUrl = `${context.pageContext.web.absoluteUrl}/_api/web/currentuser?$select=Id`;
          const meRes = await context.spHttpClient.get(meUrl, SPHttpClient.configurations.v1);
          if (!meRes.ok) {
            if (!cancelled) {
              setMyRegisteredEventIds([]);
              setMyRegisteredTrainingIds([]);
            }
            return;
          }
          const me = await meRes.json();
          userId = Number(me?.Id) || 0;
        }

        if (!userId) {
          if (!cancelled) {
            setMyRegisteredEventIds([]);
            setMyRegisteredTrainingIds([]);
          }
          return;
        }

        // Events registrations
        const eventUrl =
          `${context.pageContext.web.absoluteUrl}` +
          `/_api/web/lists/getbytitle('${encodeURIComponent("Registered User Event")}')/items` +
          `?$top=1&$select=Id,AuthorId,TIRRegisteredUsers&$filter=AuthorId eq ${userId}`;

        const eventResp = await context.spHttpClient.get(eventUrl, SPHttpClient.configurations.v1);
        if (eventResp.ok) {
          const json = await eventResp.json();
          const row = Array.isArray(json?.value) ? json.value[0] : null;
          const ids = parseNumericIdList(row?.TIRRegisteredUsers);
          if (!cancelled) setMyRegisteredEventIds(ids);
        } else {
          if (!cancelled) setMyRegisteredEventIds([]);
        }

        // Trainings registrations
        const trUrl =
          `${context.pageContext.web.absoluteUrl}` +
          `/_api/web/lists/getbytitle('${encodeURIComponent("Registered Training")}')/items` +
          `?$top=5000&$select=Id,AuthorId,TIRTrainingID&$filter=AuthorId eq ${userId}`;

        const trResp = await context.spHttpClient.get(trUrl, SPHttpClient.configurations.v1);
        if (trResp.ok) {
          const trJson = await trResp.json();
          const ids = Array.isArray(trJson?.value)
            ? trJson.value
                .map((r: any) => Number(r?.TIRTrainingID))
                .filter((n: number) => Number.isFinite(n) && n > 0)
            : [];

          if (!cancelled) setMyRegisteredTrainingIds(Array.from(new Set(ids)));
        } else {
          if (!cancelled) setMyRegisteredTrainingIds([]);
        }
      } catch {
        if (!cancelled) {
          setMyRegisteredEventIds([]);
          setMyRegisteredTrainingIds([]);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [context]);

  // Resolve Site Pages meta (Id + join URL) for trainings.
  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!context || !(filteredTrainings || []).length) return;

        const webUrl = context.pageContext.web.absoluteUrl;
        const fileRefs = (filteredTrainings || [])
          .map((t: any) => safeStr(t?.pageUrl || t?.Path || t?.path || ""))
          .map(toServerRelativeUrl)
          .filter(Boolean);

        const unique = Array.from(new Set(fileRefs));
        const missing = unique.filter((ref) => !trainingMetaByFileRef[ref]);
        if (!missing.length) return;

        const results = await allSettled(
          missing.map(async (fileRef) => {
            const url =
              `${webUrl}` +
              `/_api/web/lists/getbytitle('${encodeURIComponent("Site Pages")}')/items` +
              `?$top=1&$select=Id,FileRef,TIRJoiningURL&$filter=FileRef eq '${escapeODataString(fileRef)}'`;

            const resp = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
            if (!resp.ok) return null;

            const json = await resp.json();
            const row = Array.isArray(json?.value) ? json.value[0] : null;
            if (!row) return null;

            const id = Number(row?.Id || 0);
            const joinUrl = safeUrlFromHyperlinkField(row?.TIRJoiningURL);

            return id > 0 ? { fileRef, id, joinUrl } : null;
          })
        );

        const updates: Record<string, TrainingMeta> = {};
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value) {
            updates[r.value.fileRef] = { id: r.value.id, joinUrl: r.value.joinUrl };
          }
        }

        if (!cancelled && Object.keys(updates).length) {
          setTrainingMetaByFileRef((prev) => ({ ...prev, ...updates }));
        }
      } catch {
        // ignore
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [context, filteredTrainings, trainingMetaByFileRef]);

  const sortAsc = React.useCallback((a: any, b: any) => {
    const aT = a?.start?.getTime?.() ?? a?.eventDateTime?.getTime?.() ?? 0;
    const bT = b?.start?.getTime?.() ?? b?.eventDateTime?.getTime?.() ?? 0;
    return aT - bT;
  }, []);

  const parsedEvents: any[] = React.useMemo(() => {
    return (filteredEvents || [])
      .map((item: any, idx: number) => {
        const idRaw = item?.ID ?? item?.Id ?? item?.ListItemID ?? item?.ListItemId ?? idx + 1;
        const id = Number(idRaw) || idx + 1;

        const start = parseSPDate(item?.eventStartDate || item?.EventStartDate || item?.startDate || item?.StartDate);
        const end = parseSPDate(item?.eventEndDate || item?.EventEndDate || item?.endDate || item?.EndDate);

        if (!start || !end) return null;

        const eventIdNum = Number(item?.eventId ?? item?.EventId ?? item?.ID ?? item?.Id);

        const isReg = (eventIdNum ? myRegisteredEventIds.includes(eventIdNum) : false);

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
      .map((item: any, idx: number) => {
        const startRaw =
          item?.eventStartDate || item?.EventStartDate || item?.startDate || item?.StartDate;

        const endRaw =
          item?.eventEndDate || item?.EventEndDate || item?.endDate || item?.EndDate;

        const start = parseSPDate(startRaw);
        const end = parseSPDate(endRaw);
        if (!start || !end) return null;

        const durationDays = daysBetween(start, end);
        const timeRange = `${fmtTime(start)} - ${fmtTime(end)}`;

        const pageUrl = safeStr(item?.pageUrl || item?.Path || item?.path || "");
        const fileRef = toServerRelativeUrl(pageUrl);

        const meta = fileRef ? trainingMetaByFileRef[fileRef] : undefined;
        const trainingId = Number(meta?.id || item?.ListItemID || item?.ListItemId || item?.ID || item?.Id || 0);

        const meetingLink = safeStr(
          meta?.joinUrl ||
            item?.joiningURL ||
            item?.joiningUrl ||
            item?.meetingLink ||
            item?.MeetingLink ||
            ""
        );

        const idForKey = trainingId || idx + 1;

        return {
          ...item,

          id: idForKey,
          ID: idForKey,

          trainingId,

          imageUrl: item?.newsImage || item?.imageUrl || item?.Image || "",
          category: item?.category || item?.Category || "Classroom",
          title: item?.title || item?.Title || "Untitled",

          timeRange,
          time: timeRange,

          startDate: String(startRaw ?? '') || start.toISOString(),
          endDate: String(endRaw ?? '') || end.toISOString(),

          duration: `${durationDays} day${durationDays > 1 ? "s" : ""}`,

          // Instructor (used by TrainingCard UI)
          instructorName:
            item?.instructor?.name ||
            item?.instructorName ||
            item?.InstructorName ||
            item?.organizerName ||
            item?.OrganizerName ||
            "",
          instructorTitle:
            item?.instructor?.role || item?.instructorTitle || item?.InstructorTitle || "",
          instructorEmail:
            item?.instructor?.email ||
            item?.instructorEmail ||
            item?.InstructorEmail ||
            item?.instructor?.id ||
            item?.Instructor?.Email ||
            item?.Instructor?.EMail ||
            item?.Organizer?.Email ||
            item?.Organizer?.EMail ||
            item?.Author?.Email ||
            item?.Author?.EMail ||
            "",

          location: safeStr(item?.location),
          meetingLink,
          joinUrl: meetingLink || "#",
          pageUrl,

          start,
          end,
          Eventtype: "Trainings",
        };
      })
      .filter(isNotNull);
  }, [filteredTrainings, trainingMetaByFileRef]);

  // Resolve instructor name/photo for trainings shown
  React.useEffect(() => {
    const emails = (parsedTrainings || [])
      .map((t: any) => String(t?.instructorEmail || "").trim())
      .filter(Boolean);

    if (!emails.length) return;
    void ensurePeopleFromGraph(emails);
  }, [parsedTrainings, ensurePeopleFromGraph]);

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
    () => [...parsedEvents].filter((e) => isUpcomingOrOngoing(e.start, e.end)).sort(sortAsc),
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
    () => [...parsedTrainings].filter((t) => isUpcomingOrOngoing(t.start, t.end)).sort(sortAsc),
    [parsedTrainings, now]
  );

  const myUpcomingTrainings = React.useMemo(
    () =>
      [...parsedTrainings]
        .filter((t) => {
          const tid = Number(t?.trainingId || 0);
          return tid > 0 && myRegisteredTrainingIds.includes(tid) && isUpcomingOrOngoing(t.start, t.end);
        })
        .sort(sortAsc),
    [parsedTrainings, myRegisteredTrainingIds, now]
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
            className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("all")}
            type="button"
          >
            All Events & Trainings
          </button>

          <button
            className={`${styles.tabButton} ${activeTab === "my" ? styles.activeTab : ""}`}
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
                allUpcomingEvents.map((e, i) => <EventCard key={e.id || i} {...(e as any)} />)
              ) : (
                <div className={styles.emptyState}>No upcoming events found.</div>
              )}
            </div>

            <h2 className={styles.heading}>Trainings</h2>
            <div className={styles.eventsWrapper}>
              {allUpcomingTrainings.length > 0 ? (
                allUpcomingTrainings.map((t, i) => (
                  <Trainingcard
                    key={t.id || i}
                    {...(t as any)}
                    instructorName={
                      personByEmail[String((t as any)?.instructorEmail || "").trim()]?.name ||
                      (t as any)?.instructorName
                    }
                    instructorImageUrl={
                      personByEmail[String((t as any)?.instructorEmail || "").trim()]?.avatarUrl ||
                      ((t as any)?.instructorName
                        ? getDefaultAvatar((t as any)?.instructorName)
                        : undefined)
                    }
                    context={context}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>No upcoming trainings found.</div>
              )}
            </div>

            <h2 className={styles.heading}>Meetings</h2>
            <div className={styles.eventsWrapper}>
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((m, i) => <MeetingCard key={m?.id || i} event={m} />)
              ) : (
                <div className={styles.emptyState}>No meeting is scheduled for you</div>
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
              myUpcomingEvents.map((e, i) => <EventCard key={e.id || i} {...(e as any)} />)
            ) : (
              <div className={styles.emptyState}>No registered upcoming events.</div>
            )}
          </div>

          <h2 className={styles.heading}>Trainings</h2>
          <div className={styles.eventsWrapper}>
            {myUpcomingTrainings.length > 0 ? (
              myUpcomingTrainings.map((t, i) => (
                <Trainingcard
                  key={t.id || i}
                  {...(t as any)}
                  instructorName={
                    personByEmail[String((t as any)?.instructorEmail || "").trim()]?.name ||
                    (t as any)?.instructorName
                  }
                  instructorImageUrl={
                    personByEmail[String((t as any)?.instructorEmail || "").trim()]?.avatarUrl ||
                    ((t as any)?.instructorName
                      ? getDefaultAvatar((t as any)?.instructorName)
                      : undefined)
                  }
                  context={context}
                />
              ))
            ) : (
              <div className={styles.emptyState}>No registered upcoming trainings.</div>
            )}
          </div>

          <h2 className={styles.heading}>Meetings</h2>
          <div className={styles.eventsWrapper}>
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((m, i) => <MeetingCard key={m?.id || i} event={m} />)
            ) : (
              <div className={styles.emptyState}>No meeting is scheduled for you</div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Allcomponent;
