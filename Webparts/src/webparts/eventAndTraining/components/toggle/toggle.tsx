import * as React from "react";
import styles from "./EventsTrainingsToggle.module.scss";

import Trainingmodule from "../../../Components/Trainings/Training";
import Allevents from "../../../Components/Events/AllEvents";
import AllMeetings from "../../../Components/TeamsMeeting/TeamsComponent";
import AllComponents from "../../../Components/All/Allcomponent";

import { mapGraphMeetingToUI } from "../../../services/meetingServices/mapGraphMeetingToUI";
import NavTabs from "../../../Components/NavTabs/NavTabs";
import { EventsTrainingsTabKey } from "../../../Components/NavTabs/eventsTrainingsTabs";
import { SPHttpClient } from "@microsoft/sp-http";

export interface IEventsTrainingsToggleProps {
  onTabChange?: (tab: EventsTrainingsTabKey) => void;
  onSearchChange?: (text: string) => void;
  Trainingdata?: any[];
  Eventdata?: any[];
  MeetingsData?: any[];
  context?: any;
}

const getInitialTab = (): EventsTrainingsTabKey => {
  if (typeof window === "undefined") {
    return EventsTrainingsTabKey.All;
  }

  const tab = new URLSearchParams(window.location.search)
    .get("tab")
    ?.toLowerCase();

  switch (tab) {
    case EventsTrainingsTabKey.Events:
      return EventsTrainingsTabKey.Events;
    case EventsTrainingsTabKey.Trainings:
      return EventsTrainingsTabKey.Trainings;
    case EventsTrainingsTabKey.Meetings:
      return EventsTrainingsTabKey.Meetings;
    default:
      return EventsTrainingsTabKey.All;
  }
};

// ✅ FIX: Helper to ensure dates exist for CalendarView
const normalizeEventForCalendar = (event: any, _isRegistered: boolean): any => {
  if (!event) return null;

  const startRaw =
    event?.start ??
    event?.startDate ??
    event?.eventStartDate ??
    event?.TIREventStartDate ??
    event?.eventDateTime;

  const endRaw =
    event?.end ??
    event?.endDate ??
    event?.eventEndDate ??
    event?.TIREventEndDate;

  const parseDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    if (typeof v === "object" && v?.dateTime) {
      const d = new Date(String(v.dateTime));
      return isNaN(d.getTime()) ? null : d;
    }

    const raw = String(v).split("\n")[0].trim();
    if (!raw) return null;

    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  const start = parseDate(startRaw);
  const end = parseDate(endRaw);

  if (!start || !end) {
    console.warn("Event missing valid dates:", event);
    return null;
  }

  return {
    ...event,
    start,
    end,
    Eventtype: event?.Eventtype || "Events",
  };
};

const EventsTrainingsToggle: React.FC<IEventsTrainingsToggleProps> = (props) => {
  const {
    Trainingdata = [],
    Eventdata = [],
    MeetingsData = [],
    context,
    onTabChange,
    onSearchChange,
  } = props;

  const mappedMeetings = React.useMemo(
    () => (MeetingsData || []).map(mapGraphMeetingToUI),
    [MeetingsData]
  );

  const [activeTab, setActiveTab] =
    React.useState<EventsTrainingsTabKey>(getInitialTab);

  // const [viewMode, setViewMode] =
  //   React.useState<"list" | "calendar">("list");

  const [isMobileView, setIsMobileView] = React.useState<boolean>(
    typeof window !== "undefined" && window.innerWidth <= 768
  );

  const [viewMode, setViewMode] =
    React.useState<"list" | "calendar">(
      window.innerWidth <= 768 ? "calendar" : "list"
    );

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);

      if (mobile) {
        setViewMode("calendar");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [searchText, setSearchText] = React.useState("");

  const [myRegisteredEventIds, setMyRegisteredEventIds] =
    React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!context) {
          if (!cancelled) setMyRegisteredEventIds(new Set());
          return;
        }

        let userId: number | undefined =
          (context.pageContext as any)?.legacyPageContext?.userId;

        if (!userId) {
          const meUrl = `${context.pageContext.web.absoluteUrl}/_api/web/currentuser?$select=Id`;
          const meRes = await context.spHttpClient.get(
            meUrl,
            SPHttpClient.configurations.v1
          );
          if (!meRes.ok) {
            if (!cancelled) setMyRegisteredEventIds(new Set());
            return;
          }
          const me = await meRes.json();
          userId = Number(me?.Id) || 0;
        }

        if (!userId) {
          if (!cancelled) setMyRegisteredEventIds(new Set());
          return;
        }

        const listTitle = "Registered User Event";
        const url =
          `${context.pageContext.web.absoluteUrl}` +
          `/_api/web/lists/getbytitle('${encodeURIComponent(
            listTitle
          )}')/items` +
          `?$top=5000&$select=Id,Title,TIREventId,EventId,TIRUserId,AuthorId`;

        const resp = await context.spHttpClient.get(
          url,
          SPHttpClient.configurations.v1
        );
        if (!resp.ok) {
          if (!cancelled) setMyRegisteredEventIds(new Set());
          return;
        }

        const json = await resp.json();
        const rows: any[] = Array.isArray(json?.value) ? json.value : [];

        const set = new Set<string>();
        for (const r of rows) {
          const uid = Number(
            r?.TIRUserId?.Id ?? r?.TIRUserId ?? r?.AuthorId ?? 0
          );
          if (uid !== userId) continue;

          const evId = r?.TIREventId ?? r?.EventId ?? r?.Title;
          const key = String(evId ?? "").trim();
          if (key) set.add(key);
        }

        if (!cancelled) setMyRegisteredEventIds(set);
      } catch {
        if (!cancelled) setMyRegisteredEventIds(new Set());
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [context]);

  const normalizedEvents = React.useMemo(() => {
    const set = myRegisteredEventIds;

    return (Eventdata || [])
      .map((e: any, idx: number) => {
        const idStr = String(
          e?.ID ??
          e?.Id ??
          e?.id ??
          e?.ListItemID ??
          e?.ListItemId ??
          ""
        ).trim();

        const isReg = idStr ? set.has(idStr) : false;

        return normalizeEventForCalendar(
          {
            ...e,
            isRegistered: isReg,
            isregistered: isReg,
          },
          isReg
        );
      })
      .filter(Boolean);
  }, [Eventdata, myRegisteredEventIds]);

  const filteredEvents = React.useMemo(() => {
    let list = [...normalizedEvents];
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter((i) => (i?.title || "").toLowerCase().includes(q));
    }
    return list;
  }, [normalizedEvents, searchText]);

  const filteredTrainings = React.useMemo(() => {
    let list = [...Trainingdata];

    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter((i) => (i?.title || "").toLowerCase().includes(q));
    }

    return list;
  }, [Trainingdata, searchText]);

  const tabs = [
    { key: EventsTrainingsTabKey.All, label: "All" },
    { key: EventsTrainingsTabKey.Events, label: "Events" },
    { key: EventsTrainingsTabKey.Trainings, label: "Trainings" },
    { key: EventsTrainingsTabKey.Meetings, label: "Meetings" },
  ];

  const handleTabChange = (tab: EventsTrainingsTabKey) => {
    setActiveTab(tab);
    setSearchText("");
    onTabChange?.(tab);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearchChange?.(value);
  };

  // ✅ Legend: handled inside All tab content (prevents duplicates)

  return (
    <div className={styles.paddingSection}>
      {/* Top Bar */}
      <div className={styles.topWrapper}>
        <NavTabs tabs={tabs} value={activeTab} onChange={handleTabChange} />

        <div className={styles.viewToggleWrapper}>
          <div className={styles.viewToggle}>
            {/* Calendar View Button */}
            <button
              className={`${styles.viewBtn} ${viewMode === "calendar" ? styles.viewActive : ""
                }`}
              onClick={() => setViewMode("calendar")}
              aria-pressed={viewMode === "calendar"}
              aria-label="Calendar view"
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5.75C7.59 5.75 7.25 5.41 7.25 5V2C7.25 1.59 7.59 1.25 8 1.25C8.41 1.25 8.75 1.59 8.75 2V5C8.75 5.41 8.41 5.75 8 5.75Z" fill="#101820" />
                <path d="M16 5.75C15.59 5.75 15.25 5.41 15.25 5V2C15.25 1.59 15.59 1.25 16 1.25C16.41 1.25 16.75 1.59 16.75 2V5C16.75 5.41 16.41 5.75 16 5.75Z" fill="#101820" />
                <path d="M20.5 9.83984H3.5C3.09 9.83984 2.75 9.49984 2.75 9.08984C2.75 8.67984 3.09 8.33984 3.5 8.33984H20.5C20.91 8.33984 21.25 8.67984 21.25 9.08984C21.25 9.49984 20.91 9.83984 20.5 9.83984Z" fill="#101820" />
                <path d="M16 22.75H8C4.35 22.75 2.25 20.65 2.25 17V8.5C2.25 4.85 4.35 2.75 8 2.75H16C19.65 2.75 21.75 4.85 21.75 8.5V17C21.75 20.65 19.65 22.75 16 22.75ZM8 4.25C5.14 4.25 3.75 5.64 3.75 8.5V17C3.75 19.86 5.14 21.25 8 21.25H16C18.86 21.25 20.25 19.86 20.25 17V8.5C20.25 5.64 18.86 4.25 16 4.25H8Z" fill="#101820" />
                <path d="M8.5 14.5C8.37 14.5 8.24 14.47 8.12 14.42C8 14.37 7.89001 14.3 7.79001 14.21C7.70001 14.11 7.62999 14 7.57999 13.88C7.52999 13.76 7.5 13.63 7.5 13.5C7.5 13.24 7.61001 12.98 7.79001 12.79C7.89001 12.7 8 12.63 8.12 12.58C8.3 12.5 8.50001 12.48 8.70001 12.52C8.76001 12.53 8.82 12.55 8.88 12.58C8.94 12.6 9 12.63 9.06 12.67C9.11 12.71 9.15999 12.75 9.20999 12.79C9.24999 12.84 9.29999 12.89 9.32999 12.94C9.36999 13 9.40001 13.06 9.42001 13.12C9.45001 13.18 9.47001 13.24 9.48001 13.3C9.49001 13.37 9.5 13.43 9.5 13.5C9.5 13.76 9.38999 14.02 9.20999 14.21C9.01999 14.39 8.76 14.5 8.5 14.5Z" fill="#101820" />
                <path d="M12 14.5008C11.74 14.5008 11.48 14.3908 11.29 14.2108C11.25 14.1608 11.21 14.1108 11.17 14.0608C11.13 14.0008 11.1 13.9409 11.08 13.8809C11.05 13.8209 11.03 13.7609 11.02 13.7009C11.01 13.6309 11 13.5708 11 13.5008C11 13.3708 11.03 13.2408 11.08 13.1208C11.13 13.0008 11.2 12.8909 11.29 12.7909C11.57 12.5109 12.02 12.4208 12.38 12.5808C12.51 12.6308 12.61 12.7009 12.71 12.7909C12.89 12.9809 13 13.2408 13 13.5008C13 13.5708 12.99 13.6309 12.98 13.7009C12.97 13.7609 12.95 13.8209 12.92 13.8809C12.9 13.9409 12.87 14.0008 12.83 14.0608C12.79 14.1108 12.75 14.1608 12.71 14.2108C12.61 14.3008 12.51 14.3709 12.38 14.4209C12.26 14.4709 12.13 14.5008 12 14.5008Z" fill="#101820" />
                <path d="M8.5 18.0008C8.37 18.0008 8.24 17.9709 8.12 17.9209C8 17.8709 7.89001 17.8008 7.79001 17.7108C7.70001 17.6108 7.62999 17.5109 7.57999 17.3809C7.52999 17.2609 7.5 17.1308 7.5 17.0008C7.5 16.7408 7.61001 16.4809 7.79001 16.2909C7.89001 16.2009 8 16.1308 8.12 16.0808C8.49 15.9208 8.92999 16.0109 9.20999 16.2909C9.24999 16.3409 9.29999 16.3909 9.32999 16.4409C9.36999 16.5009 9.40001 16.5608 9.42001 16.6208C9.45001 16.6808 9.47001 16.7408 9.48001 16.8108C9.49001 16.8708 9.5 16.9408 9.5 17.0008C9.5 17.2608 9.38999 17.5208 9.20999 17.7108C9.01999 17.8908 8.76 18.0008 8.5 18.0008Z" fill="#101820" />
              </svg>
            </button>

            {/* List View Button */}
            <button
              className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewActive : ""
                }`}
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              aria-label="List view"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 16.6641H17.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2.5 5H17.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Legend removed here (was duplicating All tab legend) */}

      {/* Content */}
      {activeTab === EventsTrainingsTabKey.Events ? (
        <Allevents
          AllEventItems={filteredEvents}
          context={context}
          viewtype={viewMode}
          isMobileView={isMobileView}
        />
      ) : activeTab === EventsTrainingsTabKey.Meetings ? (
        mappedMeetings.length === 0 ? (
          <div className={styles.emptyState}>No meeting is scheduled for you</div>
        ) : (
          <AllMeetings
            meetingsData={mappedMeetings}
            context={context}
            viewtype={viewMode}
            isMobileView={isMobileView}
          />
        )
      ) : activeTab === EventsTrainingsTabKey.All ? (
        <AllComponents
          filteredEvents={filteredEvents}
          filteredMeetings={mappedMeetings}
          filteredTrainings={filteredTrainings}
          context={context}
          viewMode={viewMode}
          isMobileView={isMobileView}
        />
      ) : filteredTrainings.length === 0 ? (
        <div className={styles.emptyState}>
          You haven't registered for any Training
        </div>
      ) : (
        <Trainingmodule
          AllTrainingdata={filteredTrainings}
          context={context}
          viewtype={viewMode}
          isMobileView={isMobileView}
        />
      )}
    </div>
  );
};

export default EventsTrainingsToggle;
