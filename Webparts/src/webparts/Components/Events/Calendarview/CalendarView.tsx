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
  from?: string; // "All" | "My" | "Events" etc
   onDateChange?: (date: Date) => void;
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

/** ✅ Custom Toolbar (Figma-like) - UI only */
const CustomToolbar: React.FC<any> = (toolbar) => {
  const label = moment(toolbar?.date).format("MMMM YYYY");

  const goPrev = () => toolbar.onNavigate("PREV");
  const goNext = () => toolbar.onNavigate("NEXT");
  const goToday = () => toolbar.onNavigate("TODAY");

  const isMonth = String(toolbar?.view || "month").toLowerCase() === "month";
  const goMonth = () => toolbar.onView("month"); // ✅ back to month (works after "+2 more")

  return (
    <div className={`rbc-toolbar ${styles.toolbar}`}>
      <div className={styles.toolbarLeft}>
        <div className={styles.toolbarLabel}>{label}</div>

        <div className={styles.toolbarNav}>
          <button
            type="button"
            className={styles.navArrowBtn}
            onClick={goPrev}
            aria-label="Previous"
            title="Previous"
          >
            {/* LEFT ARROW SVG */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.navArrowSvg}>
              <circle cx="20" cy="20" r="20" transform="matrix(-1 0 0 1 40 0)" fill="none"/>
              <path d="M22.5742 13.2773C22.5384 13.2774 22.5078 13.291 22.4863 13.3125L17.0527 18.7451C16.7208 19.0771 16.5323 19.5255 16.5322 20C16.5322 20.4788 16.7157 20.9243 17.0498 21.252L17.0527 21.2549L22.4766 26.6777C22.5184 26.7159 22.5563 26.7255 22.5742 26.7256C22.5919 26.7256 22.6078 26.7222 22.6211 26.7168C22.6338 26.7116 22.6476 26.703 22.6621 26.6885C22.6836 26.667 22.6972 26.6363 22.6973 26.6006C22.6973 26.5647 22.6836 26.5332 22.6621 26.5117L17.2295 21.0791C16.6342 20.4838 16.6342 19.5171 17.2295 18.9219L22.6621 13.4883C22.6836 13.4668 22.6972 13.4362 22.6973 13.4004C22.6973 13.3645 22.6836 13.334 22.6621 13.3125C22.6406 13.291 22.6101 13.2773 22.5742 13.2773Z" fill="#3A3B43" stroke="#3A3B43"/>
            </svg>
          </button>

          <button
            type="button"
            className={styles.navArrowBtn}
            onClick={goNext}
            aria-label="Next"
            title="Next"
          >
            {/* RIGHT ARROW SVG */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.navArrowSvg}>
              <circle cx="20" cy="20" r="20" fill="none"/>
              <path d="M17.4258 13.2773C17.4616 13.2774 17.4922 13.291 17.5137 13.3125L22.9473 18.7451C23.2792 19.0771 23.4677 19.5255 23.4678 20C23.4678 20.4788 23.2843 20.9243 22.9502 21.252L22.9473 21.2549L17.5234 26.6777C17.4816 26.7159 17.4437 26.7255 17.4258 26.7256C17.4081 26.7256 17.3922 26.7222 17.3789 26.7168C17.3662 26.7116 17.3524 26.703 17.3379 26.6885C17.3164 26.667 17.3028 26.6363 17.3027 26.6006C17.3027 26.5647 17.3164 26.5332 17.3379 26.5117L22.7705 21.0791C23.3658 20.4838 23.3658 19.5171 22.7705 18.9219L17.3379 13.4883C17.3164 13.4668 17.3028 13.4362 17.3027 13.4004C17.3027 13.3645 17.3164 13.334 17.3379 13.3125C17.3594 13.291 17.3899 13.2773 17.4258 13.2773Z" fill="#3A3B43" stroke="#3A3B43"/>
            </svg>
          </button>
        </div>

        <button type="button" className={styles.todayBtn} onClick={goToday} aria-label="Today" title="Today">
          Today
        </button>

        {/* ✅ Show ONLY when user is not on month (fix for "+2 more" -> day view trap) */}
        {!isMonth && (
          <button type="button" className={styles.monthBtn} onClick={goMonth} aria-label="Month" title="Month">
            Month
          </button>
        )}
      </div>

      <div className={styles.toolbarRight} />
    </div>
  );
};

/** Prefer ISO token if string contains "display\nISO" */
const pickBestDateToken = (v: any): string => {
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

/** Normalize ISO datetime without timezone -> treat as UTC by appending Z */
const normalizeIsoToUtcIfNoZone = (raw: string): string => {
  const s = (raw || "").trim();
  if (!s) return s;

  if (/[zZ]$/.test(s)) return s;
  if (/[+-]\d{2}:?\d{2}$/.test(s)) return s;

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) {
    return `${s}Z`;
  }

  return s;
};

const CalendarViewComponent: React.FC<Props> = ({ events, context, from,onDateChange }) => {
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  const parseDate = (v: any): Date | null => {
    if (!v) return null;

    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    if (typeof v === "object") {
      const dt = (v as any)?.dateTime || (v as any)?.DateTime;
      if (dt) {
        const best = pickBestDateToken(dt);
        const norm = normalizeIsoToUtcIfNoZone(best);
        const dObj = new Date(norm);
        return isNaN(dObj.getTime()) ? null : dObj;
      }
    }

    if (typeof v === "number") {
      const dObj = new Date(v);
      return isNaN(dObj.getTime()) ? null : dObj;
    }

    const bestToken = pickBestDateToken(v);
    if (!bestToken) return null;

    const raw = normalizeIsoToUtcIfNoZone(bestToken);

    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;

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

    const fmtMMM = "D MMM YYYY h:mm A";
    const fmtMMMM = "D MMMM YYYY h:mm A";

    const tryParse = (text: string, fmt: string) => moment(text, fmt, false);

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

      let startRaw =
        e.start ?? e.startDate ?? e.eventStartDate ?? e.TIREventStartDate;
      let endRaw = e.end ?? e.endDate ?? e.eventEndDate ?? e.TIREventEndDate;

      let startDate = parseDate(startRaw);
      let endDate = parseDate(endRaw);

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

  // ✅ legend only for All/My sections (NOT events-only tab)
  const showLegend = from === "All" || from === "My";

  return (
    <>
      <div className={styles.wrap}>
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

        <div className={styles.calendarHost}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelect}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar, // ✅ Figma toolbar
              event: EventComponent,
            }}
            views={["month", "week", "day", "agenda"]} // functionality unchanged
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
              <DefaultButton text="Close" onClick={() => setSelectedEvent(null)} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CalendarViewComponent;
