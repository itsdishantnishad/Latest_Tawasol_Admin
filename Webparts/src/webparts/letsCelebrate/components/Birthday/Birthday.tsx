import * as React from "react";
import PeopleSimpleFeed, { IPersonBase } from "./PeopleSimpleFeed";
import { IBirthdayPerson } from "./BirthdayData"; // ✅ data/
import styles from "./Birthday.module.scss";


export interface BirthdaysFeedProps {
  items: IBirthdayPerson[];
  webAbsoluteUrl?: string;
}



const Birthday: React.FC<BirthdaysFeedProps> = ({ items, webAbsoluteUrl }) => {


  // reminder state for upcoming list
  const [reminders, setReminders] = React.useState<{[id: string]: boolean}>({});

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // TODO: hook notification/flow here
      // console.log("Reminder toggled", id, next[id]);
      return next;
    });
  };

//   const mapToBase = (arr: IBirthdayPerson[]): IPersonBase[] =>
//     arr.map(p => ({
//       id: p.id,
//       firstName: p.firstName,
//       lastName: p.lastName,
//       designation: p.designation,
//       department: p.department,
//       imageUrl: p.imageUrl,
//       date: p.date,
//       wishLink: p.wishLink
//     }));

  return (
    <div className={styles.wrap}>
      {/* Today's Celebrations */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>Today’s Celebrations</div>
        <PeopleSimpleFeed
          items={[]}
          webAbsoluteUrl={webAbsoluteUrl}
          emptyText="No birthdays today."
          // default CTA = Wish Now (from item.wishLink)
        />
      </div>

      {/* Upcoming Birthdays (collapsible) */}
      <UpcomingSection
        title="Upcoming Birthdays"
        items={[]}
        webAbsoluteUrl={webAbsoluteUrl}
        isReminded={(id) => !!reminders[id]}
        onToggleReminder={toggleReminder}
      />
    </div>
  );
};

export default Birthday;

/** Internal collapsible section for upcoming birthdays */
const UpcomingSection: React.FC<{
  title: string;
  items: IPersonBase[];
  webAbsoluteUrl?: string;
  isReminded: (id: string) => boolean;
  onToggleReminder: (id: string) => void;
}> = ({ title, items, webAbsoluteUrl, isReminded, onToggleReminder }) => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className={styles.section}>
      <button className={styles.sectionHead + " " + styles.collapsible} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className={styles.chevron} aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <PeopleSimpleFeed
          items={items}
          webAbsoluteUrl={webAbsoluteUrl}
          emptyText="No upcoming birthdays."
          renderCta={(p:any) => (
            <button
              type="button"
              className={isReminded(p.id) ? styles.remindBtnActive : styles.remindBtn}
              onClick={() => onToggleReminder(p.id)}
              aria-pressed={isReminded(p.id)}
            >
              {isReminded(p.id) ? "✓ Reminding" : "🔔 Remind me"}
            </button>
          )}
        />
      )}
    </div>
  );
};
