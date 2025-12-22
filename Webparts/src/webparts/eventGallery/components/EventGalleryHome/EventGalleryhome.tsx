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

interface IMonthGroup {
  monthYear: string;
  displayMonth: string;
  events: IEventItem[];
  sortKey: string;
}

interface IYearGroup {
  year: string;
  albumCount: number;
  coverImage: string;
  events: IEventItem[];
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
  const [visibleMonths, setVisibleMonths] = useState<number>(3);
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
  
  // for selected event images
  const getImagesForEvent = (eventTitle: string) => {
    const match = images.find(
      (folder) => folder.folderName.toLowerCase() === eventTitle.toLowerCase()
    );

    return match?.images || [];
  };
  
  const buildImageUrlFromNewsImage = (
    newsImage: string | undefined
  ): string => {
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

        return (
          newsImg.includes(lowerSiteRoot) || pageUrl.includes(lowerSiteRoot)
        );
      }),
    [rawEvents, lowerSiteRoot]
  );

  const formatEventDate = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const convertToDummyEvents = (allEvents: any[]): IEventItem[] => {
    return allEvents.map((ev, index) => {
      const newsImageUrl = buildImageUrlFromNewsImage(ev.newsImage);
      const rawDate = ev.eventStartDate || ev.date || "";
      const dateStr =
        typeof rawDate === "string"
          ? rawDate.split("\n")[0]
          : (rawDate as string);

      return {
        ...ev,
        id: ev.id ?? ev.ID ?? index + 1,
        title: ev.title || ev.Title,
        imageUrl: newsImageUrl || ev.imageUrl || "",
        imageCount: getImagesForEvent(ev?.title)?.length,
        date: formatEventDate(dateStr),
      } as IEventItem;
    });
  };

  const dummyEvents = convertToDummyEvents(eventsFromCurrentSite);

  // Group events by month
  const groupedByMonth = React.useMemo((): IMonthGroup[] => {
    const groups: { [key: string]: IEventItem[] } = {};

    dummyEvents.forEach((event) => {
      if (!event.date) return;

      try {
        // Parse the formatted date string "18 June 2025"
        const dateStr = event.date.toString();
        const eventDate = new Date(dateStr);
        if (isNaN(eventDate.getTime())) return;

        const monthYear = `${eventDate.getFullYear()}-${String(
          eventDate.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!groups[monthYear]) {
          groups[monthYear] = [];
        }
        groups[monthYear].push(event);
      } catch (e) {
        console.warn("Invalid date format:", event.date);
      }
    });

    // Convert to array and sort by month (most recent first)
    const monthGroups: IMonthGroup[] = Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((monthYear) => {
        const [year, month] = monthYear.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const displayMonth = date.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        });

        return {
          monthYear,
          displayMonth,
          events: groups[monthYear].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          }),
          sortKey: monthYear,
        };
      });

    return monthGroups;
  }, [dummyEvents]);

  // Group events by year for "More Event Gallery"
  const groupedByYear = React.useMemo((): IYearGroup[] => {
    const yearGroups: { [key: string]: IEventItem[] } = {};

    dummyEvents.forEach((event) => {
      if (!event.date) return;

      try {
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) return;

        const year = eventDate.getFullYear().toString();
        
        if (!yearGroups[year]) {
          yearGroups[year] = [];
        }
        yearGroups[year].push(event);
      } catch (e) {
        console.warn('Invalid date format:', event.date);
      }
    });

    // Convert to array and sort by year (most recent first)
    const years: IYearGroup[] = Object.keys(yearGroups)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map((year) => ({
        year,
        albumCount: yearGroups[year].length,
        coverImage: yearGroups[year][0]?.imageUrl || FALLBACK_IMAGE,
        events: yearGroups[year]
      }));

    return years;
  }, [dummyEvents]);

  React.useEffect(() => {
    const loadImages = async () => {
      const folders = await sp.web.lists
        .getByTitle("Image Gallery")
        .rootFolder.folders.select("Name", "ServerRelativeUrl")();

      const galleryData = await Promise.all(
        folders
          .filter((f: any) => f.Name !== "Forms") // ignore system folder
          .map(async (folder: any) => {
            const files = await sp.web
              .getFolderByServerRelativePath(folder.ServerRelativeUrl)
              .files.select(
                "Name",
                "ServerRelativeUrl",
                "TimeLastModified",
                "Id",
                "Title",
                "FileLeafRef",
                "FileRef",
                "Modified"
              )();

            return {
              folderName: folder.Name,
              images: files.map((file: any) => ({
                title: file.Name,
                fileRef: file.ServerRelativeUrl,
                url: `${tenantOrigin}${file.ServerRelativeUrl}`,
                modified: file.TimeLastModified,
              })),
            };
          })
      );

      console.log("Images loaded", galleryData);
      setImages(galleryData);
    };

    loadImages();
  }, [sp, tenantOrigin]);

  const loadMore = (): void => {
    setVisibleMonths((prevCount) => prevCount + 3);
  };

  const handleEventClick = (event: IEventItem): void => {
    setSelectedEvent(event);
  };

  const handleBackToGallery = (): void => {
    setSelectedEvent(null);
  };

  const handleYearClick = (year: string): void => {
    // Scroll to the first event of that year
    const yearEvents = groupedByMonth.filter(group => group.monthYear.startsWith(year));
    if (yearEvents.length > 0) {
      // Find the index of the first month group for this year
      const yearIndex = groupedByMonth.findIndex(group => group.monthYear.startsWith(year));
      if (yearIndex !== -1) {
        // Show enough months to include this year
        setVisibleMonths(Math.max(visibleMonths, yearIndex + 3));
        
        // Scroll to the year section after a brief delay
        setTimeout(() => {
          const elements = document.querySelectorAll(`.${styles.monthHeader}`);
          if (elements[yearIndex]) {
            elements[yearIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  // Detail view
  if (selectedEvent) {
    return (
      <EventGalleryDetail
        eventId={selectedEvent.id}
        eventTitle={selectedEvent.title}
        eventDate={selectedEvent.date}
        imageCount={getImagesForEvent(selectedEvent.title).length}
        onBack={handleBackToGallery}
        eventdata={dummyEvents}
        images={getImagesForEvent(selectedEvent.title)}
        dymaicUrl={
          props?.context?._pageContext?.web?.absoluteUrl?.split("/sites")[0]
        }
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

  // Gallery grid with month grouping
  const visibleMonthGroups = groupedByMonth.slice(0, visibleMonths);

  return (
    <div className={styles.eventGallery}>
      {visibleMonthGroups.map((monthGroup) => (
        <div key={monthGroup.monthYear} className={styles.monthSection}>
          <h2 className={styles.monthHeader}>{monthGroup.displayMonth}</h2>

          <div className={styles.galleryGrid}>
            {monthGroup.events.map((event) => {
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

      {visibleMonths < groupedByMonth.length && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreBtn} onClick={loadMore}>
            Load More
          </button>
        </div>
      )}

      {/* More Event Gallery Section */}
      {groupedByYear.length > 0 && (
        <div className={styles.moreEventGallery}>
          <h2 className={styles.moreEventHeader}>More Event Gallery</h2>
          
          <div className={styles.yearGalleryGrid}>
            {groupedByYear.map((yearGroup) => {
              const imgSrc = yearGroup.coverImage || FALLBACK_IMAGE;

              return (
                <div
                  key={yearGroup.year}
                  className={styles.yearCard}
                  onClick={() => handleYearClick(yearGroup.year)}
                >
                  <div className={styles.yearImageContainer}>
                    <img
                      src={imgSrc}
                      alt={`Events from ${yearGroup.year}`}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                    <div className={styles.yearOverlay}>
                      <h3 className={styles.yearTitle}>
                        {yearGroup.year}
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
                      <span className={styles.yearAlbumCount}>
                        {yearGroup.albumCount} Albums
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;