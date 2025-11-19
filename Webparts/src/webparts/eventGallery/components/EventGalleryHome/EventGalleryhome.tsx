import * as React from "react";
import { useState } from "react";
import styles from "../EventGallery.module.scss";
import EventGalleryDetail from "../EventGalleryDetail/EventGalleryDetail";
import { SPFI, spfi, SPFx } from '@pnp/sp';
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

const EventGallery: React.FC<IEventGalleryProps> = (props) => {
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [selectedEvent, setSelectedEvent] = useState<IEventItem | null>(null);
  const [images, setImages] = useState<any[]>([]);
    const sp: SPFI = React.useMemo(() => spfi().using(SPFx(props.context)), [props.context]);
//   Function for prepare data as in required format
const convertToDummyEvents = (allEvents: any[], baseUrl: string): IEventItem[] => {
  return allEvents.map((ev, index) => {
    return {
      id: index + 1,
      title: ev.title,
      imageUrl: ev.newsImage?.startsWith("http")
        ? ev.newsImage
        : `${baseUrl}${ev.newsImage}`,
      imageCount: 26, // static since I don't have count
      date: ev.eventStartDate?.split("\n")[0] ?? "" ,
      ...ev
    };
  });
};
let  dummyEvents = convertToDummyEvents(props.Allevent, props?.context?._pageContext?.web?.absoluteUrl?.split("/sites")[0]);

  //   load images
  React.useEffect(() => {
  const loadImages = async () => {

    const result = await sp.web.lists
      .getByTitle("Image Gallery")
      .items.select("Id", "Title", "FileLeafRef", "FileRef", "Modified")();

    const formatted = result.map((item:any) => ({
      ...item,
      Url: `${props?.context?._pageContext?.web?.absoluteUrl?.split("/sites")[0]}${item.FileRef}`   // <--- final dynamic complete url
    }));

    console.log("Images loaded", formatted);

    setImages(formatted);
  };
  
   loadImages();
}, [sp]);
  
  const loadMore = (): void => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  const handleEventClick = (event: IEventItem): void => {
    setSelectedEvent(event);
  };

  const handleBackToGallery = (): void => {
    setSelectedEvent(null);
  };

  // If an event is selected, show the detail view
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

  // Otherwise show the gallery grid
  const visibleEvents = dummyEvents.slice(0, visibleCount);

  return (
    <div className={styles.eventGallery}>
      <div className={styles.galleryGrid}>
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className={styles.eventCard}
            onClick={() => handleEventClick(event)}
          >
            <div className={styles.imageContainer}>
              <img src={event.imageUrl} alt={event.title} />
              <div className={styles.overlay}>
                {/* <div className={styles.cardContent}></div> */}
                <h3 className={styles.eventTitle}>
                  {event.title}
                  {/* <span className={styles.arrow}>›</span> */}
                  <svg className={styles.arrow} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
        ))}
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
