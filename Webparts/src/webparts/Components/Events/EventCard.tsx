import * as React from "react";
import styles from "./Allevents.module.scss";
import EventRegistration from "./Registration/RegistrationModal";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface EventCardProps {
  date: string;
  day: string;
  month: string;
  category: string;
  status: "Upcoming" | "Registered";
  title: string;
  time: string;
  location: string;
  imageUrl: string;
  eventDateTime: Date | string | null;
  ID: number | string;
  pageUrl: string;
  context?: any;
  sitePagesListTitle?: string;
  registeredEventsListTitle?: string;
  registeredFieldInternal?: string;
}

const DEFAULTS = {
  sitePagesListTitle: "Site Pages",
  registeredEventsListTitle: "Registered User Event",
  registeredFieldInternal: "TIRRegisteredUsers",
};

const escOData = (s: string): string => (s || "").replace(/'/g, "''");

const uniqNums = (arr: number[]) =>
  Array.from(new Set(arr.filter((n) => Number.isFinite(n) && n > 0)));

const parseNumericIdList = (raw: any): number[] => {
  const text = String(raw || "");
  const tokens = text
    .split(/[,\n\r]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const ids = tokens
    .filter((t) => /^\d+$/.test(t))
    .map((t) => parseInt(t, 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  return uniqNums(ids);
};

const EventCard: React.FC<EventCardProps> = (props) => {
  const {
    date,
    day,
    month,
    category,
    title,
    time,
    location,
    imageUrl,
    eventDateTime,
    ID,
    pageUrl,
    context,
  } = props;

  const cfg = React.useMemo(
    () => ({
      sitePagesListTitle: props.sitePagesListTitle || DEFAULTS.sitePagesListTitle,
      registeredEventsListTitle:
        props.registeredEventsListTitle || DEFAULTS.registeredEventsListTitle,
      registeredFieldInternal: props.registeredFieldInternal || DEFAULTS.registeredFieldInternal,
    }),
    [props.sitePagesListTitle, props.registeredEventsListTitle, props.registeredFieldInternal]
  );

  const [countdown, setCountdown] = React.useState<string>("");
  const [isPastEvent, setIsPastEvent] = React.useState(false);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [newregister, setnewregister] = React.useState(false);
  const [resolvedItemId, setResolvedItemId] = React.useState<number | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const sp: SPFI | null = React.useMemo(() => {
    try {
      return context ? spfi().using(SPFx(context)) : null;
    } catch {
      return null;
    }
  }, [context]);

  const getCurrentUserId = React.useCallback(async (): Promise<number> => {
    const legacyId = (context?.pageContext as any)?.legacyPageContext?.userId;
    if (legacyId) return Number(legacyId);

    if (sp) {
      try {
        const me: any = await sp.web.currentUser.select("Id")();
        const id = Number(me?.Id || 0);
        if (id) return id;
      } catch {
        // ignore
      }
    }
    return 0;
  }, [context, sp]);

  const resolveItemIdFromPageUrl = React.useCallback(
    async (url: string): Promise<number | null> => {
      if (!sp || !context) return null;

      const webAbs = String(context?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
      if (!webAbs) return null;

      let fileRef = "";
      try {
        const u = new URL(url, webAbs);
        fileRef = decodeURIComponent(u.pathname);
      } catch {
        fileRef = url;
      }

      if (!fileRef.startsWith("/")) {
        fileRef = "/" + fileRef.replace(/^\/*/, "");
      }

      try {
        const rows: any[] = await sp.web.lists
          .getByTitle(cfg.sitePagesListTitle)
          .items.select("Id", "FileRef")
          .filter(`FileRef eq '${escOData(fileRef)}'`)
          .top(1)();

        const id = rows?.[0]?.Id ? Number(rows[0].Id) : 0;
        return id || null;
      } catch {
        return null;
      }
    },
    [sp, context, cfg.sitePagesListTitle]
  );

  React.useEffect(() => {
    let alive = true;

    const run = async () => {
      const n = Number(ID);
      if (Number.isFinite(n) && n > 0) {
        if (alive) setResolvedItemId(n);
        return;
      }

      const resolved = await resolveItemIdFromPageUrl(pageUrl);
      if (alive) setResolvedItemId(resolved);
    };

    run();
    return () => {
      alive = false;
    };
  }, [ID, pageUrl, resolveItemIdFromPageUrl]);

  React.useEffect(() => {
    let alive = true;

    const checkRegistration = async () => {
      if (!sp || !context) return;

      const userId = await getCurrentUserId();
      const eventItemId = resolvedItemId;

      if (!userId || !eventItemId) {
        if (alive) setIsRegistered(false);
        return;
      }

      try {
        const rows: any[] = await sp.web.lists
          .getByTitle(cfg.registeredEventsListTitle)
          .items.select("Id", "AuthorId", cfg.registeredFieldInternal)
          .filter(`AuthorId eq ${userId}`)
          .top(1)();

        const row = rows?.[0];
        const ids = parseNumericIdList(row?.[cfg.registeredFieldInternal]);
        const registered = ids.includes(eventItemId);

        if (alive) setIsRegistered(registered);
      } catch {
        if (alive) setIsRegistered(false);
      }
    };

    checkRegistration();
    return () => {
      alive = false;
    };
  }, [
    sp,
    context,
    resolvedItemId,
    refreshKey,
    getCurrentUserId,
    cfg.registeredEventsListTitle,
    cfg.registeredFieldInternal,
  ]);

  React.useEffect(() => {
    const calculate = () => {
      if (!eventDateTime) {
        setIsPastEvent(true);
        return;
      }

      const now = new Date();
      const ev = new Date(eventDateTime);
      const diff = ev.getTime() - now.getTime();

      if (diff <= 0) {
        setIsPastEvent(true);
        return;
      }

      setIsPastEvent(false);

      const daysRemaining = diff / (1000 * 60 * 60 * 24);
      const days = Math.floor(daysRemaining);
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days} Day${days > 1 ? "s" : ""}`);
      } else if (hours > 0) {
        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        setCountdown(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    calculate();
    const i = setInterval(calculate, 1000);
    return () => clearInterval(i);
  }, [eventDateTime]);

  const handleRegisterClick = () => {
    if (!resolvedItemId) return;
    setnewregister(true);
  };

  return (
    <>
      <a href={pageUrl} className={styles.cardLinkWrapper}>
        <div className={`${styles.eventCard} ${isPastEvent ? styles.pastEvent : ""}`}>
          <div className={styles.dateSection}>
            <div className={styles.day}>{day}</div>
            <div className={styles.date}>
              {date} {month}
            </div>
          </div>

          <div className={styles.imageSection}>
            <img src={imageUrl} alt={title} className={styles.eventImage} />
            {!isPastEvent && (
              <span
                className={`${styles.statusBadge} ${
                  isRegistered ? styles.registered : styles.upcoming
                }`}
              >
                {isRegistered ? "Registered" : "Upcoming"}
              </span>
            )}
          </div>

          <div className={styles.contentWrapper}>
            <div className={styles.detailsSection}>
              <div className={styles.category}>{category}</div>
              <h3 className={styles.title}>{title}</h3>
            </div>

            <div className={styles.locationSection}>
              <div className={styles.infoRow}>
                <span className={styles.infoText}>{time}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoText}>{location}</span>
              </div>
            </div>

            <div className={styles.actionSection}>
              {isPastEvent ? (
                <div className={styles.pastEventLabel}>Past event</div>
              ) : isRegistered ? (
                countdown && (
                  <div className={styles.countdownWrapper}>
                    <div className={styles.countdownLabel}>Event starts in</div>
                    <div className={styles.countdownTime}>{countdown}</div>
                  </div>
                )
              ) : (
                <button
                  type="button"
                  className={styles.registerButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRegisterClick();
                  }}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      </a>

      {newregister && resolvedItemId && (
        <EventRegistration
          isOpen={newregister}
          onDismiss={() => setnewregister(false)}
          context={context}
          eventId={resolvedItemId}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </>
  );
};

export default EventCard;
