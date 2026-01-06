import * as React from "react";
import styles from "./EventsTrainingsToggle.module.scss";

import Trainingmodule from "../../../Components/Trainings/Training";
import Allevents from "../../../Components/Events/AllEvents";
import AllMeetings from "../../../Components/TeamsMeeting/TeamsComponent";
import AllComponents from "../../../Components/All/Allcomponent";

import { mapGraphMeetingToUI } from "../../../services/meetingServices/mapGraphMeetingToUI";
import NavTabs from "../../../Components/NavTabs/NavTabs";
import { EventsTrainingsTabKey } from "../../../Components/NavTabs/eventsTrainingsTabs";

export interface IEventsTrainingsToggleProps {
  onTabChange?: (tab: EventsTrainingsTabKey) => void;
  onSearchChange?: (text: string) => void;
  Trainingdata?: any[];
  Eventdata?: any[];
  MeetingsData?: any[];
  context?: any;
}

/* =========================================================
   Helper: get initial tab from URL
========================================================= */
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

const EventsTrainingsToggle: React.FC<IEventsTrainingsToggleProps> = (props) => {
  const {
    Trainingdata = [],
    Eventdata = [],
    MeetingsData = [],
    context,
    onTabChange,
    onSearchChange,
  } = props;

  /* =========================================================
     Meetings mapping (UNCHANGED)
  ========================================================= */
  const mappedMeetings = React.useMemo(
    () => MeetingsData.map(mapGraphMeetingToUI),
    [MeetingsData]
  );

  /* =========================================================
     State
  ========================================================= */
  const [activeTab, setActiveTab] =
    React.useState<EventsTrainingsTabKey>(getInitialTab);

  const [viewMode, setViewMode] =
    React.useState<"list" | "calendar">("list");

  const [searchText, setSearchText] = React.useState("");

  /* =========================================================
     Tabs config for NavTabs
  ========================================================= */
  const tabs = [
    { key: EventsTrainingsTabKey.All, label: "All" },
    { key: EventsTrainingsTabKey.Events, label: "Events" },
    { key: EventsTrainingsTabKey.Trainings, label: "Trainings" },
    { key: EventsTrainingsTabKey.Meetings, label: "Meetings" },
  ];

  /* =========================================================
     Tab change handler (GLOBAL + URL SYNC)
  ========================================================= */
  const handleTabChange = (tab: EventsTrainingsTabKey) => {
    setActiveTab(tab);
    setSearchText("");
    onTabChange?.(tab);

    // Sync tab to URL
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  /* =========================================================
     Search handler (UNCHANGED)
  ========================================================= */
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearchChange?.(value);
  };

  /* =========================================================
     Filtering logic (UNCHANGED)
  ========================================================= */
  const filteredEvents = React.useMemo(() => {
    let list = [...Eventdata];

    if (searchText) {
      list = list.filter((i) =>
        i.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return list;
  }, [Eventdata, searchText]);

  const filteredTrainings = React.useMemo(() => {
    let list = [...Trainingdata];

    if (searchText) {
      list = list.filter((i) =>
        i.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return list;
  }, [Trainingdata, searchText]);

  /* =========================================================
     Render
  ========================================================= */
  return (
    <div className={styles.paddingSection}>
      {/* ------------------ TOP BAR ------------------ */}
      <div className={styles.topWrapper}>
        {/* Tabs (NavTabs – NEW, GLOBAL) */}
        <NavTabs
          tabs={tabs}
          value={activeTab}
          onChange={handleTabChange}
        />

        {/* View toggle (SVGs KEPT AS-IS) */}
        <div className={styles.viewToggleWrapper}>
          <div className={styles.viewToggle}>
            {/* Calendar View */}
            <button
              className={`${styles.viewBtn} ${
                viewMode === "calendar" ? styles.viewActive : ""
              }`}
              onClick={() => setViewMode("calendar")}
              aria-pressed={viewMode === "calendar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M8 5.75C7.59 5.75 7.25 5.41 7.25 5V2C7.25 1.59 7.59 1.25 8 1.25C8.41 1.25 8.75 1.59 8.75 2V5C8.75 5.41 8.41 5.75 8 5.75Z" fill="#101820" />
                <path d="M16 5.75C15.59 5.75 15.25 5.41 15.25 5V2C15.25 1.59 15.59 1.25 16 1.25C16.41 1.25 16.75 1.59 16.75 2V5C16.75 5.41 16.41 5.75 16 5.75Z" fill="#101820" />
                <path d="M20.5 9.83984H3.5C3.09 9.83984 2.75 9.49984 2.75 9.08984C2.75 8.67984 3.09 8.33984 3.5 8.33984H20.5C20.91 8.33984 21.25 8.67984 21.25 9.08984C21.25 9.49984 20.91 9.83984 20.5 9.83984Z" fill="#101820" />
                <path d="M16 22.75H8C4.35 22.75 2.25 20.65 2.25 17V8.5C2.25 4.85 4.35 2.75 8 2.75H16C19.65 2.75 21.75 4.85 21.75 8.5V17C21.75 20.65 19.65 22.75 16 22.75Z" fill="#101820" />
              </svg>
            </button>

            {/* List View */}
            <button
              className={`${styles.viewBtn} ${
                viewMode === "list" ? styles.viewActive : ""
              }`}
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
              >
                <path
                  d="M12.5 26.6641H27.5"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.5 15H27.5"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------ CONTENT ------------------ */}
      {activeTab === EventsTrainingsTabKey.Events ? (
        <Allevents
          AllEventItems={filteredEvents}
          context={context}
          viewtype={viewMode}
        />
      ) : activeTab === EventsTrainingsTabKey.Meetings ? (
        <AllMeetings
          meetingsData={mappedMeetings}
          context={context}
          viewtype={viewMode}
        />
      ) : activeTab === EventsTrainingsTabKey.All ? (
        <AllComponents
          filteredEvents={filteredEvents}
          filteredMeetings={mappedMeetings}
          filteredTrainings={filteredTrainings}
          context={context}
          viewMode={viewMode}
        />
      ) : (
        <Trainingmodule
          AllTrainingdata={filteredTrainings}
          context={context}
          viewtype={viewMode}
        />
      )}
    </div>
  );
};

export default EventsTrainingsToggle;
