// utils/mapGraphMeetingToUI.ts
// Converts Meeting[] (from GraphMeetingsProvider) into the UI shape that MeetingCard expects.
// IMPORTANT: include start/end so All tab + CalendarView can reliably show meetings.

const fmtTime = (d?: Date): string => {
  if (!d) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const safeDate = (d: Date): Date | undefined => (isNaN(d.getTime()) ? undefined : d);

export const mapGraphMeetingToUI = (m: any) => {
  const start = safeDate(new Date(m?.start));
  const end = safeDate(new Date(m?.end)) || start;

  const startTime = fmtTime(start);
  const endTime = fmtTime(end);

  return {
    id: m?.id,
    title: m?.subject || m?.title || "Meeting",
    subject: m?.subject || m?.title || "Meeting",

    meetingType: m?.meetingType || "Microsoft Teams Meeting",
    Eventtype: "Meetings",

    // ✅ keep real timestamps for calendar
    start: start ? start.toISOString() : (m?.start || ""),
    end: end ? end.toISOString() : (m?.end || ""),

    // list UI helpers
    time: startTime,
    endTime,
    timeRange: endTime ? `${startTime} - ${endTime}` : startTime,

    date: {
      day: start ? start.toLocaleDateString(undefined, { weekday: "short" }) : "",
      date: start ? start.toLocaleDateString(undefined, { day: "2-digit" }) : "",
      month: start ? start.toLocaleDateString(undefined, { month: "short" }) : "",
      year: start ? String(start.getFullYear()) : "",
    },

    organizer: {
      name: m?.organizer || m?.organizerName || "Organizer",
      avatarUrl: m?.avatarUrl,
    },

    avatarUrl: m?.avatarUrl,
    joinUrl: m?.joinUrl || m?.webLink || "",
    location: m?.location || "Microsoft Teams Meeting",
  };
};
