import * as React from "react";
import { useState } from "react";
import styles from "../EventGallery.module.scss";
import EventGalleryDetail from "../EventGalleryDetail/EventGalleryDetail";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/profiles";

interface IEventItem {
  id: number;
  title: string;
  imageUrl: string;
  imageCount: number;
  date: string;
}

interface IEventGalleryProps {
  context: any;
  Allevent: any;
}

// Placeholder Image from Assets Folder
const FALLBACK_IMAGE: string = require("../../../assets/PlaceHolderImage.png");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ✅ UPDATED: safer date parser (minimal but prevents crashes)
const parseDateSafe = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value !== "string") return null;

  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;

  // fallback: DD/MM/YYYY or DD-MM-YYYY
  const m = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10) - 1;
    const yyyy = parseInt(m[3], 10);
    const d2 = new Date(yyyy, mm, dd);
    return isNaN(d2.getTime()) ? null : d2;
  }

  return null;
};

const getMonthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const EventGallery: React.FC<IEventGalleryProps> = (props) => {
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [selectedEvent, setSelectedEvent] = useState<IEventItem | null>(null);
  const [images, setImages] = useState<any[]>([]);

  const sp: SPFI = React.useMemo(
    () => spfi().using(SPFx(props.context)),
    [props.context]
  );

  const tenantOrigin: string =
    props?.context?.pageContext?.web?.absoluteUrl?.split("/sites")[0] ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const currentSiteRoot: string =
    props?.context?.pageContext?.web?.serverRelativeUrl || "";

  const lowerSiteRoot = currentSiteRoot.toLowerCase();

  const buildImageUrlFromNewsImage = (newsImage: string | undefined): string => {
    if (!newsImage) return "";

    const raw = newsImage.trim();

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    if (raw.startsWith("/")) {
      return `${tenantOrigin}${raw}`;
    }

    return `${tenantOrigin}/${raw}`;
  };

  const rawEvents = props.Allevent || [];

  const eventsFromCurrentSite = React.useMemo(
    () =>
      rawEvents.filter((ev: any) => {
        if (!lowerSiteRoot) return true;

        const newsImg = (ev.newsImage || "").toLowerCase();
        const pageUrl = (
          ev.pageUrl ||
          ev.url ||
          ev.LinkUrl ||
          ev.FileRef ||
          ""
        ).toLowerCase();

        return newsImg.includes(lowerSiteRoot) || pageUrl.includes(lowerSiteRoot);
      }),
    [rawEvents, lowerSiteRoot]
  );

  const convertToDummyEvents = (allEvents: any[]): IEventItem[] => {
    return allEvents.map((ev, index) => {
      const newsImageUrl = buildImageUrlFromNewsImage(ev.newsImage);
      const rawDate = ev.eventStartDate || ev.date || "";

      return {
        ...ev,
        id: ev.id ?? ev.ID ?? index + 1,
        title: ev.title || ev.Title,
        imageUrl: newsImageUrl || ev.imageUrl || "",
        imageCount: ev.imageCount ?? 26,
        date: typeof rawDate === "string" ? rawDate.split("\n")[0] : String(rawDate),
      } as IEventItem;
    });
  };

  const dummyEvents = convertToDummyEvents(eventsFromCurrentSite);
  console.log("[EventGalleryHome] events", dummyEvents);

  React.useEffect(() => {
    const loadImages = async () => {
      const result = await sp.web.lists
        .getByTitle("Image Gallery")
        .items.select("Id", "Title", "FileLeafRef", "FileRef", "Modified")();

      const formatted = result.map((item: any) => ({
        ...item,
        Url: `${tenantOrigin}${item.FileRef}`,
      }));

      console.log("Images loaded", formatted);
      setImages(formatted);
    };

    loadImages();
  }, [sp, tenantOrigin]);

  const loadMore = (): void => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  const handleEventClick = (event: IEventItem): void => {
    setSelectedEvent(event);
  };

  const handleBackToGallery = (): void => {
    setSelectedEvent(null);
  };

  // ✅ FIX: Hook must be above conditional returns (to avoid React #197)
  const groupedVisible = React.useMemo(() => {
    const visibleEvents = dummyEvents.slice(0, visibleCount);

    const map = new Map<
      string,
      { key: string; label: string; items: IEventItem[]; sort: number }
    >();

    visibleEvents.forEach((ev) => {
      const dt = parseDateSafe(ev.date);
      const key = dt ? getMonthKey(dt) : "unknown";
      const label = dt ? getMonthLabel(dt) : "Unknown";

      if (!map.has(key)) {
        map.set(key, {
          key,
          label,
          items: [],
          sort: dt ? new Date(dt.getFullYear(), dt.getMonth(), 1).getTime() : 0,
        });
      }
      map.get(key)!.items.push(ev);
    });

    return Array.from(map.values()).sort((a, b) => b.sort - a.sort);
  }, [dummyEvents, visibleCount]);

  // Detail view
  if (selectedEvent) {
    return (
      <EventGalleryDetail
        eventId={selectedEvent.id}
        eventTitle={selectedEvent.title}
        eventDate={selectedEvent.date}
        imageCount={selectedEvent.imageCount}
        onBack={handleBackToGallery}
        eventdata={dummyEvents}
        images={images}
        dymaicUrl={props?.context?._pageContext?.web?.absoluteUrl?.split("/sites")[0]}
      />
    );
  }

  // No events for this site
  if (!dummyEvents.length) {
    return (
      <div className={styles.eventGallery}>
        <div
          className={styles.galleryGrid}
          style={{ justifyContent: "center", padding: "40px 0" }}
        >
          <div>
            <h3>No events to show</h3>
            <p>This site has no events yet. Please create event pages to see them here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.eventGallery}>
      {/* Month-wise sections */}
      {groupedVisible.map((group) => (
        <div key={group.key} className={styles.monthSection}>
          <div className={styles.monthHeading}>{group.label}</div>

          <div className={styles.galleryGrid}>
            {group.items.map((event) => {
              const imgSrc = event.imageUrl || FALLBACK_IMAGE;

              return (
                <div
                  key={event.id}
                  className={styles.eventCard}
                  onClick={() => handleEventClick(event)}
                >
                  <div className={styles.imageContainer}>
                    <img
                      src={imgSrc}
                      alt={event.title}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                    <div className={styles.overlay}>
                      <h3 className={styles.eventTitle}>
                        {event.title}
                        <svg
                          className={styles.arrow}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </h3>
                      <div className={styles.cardFooter}>
                        <span className={styles.imageCount}>
                          {event.imageCount} images
                        </span>
                        <span className={styles.eventDate}>{event.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {visibleCount < dummyEvents.length && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreBtn} onClick={loadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
