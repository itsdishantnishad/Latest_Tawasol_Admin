import * as React from "react";
import PeopleSimpleFeed, { IPersonBase } from "./PeopleSimpleFeed";
import styles from "./Birthday.module.scss";
import { LoadingBoundary } from "../../../Components/LoadingShimmer/LoadingBoundary";

export interface BirthdaysFeedProps {
  items: IPersonBase[];
  webAbsoluteUrl?: string;

  todayTitle: string;
  upcomingTitle: string;

  emptyTodayText: string;
  emptyUpcomingText: string;

  /** Shimmer */
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  shimmerCountToday?: number;
  shimmerCountUpcoming?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const monthMap: { [k: string]: number } = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

const monthNames: string[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const parseMonthDay = (raw?: string): { m: number; d: number } | null => {
  const v = (raw || "").trim();
  if (!v) return null;

  const parts = v.split("-");
  if (parts.length < 2) return null;

  if (parts[0].length === 4) {
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!m || !d) return null;
    return { m: m - 1, d };
  }

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

  return Math.floor((candidate.getTime() - today.getTime()) / MS_PER_DAY);
};

const formatDayMonth = (m: number, d: number): string => {
  const month = monthNames[m] || "";
  return `${d} ${month}`.trim();
};

const Birthday: React.FC<BirthdaysFeedProps> = ({
  items,
  webAbsoluteUrl,
  todayTitle,
  upcomingTitle,
  emptyTodayText,
  emptyUpcomingText,
  loading = false,
  error,
  onRetry,
  shimmerCountToday = 3,
  shimmerCountUpcoming = 6,
}) => {
  const buckets = React.useMemo(() => {
    const rows = (items || [])
      .map((x) => {
        const md = parseMonthDay(x.date);
        if (!md) return null;
        const diff = dayDiffFromToday(md.m, md.d);
        return { item: x, diff, md };
      })
      .filter((x): x is { item: IPersonBase; diff: number; md: { m: number; d: number } } => !!x)
      .filter((x) => x.diff >= 0)
      .sort((a, b) => a.diff - b.diff);

    const today = rows.filter((x) => x.diff === 0).map((x) => x.item);
    const upcomingRows = rows.filter((x) => x.diff > 0);

    const groups: Array<{ key: string; label: string; items: IPersonBase[] }> = [];
    const idxByKey: { [k: string]: number } = {};

    for (let i = 0; i < upcomingRows.length; i++) {
      const r = upcomingRows[i];
      const key = `${r.md.m}-${r.md.d}`;
      const label = formatDayMonth(r.md.m, r.md.d);

      if (idxByKey[key] === undefined) {
        idxByKey[key] = groups.length;
        groups.push({ key, label, items: [r.item] });
      } else {
        groups[idxByKey[key]].items.push(r.item);
      }
    }

    return { today, upcomingGroups: groups };
  }, [items]);

  return (
    <div className={`${styles.wrap} ${loading ? styles.isLoading : ""}`}>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <p>{todayTitle}</p>
        </div>

        {loading ? (
          <div className={styles.shimmerList}>
            <LoadingBoundary
              loading={true}
              preset="profile"
              count={shimmerCountToday}
              gap={14}
              ariaLabel="Loading celebrations"
            >
              <div />
            </LoadingBoundary>
          </div>
        ) : (
          <PeopleSimpleFeed
            items={buckets.today}
            webAbsoluteUrl={webAbsoluteUrl}
            emptyText={error ? "Failed to load." : emptyTodayText}
          />
        )}
      </div>

      <div className={styles.section}>
        <button className={styles.sectionHead + " " + styles.collapsible}>
          <span>{upcomingTitle}</span>
        </button>

        {loading ? (
          <div className={styles.shimmerList}>
            <LoadingBoundary
              loading={true}
              preset="profile"
              count={shimmerCountUpcoming}
              gap={14}
              ariaLabel="Loading upcoming celebrations"
            >
              <div />
            </LoadingBoundary>
          </div>
        ) : (
          (!buckets.upcomingGroups || buckets.upcomingGroups.length === 0) ? (
            <PeopleSimpleFeed
              items={[]}
              webAbsoluteUrl={webAbsoluteUrl}
              emptyText={error ? "Failed to load." : emptyUpcomingText}
              renderCta={() => null}
            />
          ) : (
            <div>
              {buckets.upcomingGroups.map((g) => (
                <div key={g.key}>
                  <div
                    style={{
                      padding: "10px 0 6px",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {g.label}
                  </div>

                  <PeopleSimpleFeed
                    items={g.items}
                    webAbsoluteUrl={webAbsoluteUrl}
                    renderCta={() => null}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Birthday;