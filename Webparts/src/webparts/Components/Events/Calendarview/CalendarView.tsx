import * as React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal } from "@fluentui/react/lib/Modal";
import { DefaultButton } from "@fluentui/react";
import styles from "./CalendarView.module.scss";
import MeetingCard from "../../TeamsMeeting/MeetingCard";
import TrainingCard from "../../Trainings/TrainingCard";
import EventPopup from "../Eventpopup/Eventpopup";

const localizer = momentLocalizer(moment);

interface Props {
  events: any[];
  context?: any;
  from?: string;
}

type CalendarEvent = {
  __baseId: string;
  __sourceId: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  Eventtype?: string;
  meetingType?: string;
  [key: string]: any;
};

const CalendarViewComponent: React.FC<Props> = ({ events, context, from }) => {
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  /**
   * Parse various date inputs we receive across Events/Trainings/Meetings:
   * - Date
   * - ISO / SharePoint date string
   * - Graph style { dateTime, timeZone }
   */
  const parseDate = (v: any): Date | null => {
    if (!v) return null;

    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    // Graph style { dateTime, timeZone }
    if (typeof v === "object") {
      const dt = (v as any)?.dateTime || (v as any)?.DateTime;
      if (dt) {
        const dObj = new Date(String(dt));
        return isNaN(dObj.getTime()) ? null : dObj;
      }
    }

    // epoch number
    if (typeof v === "number") {
      const dObj = new Date(v);
      return isNaN(dObj.getTime()) ? null : dObj;
    }

    // string
    const raw = String(v).split(/\n|;/)[0].trim();
    if (!raw) return null;

    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;

    // fallback for odd SharePoint formats
    const m = moment(
      raw,
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

  /**
   * Meetings coming from mapGraphMeetingToUI are used by MeetingCard and often look like:
   * {
   *   id: "AAMk...",
   *   date: { day: "Fri", date: "30", month: "Jan" }  // sometimes year missing
   *   timeRange: "3:00 PM - 3:30 PM"  (or time: "3:00 PM")
   *   meetingType: "Microsoft Teams Meeting"
   * }
   *
   * Calendar needs real Date objects => derive start/end if missing.
   */
  const deriveMeetingDateTime = (e: any): { start?: Date; end?: Date } => {
    const dateObj = e?.date;

    const dayNumRaw =
      (typeof dateObj === "object" ? dateObj?.date : dateObj) ?? e?.day ?? "";
    const monthRaw =
      (typeof dateObj === "object" ? dateObj?.month : e?.month) ?? "";
    const yearRaw =
      (typeof dateObj === "object" ? dateObj?.year : e?.year) ??
      new Date().getFullYear();

    const dayNum = String(dayNumRaw || "").replace(/\D/g, "").trim();
    const monthStr = String(monthRaw || "").trim();

    const range = String(e?.timeRange || e?.time || "").trim();

    // "3:00 PM - 3:30 PM"
    let startTime = "";
    let endTime = "";

    const mRange = range.match(/(.+?)\s*[-–]\s*(.+)/);
    if (mRange) {
      startTime = String(mRange[1]).trim();
      endTime = String(mRange[2]).trim();
    } else {
      startTime = range;
      endTime = "";
    }

    if (!dayNum || !monthStr || !startTime) return {};

    const base = `${dayNum} ${monthStr} ${yearRaw}`;

    // We'll try formats in order; whichever succeeds for start we reuse for end.
    const fmtMMM = "D MMM YYYY h:mm A";
    const fmtMMMM = "D MMMM YYYY h:mm A";

    const tryParse = (text: string, fmt: string) =>
      moment(text, fmt, false /* non-strict */);

    const startText = `${base} ${startTime}`;

    let startMoment = tryParse(startText, fmtMMM);
    let usedFmt = fmtMMM;

    if (!startMoment.isValid()) {
      startMoment = tryParse(startText, fmtMMMM);
      usedFmt = fmtMMMM;
    }

    if (!startMoment.isValid()) return {};

    const buildEnd = (sm: moment.Moment, fmt: string) => {
      if (endTime) {
        const endText = `${base} ${endTime}`;
        const em = tryParse(endText, fmt);
        return em.isValid() ? em : sm.clone().add(30, "minutes");
      }
      return sm.clone().add(30, "minutes");
    };

    const endMoment = buildEnd(startMoment, usedFmt);
    return { start: startMoment.toDate(), end: endMoment.toDate() };
  };

  const getBaseId = (e: any) =>
    String(
      e?.trainingId ??
        e?.meetingId ??
        e?.iCalUId ??
        e?.ID ??
        e?.Id ??
        e?.id ??
        ""
    ).trim();

  const calendarEvents: CalendarEvent[] = React.useMemo(() => {
    const out: CalendarEvent[] = [];

    (events || []).forEach((e: any) => {
      const baseId = getBaseId(e);
      if (!baseId) return;

      // Standard inputs across SP lists + our mapped data
      let startRaw =
        e.start ?? e.startDate ?? e.eventStartDate ?? e.TIREventStartDate;
      let endRaw = e.end ?? e.endDate ?? e.eventEndDate ?? e.TIREventEndDate;

      let startDate = parseDate(startRaw);
      let endDate = parseDate(endRaw);

      // ✅ If meeting object has no start/end, derive from date + timeRange/time
      if (!startDate || !endDate) {
        const derived = deriveMeetingDateTime(e);
        if (derived.start && derived.end) {
          startDate = derived.start;
          endDate = derived.end;
        }
      }

      if (!startDate || !endDate) return;

      const title = e.title || e.subject || "Untitled";
      const Eventtype = e.Eventtype || e.meetingType || "";

      const mStart = moment(startDate);
      const mEnd = moment(endDate);

      const startDay = mStart.clone().startOf("day");
      const endDayInclusive = mEnd.clone().startOf("day");

      const daySpan = endDayInclusive.diff(startDay, "days");

      // Multi-day => 1 pill per day
      if (daySpan >= 1) {
        for (
          let d = startDay.clone();
          d.isSameOrBefore(endDayInclusive, "day");
          d.add(1, "day")
        ) {
          out.push({
            ...e,
            __baseId: baseId,
            __sourceId: `${baseId}__${d.format("YYYYMMDD")}`,
            title,
            start: d.toDate(),
            end: d.clone().add(1, "day").toDate(),
            allDay: true,
            Eventtype,
          });
        }
        return;
      }

      out.push({
        ...e,
        __baseId: baseId,
        __sourceId: baseId,
        title,
        start: startDate,
        end: endDate,
        allDay: false,
        Eventtype,
      });
    });

    return out;
  }, [events]);

  const getPillClass = (event: any): string => {
    const t = String(event?.Eventtype || "").trim().toLowerCase();
    const mt = String(event?.meetingType || "").trim().toLowerCase();

    if (
      mt === "microsoft teams meeting" ||
      t.includes("meeting") ||
      t.includes("teams")
    ) {
      return `${styles.pill} ${styles.pillTeams}`;
    }

    if (t === "trainings" || t.includes("training")) {
      return `${styles.pill} ${styles.pillTraining}`;
    }

    return `${styles.pill} ${styles.pillEvent}`;
  };

  const EventComponent = ({ event }: any) => (
    <div className={getPillClass(event)} title={event.title}>
      {event.title}
    </div>
  );

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "transparent",
      border: "none",
      display: "block",
      padding: "0px",
    },
  });

  const handleSelect = (calEvent: CalendarEvent) => {
    const original = (events || []).find(
      (ev: any) => getBaseId(ev) === calEvent.__baseId
    );
    setSelectedEvent(original || calEvent);
  };

  return (
    <>
      <div className={styles.wrap}>
        {from === "All" && (
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

        <div className={styles.calendarHost}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelect}
            eventPropGetter={eventStyleGetter}
            components={{ event: EventComponent }}
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
          />
        </div>
      </div>

      <Modal
        isOpen={!!selectedEvent}
        onDismiss={() => setSelectedEvent(null)}
        containerClassName={styles.eventModalContainer}
      >
        {selectedEvent && (
          <div className={styles.eventModalBody}>
            <h2 className={styles.modalTitle}>{selectedEvent.title}</h2>

            {selectedEvent.meetingType === "Microsoft Teams Meeting" ? (
              <MeetingCard
                event={selectedEvent}
                onJoinClick={() => alert("Joining Meeting...")}
              />
            ) : selectedEvent.Eventtype === "Trainings" ? (
              <TrainingCard {...selectedEvent} context={context} />
            ) : (
              <EventPopup {...selectedEvent} context={context} />
            )}

            <div className={styles.modalActions}>
              <DefaultButton
                text="Close"
                onClick={() => setSelectedEvent(null)}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CalendarViewComponent;
