import * as React from "react";
import { useState } from "react";
import styles from "./EventGalleryDetail.module.scss";
import EventGalleryCard from "../EventGalleryHome/EventGalleryCard";

interface IEventDetailProps {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  imageCount: number;
  onBack: () => void;
  eventdata: any[];
  images: any[];
}

interface IPhoto {
  id: number;
  url: string;
  alt: string;
}

const EventDetail: React.FC<IEventDetailProps> = (props) => {
  const { eventTitle, eventDate, imageCount, onBack, eventdata, images } =
    props;
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [showFindMyPhoto, setShowFindMyPhoto] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [faceRecognized, setFaceRecognized] = useState<boolean>(false);
  const profileImageUrl =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200";
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const openLightbox = (photoId: number): void => {
    setSelectedPhoto(photoId);
  };
  const [selectedEvent, setSelectedEvent] = useState(null);
  const closeLightbox = (): void => {
    setSelectedPhoto(null);
  };

  const toggleFindMyPhoto = (): void => {
    setShowFindMyPhoto(!showFindMyPhoto);
  };

  const handleTabClick = (tab: string): void => {
    setActiveTab(tab);
    if (tab === "profile") {
      // Simulate face recognition after selecting profile picture
      setTimeout(() => {
        setFaceRecognized(true);
      }, 1000);
    }
  };

  const currentPhotoIndex = selectedPhoto
    ? images.findIndex((p) => p.Id === selectedPhoto)
    : 0;

  const goToPrevious = (): void => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(images[currentPhotoIndex - 1].Id);
    }
  };

  const goToNext = (): void => {
    if (currentPhotoIndex < images.length - 1) {
      setSelectedPhoto(images[currentPhotoIndex + 1].Id);
    }
  };
  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedPreview(url);
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/png");
    setCapturedPreview(img);
  };
  const onContinueWithPhoto = () => {
    // this is final confirm after capture photo
    // here you can send preview image to API OR set in state
    console.log("final captured image: ", capturedPreview);

    // same logic what I do in profile / upload continue flow
    //  handleFinalSubmit(capturedPreview);
  };
  const useProfilePicture = () => {
    setFaceRecognized(true);
  };

  const ProfilePhotoPanel = ({ profileUrl, onUse }: any) => (
    <div className={styles.profileConfirmWrapper}>
      <div className={styles.profileConfirmBox}>
        <img src={profileUrl} className={styles.profileCircleImage} />
        <div className={styles.checkIcon}>✓</div>
      </div>

      <button className={styles.continueBtn} onClick={onUse}>
        Continue
      </button>
    </div>
  );

  const UploadPhotoPanel = ({ preview, onUpload }: any) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleClick = () => fileInputRef.current?.click();

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) return;
      if (file.size > 5 * 1024 * 1024) return;
      onUpload(file);
    };
    return (
      <div className={styles.uploadWrapper}>
        <h2 className={styles.panelTitle}>Face Recognition</h2>
        <p className={styles.panelSub}>
          File picker modal opens (jpg/png only, &lt;5MB)
        </p>

        {!preview && (
          <div className={styles.dropZone} onClick={handleClick}>
            <div className={styles.uploadIconPlaceholder}></div>
            <span className={styles.dropText}>
              Drag an image or{" "}
              <span className={styles.uploadLink}>Upload a file</span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg, .jpeg, .png"
              className={styles.hiddenFileInput}
              onChange={handleFile}
            />
          </div>
        )}

        {preview && (
          <div className={styles.previewContainer}>
            <img src={preview} className={styles.previewImage} />
          </div>
        )}
      </div>
    );
  };

  const TakePhotoPanel = ({
    preview,
    videoRef,
    onCapture,
    onContinue,
  }: any) => {
    // start camera automatically
    React.useEffect(() => {
      (async () => {
        if (videoRef.current) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            videoRef.current.srcObject = stream;
          } catch (err) {
            console.log("Camera permission denied:", err);
          }
        }
      })();
    }, [videoRef]);

    return (
      <div className={styles.uploadWrapper}>
        <h2 className={styles.panelTitle}>Face Recognition</h2>
        <p className={styles.panelSub}>
          Take a picture using your device camera
        </p>

        {!preview && (
          <div className={styles.dropZoneCamera}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={styles.cameraVideo}
            ></video>
            <button className={styles.captureBtn} onClick={onCapture}>
              Capture
            </button>
          </div>
        )}

        {preview && (
          <>
            <div className={styles.previewContainer}>
              <img src={preview} className={styles.previewImage} />
            </div>
            <button className={styles.usePhotoBtn} onClick={onContinue}>
              Continue
            </button>
          </>
        )}
      </div>
    );
  };
  const handleEventClick = (event: any): void => {
    setSelectedEvent(event);
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
          <button
            className={styles.findPhotoButton}
            onClick={toggleFindMyPhoto}
          >
            Find my Photo <span className={styles.dropdownIcon}>▼</span>
          </button>

          {showFindMyPhoto && (
            <div className={styles.findPhotoDropdown}>
              <div className={styles.dropdownContent}>
                <div className={styles.tabButtons}>
                  {["profile", "upload", "take"].map((tab) => (
                    <button
                      key={tab}
                      className={`${styles.tabButton} ${
                        activeTab === tab ? styles.active : ""
                      }`}
                      onClick={() => handleTabClick(tab)}
                    >
                      {tab === "profile"
                        ? "Use Profile Picture"
                        : tab === "upload"
                        ? "Upload Photo"
                        : "Take a Picture"}
                    </button>
                  ))}
                </div>

                <div className={styles.recognitionSection}>
                  {activeTab === "profile" && (
                    <>
                      <h3 className={styles.recognitionTitle}>
                        Face Recognition
                      </h3>

                      {!faceRecognized ? (
                        <p className={styles.recognitionMessage}>
                          We found a photo linked to your account. Please
                          confirm to continue.
                        </p>
                      ) : (
                        <p className={styles.recognitionMessage}>
                          Face recognized! Showing your photos...
                        </p>
                      )}
                    </>
                  )}
                  {activeTab === "profile" && (
                    <ProfilePhotoPanel
                      profileUrl={profileImageUrl}
                      onUse={useProfilePicture}
                    />
                  )}
                  {activeTab === "upload" && (
                    <UploadPhotoPanel
                      preview={uploadedPreview}
                      onUpload={handleUploadChange}
                    />
                  )}
                  {activeTab === "take" && (
                    <TakePhotoPanel
                      preview={capturedPreview}
                      videoRef={videoRef}
                      onCapture={capturePhoto}
                      onContinue={onContinueWithPhoto}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <div className={styles.photoGrid}>
        {images.map((photo) => (
          <div
            key={photo.Id}
            className={styles.photoItem}
            onClick={() => openLightbox(photo.Id)}
          >
            <img
              src={`https://orgessence.sharepoint.com${photo.FileRef}`}
              alt={photo.alt}
            />
          </div>
        ))}
      </div>

      {/* More Event Gallery Section */}
      {/* More Event Gallery Section */}
      <div className={styles.moreEventsSection}>
        <div className={styles.moreEventsHeader}>
          <h2 className={styles.moreEventsTitle}>
            More Event <span className={styles.galleryHighlight}>Gallery</span>
          </h2>
          <button className={styles.viewAllButton} onClick={onBack}>View All</button>
        </div>

        <div className={styles.moreEventsCardsRow}>
          {/* map your event cards here */}
          {eventdata.slice(0, 2).map((event) => (
            <EventGalleryCard
              key={event.id}
              event={event}
              onClick={() => handleEventClick(event)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
    {selectedPhoto !== null && (
  <div className={styles.lightboxOverlay}>
    <div className={styles.lightboxContainer} onClick={closeLightbox}>

      <div className={styles.counter}>
        {currentPhotoIndex + 1} / {images.length}
      </div>

      <button className={styles.closeBtn} onClick={closeLightbox}>×</button>

      {/* previous preview */}
      {currentPhotoIndex > 0 && (
        <div
          className={styles.sideThumbsLeft}
          onClick={(e)=>{e.stopPropagation(); goToPrevious();}}
        >
          <img src={images[currentPhotoIndex-1].Url} />
        </div>
      )}

      <img
        className={styles.mainImage}
        src={images[currentPhotoIndex].Url}
        alt=""
        onClick={(e)=>e.stopPropagation()}
      />

      {/* next preview */}
      {currentPhotoIndex < images.length-1 && (
        <div
          className={styles.sideThumbsRight}
          onClick={(e)=>{e.stopPropagation(); goToNext();}}
        >
          <img src={images[currentPhotoIndex+1].Url} />
        </div>
      )}

    </div>
  </div>
)}

    </div>
  );
};

export default EventDetail;
