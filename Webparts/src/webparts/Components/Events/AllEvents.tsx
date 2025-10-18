import * as React from "react";
import styles from "./Allevents.module.scss";
import EventCard from "./EventCard";
import PreviousEventCard from "./PreviousCard/PreviousEvents";


export interface IAlleventsProps {
}


export default class AllEvents extends React.Component<IAlleventsProps> {
  public render(): React.ReactElement<IAlleventsProps> {
    const now = new Date();

    // Helper function to create dates relative to now
    const createEventDate = (
      daysFromNow: number,
      hours: number = 9,
      minutes: number = 0
    ) => {
      const date = new Date(now);
      date.setDate(date.getDate() + daysFromNow);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    // Helper to format date parts
    const formatDateParts = (date: Date) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      return {
        date: String(date.getDate()).padStart(2, "0"),
        month: months[date.getMonth()],
        day: days[date.getDay()],
      };
    };

    // Create test events
    const futureEvent1 = createEventDate(15, 9, 0); // 15 days from now - will show Register
    const futureEvent1Parts = formatDateParts(futureEvent1);

    const soonEvent1 = createEventDate(2, 11, 0); // 2 days from now - will show countdown
    const soonEvent1Parts = formatDateParts(soonEvent1);

    const soonEvent2 = createEventDate(0, now.getHours() + 3, 30); // In 3.5 hours - will show countdown
    const soonEvent2Parts = formatDateParts(soonEvent2);

    const pastEvent1 = createEventDate(-5, 15, 0); // 5 days ago - will show Past event
    const pastEvent1Parts = formatDateParts(pastEvent1);

    const pastEvent2 = createEventDate(-2, 16, 30); // 2 days ago - will show Past event
    const pastEvent2Parts = formatDateParts(pastEvent2);

    const events = [
      {
        ...futureEvent1Parts,
        status: "Upcoming" as const,
        category: "Entertainment",
        title: "Team building Events",
        time: "9 AM - 12 PM",
        location: "11th Floor, Vision Tower, Dubai",
        imageUrl:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
        eventDateTime: futureEvent1,
      },
      {
        ...soonEvent1Parts,
        status: "Registered" as const,
        category: "Entertainment",
        title: "Live Music & Conferences and Seminars",
        time: "11 AM - 12 PM",
        location: "Zabeel Theatre, Sharjah",
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
        eventDateTime: soonEvent1,
      },
      {
        ...soonEvent2Parts,
        status: "Registered" as const,
        category: "Celebrations",
        title: "Annual Company Milestone",
        time: "3 PM - 5 PM",
        location: "Coca Cola Arena, JBR",
        imageUrl:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
        eventDateTime: soonEvent2,
      },
      {
        ...pastEvent1Parts,
        status: "Registered" as const,
        category: "Entertainment",
        title: "Basketball Club",
        time: "3 PM - 5 PM",
        location: "Coca Cola Arena, JBR",
        imageUrl:
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop",
        eventDateTime: pastEvent1,
      },
      {
        ...pastEvent2Parts,
        status: "Registered" as const,
        category: "Entertainment",
        title: "Conferences and Seminars",
        time: "4:30 PM - 5:30 PM",
        location: "Dubai Design District",
        imageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=250&fit=crop",
        eventDateTime: pastEvent2,
      },
    ];
    const previousEvents: any[] = [
      {
        title: "Workshops and Training Sessions",
        imageCount: 26,
        date: "1 June 2024",
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
      },
      {
        title: "Live Music",
        imageCount: 26,
        date: "7 June 2024",
        imageUrl:
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop",
      },
      {
        title: "Basketball Club",
        imageCount: 30,
        date: "7 June 2024",
        imageUrl:
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop",
      },
    ];
    return (
      <div className={styles.eventsContainer}>
        <div className={styles.eventsWrapper}>
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
        <div className={styles.previousEventsContainer}>
          <h2 className={styles.heading}>Previous Events</h2>
          <div className={styles.gridLayout}>
            {previousEvents.map((event, index) => (
              <PreviousEventCard key={index} {...event} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
