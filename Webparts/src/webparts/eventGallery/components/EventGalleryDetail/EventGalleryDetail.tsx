import * as React from "react";
import { useState } from "react";
import styles from "./EventGalleryDetail.module.scss";
import EventGalleryCard from "../EventGalleryHome/EventGalleryCard";

// carousel icons
const PrevIcon = require("../../../assets/left_Button_Gallery.svg");
const NextIcon = require("../../../assets/Right_Button_Gallery.svg");

/* ======================================================
   🔮 FUTURE AZURE FACE API SERVICE (STUB)
   ====================================================== */

interface IFaceMatchResult {
  fileRef: string;
  confidence: number;
}

/**
 * IMPORTANT:
 * - In real implementation this will call:
 *   Azure Function / API Management
 * - NEVER call Azure Face API directly from SPFx
 */
class FaceRecognitionService {
  public static async findMatchingImages(
    uploadedImage: string,
    eventImages: any[]
  ): Promise<IFaceMatchResult[]> {

    // 🔮 MOCK IMPLEMENTATION (FOR NOW)
    // Replace with Azure Function call later

    console.log("Face API called with image:", uploadedImage);

    // Simulate delay
    await new Promise((res) => setTimeout(res, 1200));

    // Fake logic: return random 1–2 matches
    const shuffled = [...eventImages].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(2, eventImages.length));

    return picked.map((img) => ({
      fileRef:
        img.FileRef ||
        img.ServerRelativeUrl ||
        img.Url ||
        img.url,
      confidence: Math.random() * (0.95 - 0.75) + 0.75
    }));
  }
}

/* ======================================================
   COMPONENT
   ====================================================== */

interface IEventDetailProps {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  imageCount: number;
  onBack: () => void;
  eventdata: any[];
  images: any[];
  dymaicUrl: string;
}

const resolveImageUrl = (img: any): string => {
  if (!img) return "";

  const raw =
    img.Url ||
    img.url ||
    img.FileRef ||
    img.fileRef ||
    img.ServerRelativeUrl ||
    img.serverRelativeUrl;

  if (!raw) return "";
  if (raw.startsWith("http")) return raw;

  return `${window.location.origin}${raw}`;
};

const EventDetail: React.FC<IEventDetailProps> = (props) => {
  const { eventTitle, eventDate, imageCount, onBack, eventdata, images } =
    props;

  /* ================= STATE ================= */

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showFindMyPhoto, setShowFindMyPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const [finding, setFinding] = useState(false);
  const [matchedIndexes, setMatchedIndexes] = useState<number[]>([]);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  /* ================= LIGHTBOX ================= */

  const openLightbox = (index: number) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);

  const goToPrevious = () => {
    if (activeIndex !== null && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const goToNext = () => {
    if (activeIndex !== null && activeIndex < images.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  /* ================= FACE RECOGNITION FLOW ================= */

  const handleUploadChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedPreview(url);
    runFaceRecognition(url);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/png");
    setCapturedPreview(img);
    runFaceRecognition(img);
  };

  const runFaceRecognition = async (imageBase64: string) => {
    try {
      setFinding(true);

      const matches =
        await FaceRecognitionService.findMatchingImages(
          imageBase64,
          images
        );

      // 🔗 Map matches → carousel indexes
      const indexes = matches
        .map((m) =>
          images.findIndex(
            (img) =>
              (img.FileRef ||
                img.ServerRelativeUrl ||
                img.Url ||
                img.url) === m.fileRef
          )
        )
        .filter((i) => i !== -1);

      setMatchedIndexes(indexes);

      if (indexes.length > 0) {
        setActiveIndex(indexes[0]); // open first match
      }
    } catch (e) {
      console.error("Face recognition failed", e);
    } finally {
      setFinding(false);
    }
  };

  /* ================= TITLE ================= */

  const getTitleParts = (title: string) => {
    const parts = title.trim().split(" ");
    return { first: parts[0], rest: parts.slice(1).join(" ") };
  };

  const { first, rest } = getTitleParts(eventTitle);

  /* ================= RENDER ================= */

  return (
    <div className={styles.eventDetail}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <span className={styles.backArrow}>‹</span>
          <span className={styles.backText}>Back |</span>

          <button
            className={styles.breadcrumbLink}
            onClick={onBack}
            type="button"
          >
            Events Gallery
          </button>

          <span className={styles.separator}>›</span>
          <span className={styles.current}>{eventTitle}</span>
        </div>

        <div className={styles.titleSection}>
          <h1 className={styles.eventTitle}>
            <span className={styles.oneText}>{first}</span> {rest}
          </h1>
          <p className={styles.eventMeta}>
            {eventDate} / {imageCount} Images
          </p>
        </div>

        <div className={styles.findPhotoWrapper}>
          {/* <button
            className={styles.findPhotoButton}
            onClick={() => setShowFindMyPhoto(!showFindMyPhoto)}
          >
            Find my Photo <span className={styles.dropdownIcon}>▼</span>
          </button> */}

          {showFindMyPhoto && (
            <div className={styles.findPhotoDropdown}>
              <div className={styles.tabButtons}>
                {["profile", "upload", "take"].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tabButton} ${
                      activeTab === tab ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
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
                {finding && <p>Finding your photos…</p>}

                {activeTab === "upload" && (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) =>
                      e.target.files &&
                      handleUploadChange(e.target.files[0])
                    }
                  />
                )}

                {activeTab === "take" && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      className={styles.cameraVideo}
                    />
                    <button
                      className={styles.captureBtn}
                      onClick={capturePhoto}
                    >
                      Capture
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className={styles.photoGrid}>
        {images.map((photo, index) => (
          <div
            key={index}
            className={styles.photoItem}
            onClick={() => openLightbox(index)}
          >
            <img src={resolveImageUrl(photo)} />
          </div>
        ))}
      </div>

      {/* ================= MORE EVENTS ================= */}
      {eventdata && eventdata.length > 0 && (
        <div className={styles.moreEventsSection}>
          <div className={styles.moreEventsHeader}>
            <h2 className={styles.moreEventsTitle}>View Other Albums</h2>

            <button
              className={styles.viewAllButton}
              onClick={onBack}
              type="button"
            >
              View All
            </button>
          </div>

          <div className={styles.moreEventsCardsRow}>
            {eventdata.slice(0, 2).map((event) => (
              <EventGalleryCard
                key={event.id}
                event={event}
                onClick={() => {
                  // 🔮 future: navigate to selected album
                  // onAlbumClick(event)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX ================= */}
      {activeIndex !== null && (
        <div
          className={styles.lightboxOverlay}
          onClick={closeLightbox}
        >
          <div
            className={styles.lightboxContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {/* COUNTER (TOP CENTER) */}
            <span className={styles.carouselCounter}>
              {activeIndex + 1} / {images.length}
            </span>

            {/* CLOSE */}
            <button
              className={styles.closeBtn}
              onClick={closeLightbox}
            >
              ×
            </button>

            {/* MAIN IMAGE */}
            <img
              src={resolveImageUrl(images[activeIndex])}
              className={styles.mainImage}
            />

            {/* LEFT PREVIEW */}
            {activeIndex > 0 && (
              <div
                className={styles.sideThumbsLeft}
                onClick={goToPrevious}
              >
                <img src={resolveImageUrl(images[activeIndex - 1])} />
              </div>
            )}

            {/* RIGHT PREVIEW */}
            {activeIndex < images.length - 1 && (
              <div
                className={styles.sideThumbsRight}
                onClick={goToNext}
              >
                <img src={resolveImageUrl(images[activeIndex + 1])} />
              </div>
            )}

            {/* BOTTOM CONTROLS (INSIDE container) */}
            <div className={styles.carouselControls}>
              <button
                className={styles.carouselBtn}
                onClick={goToPrevious}
                disabled={activeIndex === 0}
              >
                <img src={PrevIcon} />
              </button>

              <button
                className={styles.carouselBtn}
                onClick={goToNext}
                disabled={activeIndex === images.length - 1}
              >
                <img src={NextIcon} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
