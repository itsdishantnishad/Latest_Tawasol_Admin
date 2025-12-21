import * as React from "react";
import PeopleSimpleFeed, { IPersonBase } from "./PeopleSimpleFeed";
import styles from "./Birthday.module.scss";

export interface BirthdaysFeedProps {
  items: IPersonBase[];
  webAbsoluteUrl?: string;

  todayTitle: string;
  upcomingTitle: string;

  emptyTodayText: string;
  emptyUpcomingText: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const monthMap: { [k: string]: number } = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

const parseMonthDay = (raw?: string): { m: number; d: number } | null => {
  const v = (raw || "").trim();
  if (!v) return null;

  // supports "DD-MMM-YYYY" or "YYYY-MM-DD"
  const parts = v.split("-");
  if (parts.length < 2) return null;

  // "YYYY-MM-DD"
  if (parts[0].length === 4) {
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!m || !d) return null;
    return { m: m - 1, d };
  }

  // "DD-MMM-YYYY"
  const d = parseInt(parts[0], 10);
  const mon = (parts[1] || "").toUpperCase();
  const m = monthMap[mon];
  if (m === undefined || !d) return null;
  return { m, d };
};

const dayDiffFromToday = (m: number, d: number): number => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let candidate = new Date(today.getFullYear(), m, d);
  if (candidate.getTime() < today.getTime()) {
    candidate = new Date(today.getFullYear() + 1, m, d);
  }

  const diff = Math.floor((candidate.getTime() - today.getTime()) / MS_PER_DAY);
  return diff;
};

const Birthday: React.FC<BirthdaysFeedProps> = ({
  items,
  webAbsoluteUrl,
  todayTitle,
  upcomingTitle,
  emptyTodayText,
  emptyUpcomingText,
}) => {
  const withinWindow = React.useMemo(() => {
    const rows = (items || [])
      .map((x) => {
        const md = parseMonthDay(x.date);
        if (!md) return null;
        const diff = dayDiffFromToday(md.m, md.d);
        return { item: x, diff };
      })
      .filter((x): x is { item: IPersonBase; diff: number } => !!x)
      .filter((x) => x.diff >= 0 && x.diff <= 7)
      .sort((a, b) => a.diff - b.diff);

    const today = rows.filter((x) => x.diff === 0).map((x) => x.item);
    const upcoming = rows.filter((x) => x.diff > 0).map((x) => x.item);

    return { today, upcoming };
  }, [items]);

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <p>{todayTitle}</p>
        </div>

        <PeopleSimpleFeed
          items={withinWindow.today}
          webAbsoluteUrl={webAbsoluteUrl}
          emptyText={emptyTodayText}
        />
      </div>

      <div className={styles.section}>
        <button className={styles.sectionHead + " " + styles.collapsible}>
          <span>{upcomingTitle}</span>
        </button>

        <PeopleSimpleFeed
          items={withinWindow.upcoming}
          webAbsoluteUrl={webAbsoluteUrl}
          emptyText={emptyUpcomingText}
        />
      </div>
    </div>
  );
};

export default Birthday;
