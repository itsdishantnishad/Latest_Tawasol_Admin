import * as React from 'react';
import { useState } from 'react';
import styles from '../EventGallery.module.scss';
import EventGalleryDetail from '../EventGalleryDetail/EventGalleryDetail';

interface IEventItem {
  id: number;
  title: string;
  imageUrl: string;
  imageCount: number;
  date: string;
}

interface IEventGalleryProps {
  // Add any props if needed
}

// Dummy JSON data
const dummyEvents: IEventItem[] = [
  {
    id: 1,
    title: "Workshops and Training Sessions",
    imageUrl: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=800",
    imageCount: 26,
    date: "1 June 2024"
  },
  {
    id: 2,
    title: "Live Music",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    imageCount: 28,
    date: "7 June 2024"
  },
  {
    id: 3,
    title: "Team Event",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    imageCount: 30,
    date: "7 June 2024"
  },
  {
    id: 4,
    title: "Live Music",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    imageCount: 26,
    date: "7 June 2024"
  },
  {
    id: 5,
    title: "Educational Seminars",
    imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800",
    imageCount: 26,
    date: "9 June 2024"
  },
  {
    id: 6,
    title: "Industry Conferences",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
    imageCount: 26,
    date: "18 June 2024"
  },
  {
    id: 7,
    title: "Team building Events",
    imageUrl: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800",
    imageCount: 26,
    date: "12 June 2024"
  },
  {
    id: 8,
    title: "Master Class-Finance & Non Finance",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    imageCount: 26,
    date: "26 June 2024"
  },
  {
    id: 9,
    title: "Conferences and Seminars",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    imageCount: 26,
    date: "29 June 2024"
  }
];

const EventGallery: React.FC<IEventGalleryProps> = (props) => {
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [selectedEvent, setSelectedEvent] = useState<IEventItem | null>(null);

  const loadMore = (): void => {
    setVisibleCount(prevCount => prevCount + 6);
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
                <div className={styles.cardContent}>
                  <h3 className={styles.eventTitle}>
                    {event.title}
                    <span className={styles.arrow}>›</span>
                  </h3>
                  <div className={styles.cardFooter}>
                    <span className={styles.imageCount}>{event.imageCount} images</span>
                    <span className={styles.eventDate}>{event.date}</span>
                  </div>
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