import * as React from 'react';
import { useState } from 'react';
import styles from './EventGalleryDetail.module.scss';

interface IEventDetailProps {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  imageCount: number;
  onBack: () => void;
}

interface IPhoto {
  id: number;
  url: string;
  alt: string;
}

const EventDetail: React.FC<IEventDetailProps> = (props) => {
  const { eventTitle, eventDate, imageCount, onBack } = props;

  // Dummy photos data - replace with actual images
  const photos: IPhoto[] = Array.from({ length: imageCount }, (_, index) => ({
    id: index + 1,
    url: `https://images.unsplash.com/photo-${1500000000000 + index * 100000}?w=400&h=400`,
    alt: `${eventTitle} - Photo ${index + 1}`
  }));

  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [showFindMyPhoto, setShowFindMyPhoto] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [faceRecognized, setFaceRecognized] = useState<boolean>(false);

  const openLightbox = (photoId: number): void => {
    setSelectedPhoto(photoId);
  };

  const closeLightbox = (): void => {
    setSelectedPhoto(null);
  };

  const toggleFindMyPhoto = (): void => {
    setShowFindMyPhoto(!showFindMyPhoto);
  };

  const handleTabClick = (tab: string): void => {
    setActiveTab(tab);
    if (tab === 'profile') {
      // Simulate face recognition after selecting profile picture
      setTimeout(() => {
        setFaceRecognized(true);
      }, 1000);
    }
  };

  const currentPhotoIndex = selectedPhoto ? photos.findIndex(p => p.id === selectedPhoto) : -1;

  const goToPrevious = (): void => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(photos[currentPhotoIndex - 1].id);
    }
  };

  const goToNext = (): void => {
    if (currentPhotoIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentPhotoIndex + 1].id);
    }
  };

  return (
    <div className={styles.eventDetail}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back to Gallery
        </button>
        <div className={styles.titleSection}>
          <h1 className={styles.eventTitle}>
            <span className={styles.oneText}>One</span> {eventTitle}
          </h1>
          <p className={styles.eventMeta}>
            {eventDate} / {imageCount} Images
          </p>
        </div>
        <div className={styles.findPhotoWrapper}>
          <button className={styles.findPhotoButton} onClick={toggleFindMyPhoto}>
            Find my Photo <span className={styles.dropdownIcon}>▼</span>
          </button>

          {/* Find My Photo Dropdown */}
          {showFindMyPhoto && (
            <div className={styles.findPhotoDropdown}>
              <div className={styles.dropdownContent}>
                <div className={styles.tabButtons}>
                  <button 
                    className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
                    onClick={() => handleTabClick('profile')}
                  >
                    Use Profile Picture
                  </button>
                  <button 
                    className={`${styles.tabButton} ${activeTab === 'upload' ? styles.active : ''}`}
                    onClick={() => handleTabClick('upload')}
                  >
                    Upload Photo
                  </button>
                  <button 
                    className={`${styles.tabButton} ${activeTab === 'take' ? styles.active : ''}`}
                    onClick={() => handleTabClick('take')}
                  >
                    Take a Picture
                  </button>
                </div>

                <div className={styles.recognitionSection}>
                  <h3 className={styles.recognitionTitle}>Face Recognition</h3>
                  {!faceRecognized ? (
                    <p className={styles.recognitionMessage}>
                      We found a photo linked to your account. Please confirm to continue.
                    </p>
                  ) : (
                    <p className={styles.recognitionMessage}>
                      Face recognized! Showing your photos...
                    </p>
                  )}

                  <div className={styles.profileImageWrapper}>
                    <div className={styles.profileImageContainer}>
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" 
                        alt="Profile" 
                        className={styles.profileImage}
                      />
                      {faceRecognized && (
                        <div className={styles.checkmarkIcon}>✓</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <div className={styles.photoGrid}>
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className={styles.photoItem}
            onClick={() => openLightbox(photo.id)}
          >
            <img src={photo.url} alt={photo.alt} />
          </div>
        ))}
      </div>

      {/* More Event Gallery Section */}
      <div className={styles.moreEventsSection}>
        <div className={styles.moreEventsHeader}>
          <h2 className={styles.moreEventsTitle}>
            More Event <span className={styles.galleryHighlight}>Gallery</span>
          </h2>
          <button className={styles.viewAllButton}>View All</button>
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto !== null && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.closeButton} onClick={closeLightbox}>×</button>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`} 
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            disabled={currentPhotoIndex === 0}
          >
            ‹
          </button>
          <img 
            src={photos[currentPhotoIndex].url} 
            alt={photos[currentPhotoIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            className={`${styles.navButton} ${styles.nextButton}`} 
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            disabled={currentPhotoIndex === photos.length - 1}
          >
            ›
          </button>
          <div className={styles.lightboxCounter}>
            {currentPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;