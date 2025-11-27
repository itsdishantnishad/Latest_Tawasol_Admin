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

// 🔸 change this to your own static placeholder if you want
const FALLBACK_IMAGE: string = require("../../../assets/PlaceHolderImage.png");

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
    props?.context?.pageContext?.web?.serverRelativeUrl || ""; // e.g. "/sites/Arnav-Site-Test"
  const lowerSiteRoot = currentSiteRoot.toLowerCase();

  // 👉 Build image URL from newsImage (from search result)
  const buildImageUrlFromNewsImage = (newsImage: string | undefined): string => {
    if (!newsImage) return "";

    const raw = newsImage.trim();

    // absolute URL, just return it
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    // server-relative path
    if (raw.startsWith("/")) {
      return `${tenantOrigin}${raw}`;
    }

    // relative path
    return `${tenantOrigin}/${raw}`;
  };

  const rawEvents = props.Allevent || [];

  // Filter: only keep events that clearly belong to *this* site
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

  // Shape events for UI – our computed preview URL always wins
  const convertToDummyEvents = (allEvents: any[]): IEventItem[] => {
    return allEvents.map((ev, index) => {
      const newsImageUrl = buildImageUrlFromNewsImage(ev.newsImage);
      const rawDate = ev.eventStartDate || ev.date || "";

      return {
        // bring original fields first
        ...ev,

        // then override / normalize what we need
        id: ev.id ?? ev.ID ?? index + 1,
        title: ev.title || ev.Title,
        imageUrl: newsImageUrl || ev.imageUrl || "",
        imageCount: ev.imageCount ?? 26,
        date:
          typeof rawDate === "string" ? rawDate.split("\n")[0] : (rawDate as string),
      } as IEventItem;
    });
  };

  const dummyEvents = convertToDummyEvents(eventsFromCurrentSite);
  console.log("[EventGalleryHome] events", dummyEvents);
  // Load "Image Gallery" images for detail view
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
            <p>
              This site has no events yet. Please create event pages to see them
              here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Gallery grid
  const visibleEvents = dummyEvents.slice(0, visibleCount);

  return (
    <div className={styles.eventGallery}>
      <div className={styles.galleryGrid}>
        {visibleEvents.map((event) => {
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
