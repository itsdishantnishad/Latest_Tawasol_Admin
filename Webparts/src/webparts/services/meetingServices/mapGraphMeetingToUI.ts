// // utils/mapGraphMeetingToUI.ts
// export const mapGraphMeetingToUI = (m: any) => {
//   const start = new Date(m.start);

//   return {
//     id: m.id,
//     title: m.subject,
//     meetingType: "Microsoft Teams Meeting",
//     time: start.toLocaleTimeString(undefined, {
//       hour: "numeric",
//       minute: "2-digit",
//     }),
//     date: {
//       day: start.toLocaleDateString(undefined, { weekday: "short" }),
//       date: start.toLocaleDateString(undefined, { day: "2-digit" }),
//       month: start.toLocaleDateString(undefined, { month: "short" }),
//     },
//     organizer: {
//       name: m.organizer || "Organizer",
//       avatarUrl: m.avatarUrl,
//     },
//     avatarUrl: m.avatarUrl,
//     joinUrl: m.joinUrl,
//   };
// };


// utils/mapGraphMeetingToUI.ts
export const mapGraphMeetingToUI = (m: any) => {
  const start = new Date(m.start);
  const end = new Date(m.end);

  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    id: m.id,
    title: m.subject,
    meetingType: "Microsoft Teams Meeting",
    time: startTime,
    endTime: endTime,
    timeRange: `${startTime} - ${endTime}`,
    date: {
      day: start.toLocaleDateString(undefined, { weekday: "short" }),
      date: start.toLocaleDateString(undefined, { day: "2-digit" }),
      month: start.toLocaleDateString(undefined, { month: "short" }),
    },
    organizer: {
      name: m.organizer || "Organizer",
      avatarUrl: m.avatarUrl,
    },
    avatarUrl: m.avatarUrl,
    joinUrl: m.joinUrl,
  };
};