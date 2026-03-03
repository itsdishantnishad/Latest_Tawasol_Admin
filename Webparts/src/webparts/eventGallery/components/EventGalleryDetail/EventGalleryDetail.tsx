// import * as React from "react";
// import { useState } from "react";
// import styles from "./EventGalleryDetail.module.scss";
// import EventGalleryCard from "../EventGalleryHome/EventGalleryCard";
// import { MSGraphClientV3 } from "@microsoft/sp-http";

// // carousel icons
// const PrevIcon = require("../../../assets/left_Button_Gallery.svg");
// const NextIcon = require("../../../assets/Right_Button_Gallery.svg");

// /* ======================================================
//    COMPONENT
//    ====================================================== */

// interface IEventDetailProps {
//   eventId: number;
//   eventTitle: string;
//   eventDate: string;
//   imageCount: number;
//   onBack: () => void;
//   eventdata: any[];
//   images: any[];
//   dymaicUrl: string;

//   // pass context if you have it (recommended)
//   context?: any;
// }

// /* ================= Dynamic URL Helpers ================= */

// const getWebAbsoluteUrl = (ctx?: any): string => {
//   return (
//     ctx?.pageContext?.web?.absoluteUrl ||
//     (window as any)?._spPageContextInfo?.webAbsoluteUrl ||
//     `${window.location.origin}${(window as any)?._spPageContextInfo?.webServerRelativeUrl || ""}` ||
//     window.location.origin
//   );
// };

// const getOriginFromAbsoluteUrl = (absUrl: string): string => {
//   try {
//     return new URL(absUrl).origin;
//   } catch {
//     return window.location.origin;
//   }
// };

// const getApiBase = (ctx?: any): string => {
//   // Always call REST + build same-origin URLs from current web
//   const webAbs = getWebAbsoluteUrl(ctx);
//   return getOriginFromAbsoluteUrl(webAbs);
// };

// const makeAbsoluteIfNeeded = (url: string, baseAbsUrl: string): string => {
//   if (!url) return "";
//   try {
//     return new URL(url, baseAbsUrl).toString(); // supports /relative and relative
//   } catch {
//     return url;
//   }
// };

// /* ================= Existing helpers ================= */

// const resolveImageUrl = (img: any, ctx?: any): string => {
//   if (!img) return "";
//   const raw =
//     img.Url ||
//     img.url ||
//     img.FileRef ||
//     img.fileRef ||
//     img.ServerRelativeUrl ||
//     img.serverRelativeUrl;

//   if (!raw) return "";
//   if (raw.startsWith("http")) return raw;

//   // dynamic origin (not hardcoded)
//   const origin = getApiBase(ctx);
//   return `${origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
// };

// const tryGetSpfxUserLoginName = (ctx?: any): string | null => {
//   const fromCtx = ctx?.pageContext?.user?.loginName;
//   const fromWindow = (window as any)?._spPageContextInfo?.userLoginName;
//   return fromCtx || fromWindow || null;
// };

// const tryGetSpfxUserEmail = (ctx?: any): string | null => {
//   const fromCtx = ctx?.pageContext?.user?.email;
//   const fromWindow = (window as any)?._spPageContextInfo?.userEmail;
//   return fromCtx || fromWindow || null;
// };

// const EventDetail: React.FC<IEventDetailProps> = (props) => {
//   const { eventTitle, eventDate, imageCount, onBack, eventdata, images } = props;

//   /* ================= STATE ================= */

//   const [activeIndex, setActiveIndex] = useState<number | null>(null);
//   const [showFindMyPhoto, setShowFindMyPhoto] = useState(false);
//   const [activeTab, setActiveTab] = useState<"profile" | "upload" | "take">("profile");

//   // previews
//   const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
//   const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
//   const [profilePreview, setProfilePreview] = useState<string | null>(null);

//   // for future Face API use: keep selected bytes in memory
//   const [selectedBytes, setSelectedBytes] = useState<ArrayBuffer | null>(null);
//   const [selectedContentType, setSelectedContentType] = useState<string>("");

//   // status (NOT searching yet)
//   const [statusMsg, setStatusMsg] = useState<string>("");

//   const videoRef = React.useRef<HTMLVideoElement>(null);
//   const cameraStreamRef = React.useRef<MediaStream | null>(null);

//   // Track object URLs so we can revoke them.
//   const objectUrlsRef = React.useRef<string[]>([]);
//   const rememberObjectUrl = (url: string) => objectUrlsRef.current.push(url);

//   React.useEffect(() => {
//     return () => {
//       // cleanup previews
//       objectUrlsRef.current.forEach((u) => {
//         try {
//           URL.revokeObjectURL(u);
//         } catch {
//           /* noop */
//         }
//       });
//       objectUrlsRef.current = [];

//       // stop camera if still running
//       cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
//       cameraStreamRef.current = null;
//     };
//   }, []);

//   /* ================= LIGHTBOX ================= */

//   const openLightbox = (index: number) => setActiveIndex(index);
//   const closeLightbox = () => setActiveIndex(null);

//   const goToPrevious = () => {
//     if (activeIndex !== null && activeIndex > 0) setActiveIndex(activeIndex - 1);
//   };

//   const goToNext = () => {
//     if (activeIndex !== null && activeIndex < images.length - 1) setActiveIndex(activeIndex + 1);
//   };

//   /* ================= INPUT 1: UPLOAD PHOTO ================= */

//   const handleUploadChange = async (file: File) => {
//     setStatusMsg("");

//     const previewUrl = URL.createObjectURL(file);
//     rememberObjectUrl(previewUrl);
//     setUploadedPreview(previewUrl);

//     const bytes = await file.arrayBuffer();
//     setSelectedBytes(bytes);
//     setSelectedContentType(file.type || "application/octet-stream");

//     // NO searching yet, no lightbox open
//     setStatusMsg("Upload photo selected (ready for Face search later).");
//   };

//   /* ================= INPUT 2: TAKE A PHOTO ================= */

//   const capturePhoto = async () => {
//     setStatusMsg("");

//     const video = videoRef.current;
//     if (!video || !video.videoWidth || !video.videoHeight) {
//       setStatusMsg("Camera is not ready yet. Please wait 1–2 seconds and try again.");
//       return;
//     }

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     canvas.getContext("2d")?.drawImage(video, 0, 0);

//     const blob: Blob = await new Promise((resolve, reject) => {
//       canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Capture failed"))), "image/jpeg", 0.92);
//     });

//     const previewUrl = URL.createObjectURL(blob);
//     rememberObjectUrl(previewUrl);
//     setCapturedPreview(previewUrl);

//     const bytes = await blob.arrayBuffer();
//     setSelectedBytes(bytes);
//     setSelectedContentType(blob.type || "image/jpeg");

//     // NO searching yet, no lightbox open
//     setStatusMsg("Captured photo selected (ready for Face search later).");
//   };

//   /* ================= INPUT 3: USE PROFILE PICTURE ================= */

//   // Same-origin userphoto.aspx URL (dynamic tenant)
//   const buildUserPhotoAspxUrl = (accountname: string) => {
//     const origin = getApiBase(props.context);
//     return `${origin}/_layouts/15/userphoto.aspx?size=L&accountname=${encodeURIComponent(accountname)}`;
//   };

//   // Graph: only option to get bytes reliably in browser
//   const tryGraphProfilePhoto = async (): Promise<Blob | null> => {
//     const ctx = props.context;
//     if (!ctx?.msGraphClientFactory) return null;

//     try {
//       const client: MSGraphClientV3 = await ctx.msGraphClientFactory.getClient("3");

//       // Standard endpoint
//       const blob1: any = await client.api("/me/photo/$value").responseType("blob" as any).get();
//       if (blob1 instanceof Blob) return blob1;

//       // Fallback
//       const blob2: any = await client.api("/me/photos/240x240/$value").responseType("blob" as any).get();
//       if (blob2 instanceof Blob) return blob2;
//     } catch {
//       // ignore and fallback to SPO userphoto.aspx preview
//     }

//     return null;
//   };

//   // PeopleManager gives PictureUrl + AccountName/Email (use AccountName/Email to build userphoto.aspx preview)
//   const tryPeopleManagerProfileSource = async (): Promise<{
//     pictureUrl?: string;
//     accountName?: string;
//     email?: string;
//   } | null> => {
//     try {
//       const webAbs = getWebAbsoluteUrl(props.context);
//       const origin = getApiBase(props.context);

//       const url = `${origin}/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=PictureUrl,AccountName,Email`;
//       const res = await fetch(url, {
//         credentials: "same-origin",
//         headers: { Accept: "application/json;odata=nometadata" },
//       });
//       if (!res.ok) return null;

//       const json: any = await res.json();
//       return {
//         pictureUrl: json?.PictureUrl ? makeAbsoluteIfNeeded(json.PictureUrl, webAbs) : undefined,
//         accountName: json?.AccountName,
//         email: json?.Email,
//       };
//     } catch {
//       return null;
//     }
//   };

//   const useProfilePicture = async () => {
//     // Clear old selection (prevents showing old bytes)
//     setStatusMsg("");
//     setProfilePreview(null);
//     setSelectedBytes(null);
//     setSelectedContentType("");

//     // 1) Graph first -> bytes available + preview via blob URL
//     const graphBlob = await tryGraphProfilePhoto();
//     if (graphBlob) {
//       const previewUrl = URL.createObjectURL(graphBlob);
//       rememberObjectUrl(previewUrl);
//       setProfilePreview(previewUrl);

//       const bytes = await graphBlob.arrayBuffer();
//       setSelectedBytes(bytes);
//       setSelectedContentType(graphBlob.type || "image/jpeg");

//       setStatusMsg("Profile photo selected");
//       return;
//     }

//     // 2) PeopleManager -> build SAME-ORIGIN preview using Email (preferred) or AccountName
//     const pm = await tryPeopleManagerProfileSource();
//     const accountForAspx = pm?.email || pm?.accountName;

//     if (accountForAspx) {
//       const preview = buildUserPhotoAspxUrl(accountForAspx);
//       setProfilePreview(preview);

//       // bytes not readable in browser (Graph failed). We'll fetch server-side later for Face API.
//       setSelectedBytes(null);
//       setSelectedContentType("image/*");

//       setStatusMsg("Profile photo selected");
//       return;
//     }

//     // 3) Final fallback: use context login/email directly
//     const loginName = tryGetSpfxUserLoginName(props.context);
//     const email = tryGetSpfxUserEmail(props.context);
//     const acc = email || loginName; // email usually works best for userphoto.aspx

//     if (acc) {
//       setProfilePreview(buildUserPhotoAspxUrl(acc));
//       setSelectedBytes(null);
//       setSelectedContentType("image/*");
//       setStatusMsg("Profile photo selected");
//       return;
//     }

//     setStatusMsg("Profile photo could not be resolved.");
//   };

//   /* ================= CAMERA STREAM ================= */

//   React.useEffect(() => {
//     const shouldRunCamera = showFindMyPhoto && activeTab === "take";

//     if (!shouldRunCamera) {
//       cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
//       cameraStreamRef.current = null;
//       if (videoRef.current) (videoRef.current as any).srcObject = null;
//       return;
//     }

//     const start = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "user" },
//           audio: false,
//         });
//         cameraStreamRef.current = stream;
//         if (videoRef.current) (videoRef.current as any).srcObject = stream;
//       } catch {
//         setStatusMsg("Camera permission blocked or unavailable.");
//       }
//     };

//     void start();

//     return () => {
//       cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
//       cameraStreamRef.current = null;
//       if (videoRef.current) (videoRef.current as any).srcObject = null;
//     };
//   }, [activeTab, showFindMyPhoto]);

//   /* ================= TITLE ================= */

//   const getTitleParts = (title: string) => {
//     const parts = title.trim().split(" ");
//     return { first: parts[0], rest: parts.slice(1).join(" ") };
//   };

//   const { first, rest } = getTitleParts(eventTitle);

//   /* ================= RENDER ================= */

//   return (
//     <div className={styles.eventDetail}>
//       {/* ================= HEADER ================= */}
//       <div className={styles.header}>
//         <div className={styles.breadcrumb}>
//           <span className={styles.backArrow}>‹</span>
//           <span className={styles.backText}>Back |</span>

//           <button className={styles.breadcrumbLink} onClick={onBack} type="button">
//             Events Gallery
//           </button>

//           <span className={styles.separator}>›</span>
//           <span className={styles.current}>{eventTitle}</span>
//         </div>

//         <div className={styles.titleSection}>
//           <h1 className={styles.eventTitle}>
//             <span className={styles.oneText}>{first}</span> {rest}
//           </h1>
//           <p className={styles.eventMeta}>
//             {eventDate} / {imageCount} Images
//           </p>
//         </div>

//         <div className={styles.findPhotoWrapper}>
//           <button
//             className={styles.findPhotoButton}
//             onClick={() => setShowFindMyPhoto(!showFindMyPhoto)}
//             type="button"
//           >
//             Find my Photo <span className={styles.dropdownIcon}>▼</span>
//           </button>

//           {showFindMyPhoto && (
//             <div className={styles.findPhotoDropdown}>
//               <div className={styles.tabButtons}>
//                 {(["profile", "upload", "take"] as const).map((tab) => (
//                   <button
//                     key={tab}
//                     className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
//                     onClick={() => setActiveTab(tab)}
//                     type="button"
//                   >
//                     {tab === "profile"
//                       ? "Use Profile Picture"
//                       : tab === "upload"
//                       ? "Upload Photo"
//                       : "Take a Picture"}
//                   </button>
//                 ))}
//               </div>

//               <div className={styles.recognitionSection}>
//                 {statusMsg && <p style={{ marginTop: 8 }}>{statusMsg}</p>}

//                 {/* PROFILE */}
//                 {activeTab === "profile" && (
//                   <div>
//                     <button className={styles.captureBtn} onClick={() => void useProfilePicture()} type="button">
//                       Use my profile picture
//                     </button>

//                     {profilePreview && (
//                       <div style={{ marginTop: 10 }}>
//                         <img
//                           src={profilePreview}
//                           alt="Profile preview"
//                           style={{ width: 96, height: 96, borderRadius: 8, objectFit: "cover" }}
//                           onError={() => {
//                             // If userphoto.aspx with AccountName fails, retry with email/login from context
//                             const email = tryGetSpfxUserEmail(props.context);
//                             const login = tryGetSpfxUserLoginName(props.context);
//                             const acc = email || login;
//                             if (acc) setProfilePreview(buildUserPhotoAspxUrl(acc));
//                           }}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* UPLOAD */}
//                 {activeTab === "upload" && (
//                   <div>
//                     <input
//                       type="file"
//                       accept=".jpg,.jpeg,.png"
//                       onChange={(e) => e.target.files && void handleUploadChange(e.target.files[0])}
//                     />

//                     {uploadedPreview && (
//                       <div style={{ marginTop: 10 }}>
//                         <img
//                           src={uploadedPreview}
//                           alt="Upload preview"
//                           style={{ width: 96, height: 96, borderRadius: 8, objectFit: "cover" }}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* TAKE */}
//                 {activeTab === "take" && (
//                   <>
//                     <video ref={videoRef} autoPlay playsInline muted className={styles.cameraVideo} />
//                     <button className={styles.captureBtn} onClick={() => void capturePhoto()} type="button">
//                       Capture
//                     </button>

//                     {capturedPreview && (
//                       <div style={{ marginTop: 10 }}>
//                         <img
//                           src={capturedPreview}
//                           alt="Captured preview"
//                           style={{ width: 96, height: 96, borderRadius: 8, objectFit: "cover" }}
//                         />
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {/* Debug info */}
//                 {selectedBytes ? (
//                   <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
//                     Selected bytes: {selectedBytes.byteLength} | Type: {selectedContentType}
//                   </p>
//                 ) : profilePreview ? (
//                   <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
//                     Selected source: Profile URL (bytes will be fetched server-side later)
//                   </p>
//                 ) : null}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ================= GRID ================= */}
//       <div className={styles.photoGrid}>
//         {images.map((photo, index) => (
//           <div key={index} className={styles.photoItem} onClick={() => openLightbox(index)} role="button">
//             <img src={resolveImageUrl(photo, props.context)} alt={`Photo ${index + 1}`} />
//           </div>
//         ))}
//       </div>

//       {/* ================= MORE EVENTS ================= */}
//       {eventdata && eventdata.length > 0 && (
//         <div className={styles.moreEventsSection}>
//           <div className={styles.moreEventsHeader}>
//             <h2 className={styles.moreEventsTitle}>View Other Albums</h2>
//             <button className={styles.viewAllButton} onClick={onBack} type="button">
//               View All
//             </button>
//           </div>

//           <div className={styles.moreEventsCardsRow}>
//             {eventdata.slice(0, 2).map((event) => (
//               <EventGalleryCard
//                 key={event.id}
//                 event={event}
//                 onClick={() => {
//                   // future: navigate to selected album
//                 }}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ================= LIGHTBOX ================= */}
//       {activeIndex !== null && (
//         <div className={styles.lightboxOverlay} onClick={closeLightbox}>
//           <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
//             <span className={styles.carouselCounter}>
//               {activeIndex + 1} / {images.length}
//             </span>

//             <button className={styles.closeBtn} onClick={closeLightbox} type="button">
//               ×
//             </button>

//             <img
//               src={resolveImageUrl(images[activeIndex], props.context)}
//               className={styles.mainImage}
//               alt="Selected"
//             />

//             {activeIndex > 0 && (
//               <div className={styles.sideThumbsLeft} onClick={goToPrevious}>
//                 <img src={resolveImageUrl(images[activeIndex - 1], props.context)} alt="Prev" />
//               </div>
//             )}

//             {activeIndex < images.length - 1 && (
//               <div className={styles.sideThumbsRight} onClick={goToNext}>
//                 <img src={resolveImageUrl(images[activeIndex + 1], props.context)} alt="Next" />
//               </div>
//             )}

//             <div className={styles.carouselControls}>
//               <button className={styles.carouselBtn} onClick={goToPrevious} disabled={activeIndex === 0} type="button">
//                 <img src={PrevIcon} alt="Prev" />
//               </button>

//               <button
//                 className={styles.carouselBtn}
//                 onClick={goToNext}
//                 disabled={activeIndex === images.length - 1}
//                 type="button"
//               >
//                 <img src={NextIcon} alt="Next" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EventDetail;





























































// EventGalleryDetail.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useState, useMemo } from "react";
import styles from "./EventGalleryDetail.module.scss";
import EventGalleryCard from "../EventGalleryHome/EventGalleryCard";

import { loadFaceConfig } from "../../../services/Integration/FaceAPI/FaceConfig";
import { AzureFaceApiClient, IFaceRectangle } from "../../../services/Integration/FaceAPI/AzureFaceApiClient";
import { FaceIndexSpService } from "../../../services/Integration/FaceAPI/FaceIndexSpService";
import { SPHttpClient } from "@microsoft/sp-http";

// carousel icons
const PrevIcon = require("../../../assets/left_Button_Gallery.svg");
const NextIcon = require("../../../assets/Right_Button_Gallery.svg");

interface IEventDetailProps {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  imageCount: number;
  onBack: () => void;
  eventdata: any[];
  images: any[];
  dymaicUrl: string;

  // REQUIRED for SharePoint list + folder UniqueId calls
  context: any;
}

const getWebAbs = (ctx: any): string =>
  ctx?.pageContext?.web?.absoluteUrl || (window as any)?._spPageContextInfo?.webAbsoluteUrl || window.location.origin;

const getApiOrigin = (ctx: any): string => {
  const abs = getWebAbs(ctx);
  try { return new URL(abs).origin; } catch { return window.location.origin; }
};

const resolveImageUrl = (img: any, ctx: any): string => {
  if (!img) return "";
  const raw = img.Url || img.url || img.FileRef || img.fileRef || img.ServerRelativeUrl || img.serverRelativeUrl;
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  return `${getApiOrigin(ctx)}${raw.startsWith("/") ? raw : `/${raw}`}`;
};

const getFileRef = (img: any): string =>
  img?.FileRef || img?.fileRef || img?.ServerRelativeUrl || img?.serverRelativeUrl || img?.Url || img?.url || "";

const folderFromFileRef = (fileRef: string): string => {
  const idx = fileRef.lastIndexOf("/");
  return idx > 0 ? fileRef.substring(0, idx) : fileRef;
};

const makeLargeFaceListId = (folderUniqueId: string): string => {
  const g = (folderUniqueId || "").toLowerCase().replace(/-/g, "");
  return `alb-${g}`;
};

const EventDetail: React.FC<IEventDetailProps> = (props) => {
  const { eventTitle, eventDate, imageCount, onBack, eventdata, images } = props;

  const cfg = useMemo(() => loadFaceConfig(), []);
  const faceApi = useMemo(() => new AzureFaceApiClient(cfg.endpoint, cfg.key), [cfg.endpoint, cfg.key]);
  const faceIndex = useMemo(() => new FaceIndexSpService(props.context, cfg), [props.context, cfg]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showFindMyPhoto, setShowFindMyPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "upload" | "take">("profile");

  const [statusMsg, setStatusMsg] = useState<string>("");
  const [isBusy, setIsBusy] = useState(false);

  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [queryBytes, setQueryBytes] = useState<ArrayBuffer | null>(null);

  const [matchedFileRefs, setMatchedFileRefs] = useState<string[] | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const cameraStreamRef = React.useRef<MediaStream | null>(null);

  const [hasSearchError, setHasSearchError] = useState(false);

  // cleanup camera
  React.useEffect(() => {
    const shouldRunCamera = showFindMyPhoto && activeTab === "take";
    if (!shouldRunCamera) {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) (videoRef.current as any).srcObject = null;
      return;
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        cameraStreamRef.current = stream;
        if (videoRef.current) (videoRef.current as any).srcObject = stream;
      } catch {
        setStatusMsg("Camera permission blocked or unavailable.");
      }
    })();

    return () => {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) (videoRef.current as any).srcObject = null;
    };
  }, [activeTab, showFindMyPhoto]);

  /* ================= Album identity (folder UniqueId → LargeFaceListId) ================= */

  const getAlbumFolderServerRelativeUrl = (): string => {
    if (props.dymaicUrl && props.dymaicUrl.startsWith("/")) return props.dymaicUrl;

    const firstRef = getFileRef(images?.[0]);
    if (firstRef && firstRef.startsWith("/")) return folderFromFileRef(firstRef);

    return "";
  };

  const getFolderUniqueId = async (folderServerRelativeUrl: string): Promise<string> => {
    const webAbs = getWebAbs(props.context);
    const url =
      `${webAbs}/_api/web/GetFolderByServerRelativeUrl('${folderServerRelativeUrl.replace(/'/g, "''")}')?$select=UniqueId`;

    const res = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Failed to get folder UniqueId: ${res.status} ${txt}`);
    }
    const json = await res.json();
    return json?.UniqueId;
  };

  const ensureAlbumLargeFaceList = async (): Promise<{ albumId: string; largeFaceListId: string }> => {
    const folderUrl = getAlbumFolderServerRelativeUrl();
    if (!folderUrl) throw new Error("Album folder URL not found (no images and no dymaicUrl).");

    const albumId = await getFolderUniqueId(folderUrl);
    const largeFaceListId = makeLargeFaceListId(albumId);

    await faceApi.ensureLargeFaceList(largeFaceListId, eventTitle);
    return { albumId, largeFaceListId };
  };

  const showGenericError = (err: any) => {
    // For devs
    // eslint-disable-next-line no-console
    console.error(err);

    // Extract best error message (this will show: "Face API error 403: {...}")
    const raw =
      (err && (err.message || (typeof err === "string" ? err : ""))) ||
      "Unknown error";

    // Show REAL error in browser confirm (Image 1 should show Image 2 text)
    window.confirm(raw);

    // Keep UI message generic (Image 3)
    setStatusMsg("Something went wrong.");
    setHasSearchError(true);

    // IMPORTANT: don't show "No matching photos found" on errors
    setMatchedFileRefs(null);
  };

  /* ================= Indexing (on-demand) ================= */

  const fetchBytesFromSharePointFile = async (img: any): Promise<ArrayBuffer> => {
    const url = resolveImageUrl(img, props.context);
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Failed to fetch image bytes: ${res.status}`);
    return await res.arrayBuffer();
  };

  const indexSingleImage = async (albumId: string, largeFaceListId: string, img: any): Promise<void> => {
    const fileRef = getFileRef(img);
    if (!fileRef) return;

    // Remove old rows for this file (avoid duplicates on re-index)
    await faceIndex.deleteRowsForFile(albumId, fileRef);

    const bytes = await fetchBytesFromSharePointFile(img);

    // detect faces (rectangles)
    const detected = await faceApi.detectFromBytes(bytes, "detection_03", "recognition_04", "mask,qualityForRecognition", true);
    if (!detected.length) return;

    for (const f of detected) {
      const rect = f.faceRectangle as IFaceRectangle;
      const persistedFaceId = await faceApi.addFaceToLargeFaceList(largeFaceListId, bytes, rect, "detection_03", fileRef);
      await faceIndex.addRow({
        albumId,
        fileRef,
        largeFaceListId,
        persistedFaceId,
      });
    }
  };

  const ensureAlbumIndexed = async (albumId: string, largeFaceListId: string): Promise<void> => {
    const hasAny = await faceIndex.hasAnyForAlbum(albumId);
    if (hasAny) return;

    setStatusMsg("First time setup: indexing this album for face search…");

    // Index ALL current images once (on-demand)
    const concurrency = 3;
    let i = 0;

    const workers = Array.from({ length: concurrency }, async () => {
      while (i < images.length) {
        const idx = i++;
        await indexSingleImage(albumId, largeFaceListId, images[idx]);
      }
    });

    await Promise.all(workers);

    setStatusMsg("Training album face list…");
    await faceApi.trainLargeFaceList(largeFaceListId);
    await faceApi.waitForTraining(largeFaceListId, 30000, 1000);

    setStatusMsg("Album indexing complete.");
  };

  /* ================= Searching ================= */

  const runSearch = async (bytesOverride?: ArrayBuffer): Promise<void> => {
    const bytesToUse = bytesOverride ?? queryBytes;

    if (!bytesToUse) {
      setStatusMsg("Please upload/take/use profile picture first.");
      return;
    }

    setIsBusy(true);
    try {
      setStatusMsg("Preparing album…");
      const { albumId, largeFaceListId } = await ensureAlbumLargeFaceList();

      await ensureAlbumIndexed(albumId, largeFaceListId);

      setStatusMsg("Detecting face…");
      const q = await faceApi.detectFromBytes(
        bytesToUse,
        "detection_03",
        "recognition_04",
        "mask,qualityForRecognition",
        true
      );

      if (!q.length) {
        setMatchedFileRefs([]);
        setStatusMsg("No face detected in your photo.");
        return;
      }

      const queryFaceId = q[0].faceId;

      setStatusMsg("Searching matches…");
      const sims = await faceApi.findSimilarFromLargeFaceList(
        queryFaceId,
        largeFaceListId,
        "matchPerson",
        100
      );

      const persistedIds = sims.map((s) => s.persistedFaceId);
      const refs = await faceIndex.getFileRefsByPersistedIds(albumId, persistedIds);

      setMatchedFileRefs(refs);
      setStatusMsg(refs.length ? `Found ${refs.length} matching photo(s).` : "No matches found.");
    } catch (e: any) {
      showGenericError(e);
    } finally {
      setIsBusy(false);
    }
  };

  /* ================= Query inputs ================= */

  const handleUploadChange = async (file: File) => {
    setStatusMsg("");
    setHasSearchError(false);
    setMatchedFileRefs(null);

    const preview = URL.createObjectURL(file);
    setUploadedPreview(preview);

    const bytes = await file.arrayBuffer();
    setQueryBytes(bytes);

    await runSearch(bytes);
  };

  const capturePhoto = async () => {
    setStatusMsg("");
    setHasSearchError(false);
    setMatchedFileRefs(null);

    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setStatusMsg("Camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Capture failed"))), "image/jpeg", 0.92);
    });

    const preview = URL.createObjectURL(blob);
    setCapturedPreview(preview);

    const bytes = await blob.arrayBuffer();
    setQueryBytes(bytes);

    await runSearch(bytes);
  };

  const buildUserPhotoAspxUrl = (account: string) => {
    const origin = getApiOrigin(props.context);
    return `${origin}/_layouts/15/userphoto.aspx?size=L&accountname=${encodeURIComponent(account)}`;
  };

  const tryGetUserAccount = (): string | null => {
    const email = props.context?.pageContext?.user?.email || (window as any)?._spPageContextInfo?.userEmail;
    const login = props.context?.pageContext?.user?.loginName || (window as any)?._spPageContextInfo?.userLoginName;
    return email || login || null;
  };

  const useProfilePicture = async () => {
    setStatusMsg("");
    setHasSearchError(false);
    setMatchedFileRefs(null);

    const acc = tryGetUserAccount();
    if (!acc) {
      setStatusMsg("User account not available.");
      return;
    }

    const url = buildUserPhotoAspxUrl(acc);
    setProfilePreview(url);

    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) {
      setStatusMsg("Could not read profile photo bytes.");
      return;
    } 

    const bytes = await res.arrayBuffer();
    setQueryBytes(bytes);

    await runSearch(bytes);
  };

  /* ================= UI helpers ================= */

  const visibleImages = React.useMemo(() => {
    if (!matchedFileRefs) return images;
    if (matchedFileRefs.length === 0) return [];
    const set = new Set(matchedFileRefs.map(r => r.toLowerCase()));
    return images.filter(img => set.has(getFileRef(img).toLowerCase()));
  }, [matchedFileRefs, images]);

  const clearResults = () => {
    setMatchedFileRefs(null);
    setStatusMsg("");
  };

  /* ================= TITLE ================= */

  const getTitleParts = (title: string) => {
    const parts = title.trim().split(" ");
    return { first: parts[0], rest: parts.slice(1).join(" ") };
  };
  const { first, rest } = getTitleParts(eventTitle);

  /* ================= LIGHTBOX ================= */

  const openLightbox = (index: number) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);

  const goToPrevious = () => {
    if (activeIndex !== null && activeIndex > 0) setActiveIndex(activeIndex - 1);
  };
  const goToNext = () => {
    if (activeIndex !== null && activeIndex < visibleImages.length - 1) setActiveIndex(activeIndex + 1);
  };

  return (
    <div className={styles.eventDetail}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <span className={styles.backArrow}>‹</span>
          <span className={styles.backText}>Back |</span>

          <button className={styles.breadcrumbLink} onClick={onBack} type="button">
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
          <button className={styles.findPhotoButton} onClick={() => setShowFindMyPhoto(!showFindMyPhoto)} type="button">
            Find my Photo <span className={styles.dropdownIcon}>▼</span>
          </button>

          {showFindMyPhoto && (
            <div className={styles.findPhotoDropdown}>
              <div className={styles.tabButtons}>
                {(["profile", "upload", "take"] as const).map(tab => (
                  <button
                    key={tab}
                    className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab === "profile" ? "Use Profile Picture" : tab === "upload" ? "Upload Photo" : "Take a Picture"}
                  </button>
                ))}
              </div>

              <div className={styles.recognitionSection}>
                {statusMsg && <p style={{ marginTop: 8 }}>{statusMsg}</p>}
                {isBusy && <p>Working…</p>}

                {activeTab === "profile" && (
                  <div>
                    <button className={styles.captureBtn} onClick={() => void useProfilePicture()} type="button" disabled={isBusy}>
                      Use my profile picture
                    </button>

                    {profilePreview && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          style={{ width: 96, height: 96, borderRadius: 8, objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "upload" && (
                  <div>
                    <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => e.target.files && void handleUploadChange(e.target.files[0])} />
                    {uploadedPreview && (
                      <div style={{ marginTop: 10 }}>
                        <img src={uploadedPreview} alt="Upload preview" style={{ width: 96, height: 96, borderRadius: 8, objectFit: "cover" }} />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "take" && (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className={styles.cameraVideo} />
                    <button className={styles.captureBtn} onClick={() => void capturePhoto()} type="button" disabled={isBusy}>
                      Capture
                    </button>

                    {capturedPreview && (
                      <div style={{ marginTop: 10 }}>
                        <img src={capturedPreview} alt="Captured preview" style={{ width: 96, height: 96, borderRadius: 8, objectFit: "cover" }} />
                      </div>
                    )}
                  </>
                )}

                {matchedFileRefs !== null && (
                  <button style={{ marginTop: 10 }} className={styles.captureBtn} onClick={clearResults} type="button">
                    Clear results
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRID */}
      <div className={styles.photoGrid}>
        {visibleImages.map((photo, index) => (
          <div key={index} className={styles.photoItem} onClick={() => openLightbox(index)} role="button">
            <img src={resolveImageUrl(photo, props.context)} alt={`Photo ${index + 1}`} />
          </div>
        ))}
        {!hasSearchError && matchedFileRefs && matchedFileRefs.length === 0 && (
          <p style={{ padding: 12 }}>No matching photos found.</p>
        )}
      </div>

      {/* MORE EVENTS */}
      {eventdata && eventdata.length > 0 && (
        <div className={styles.moreEventsSection}>
          <div className={styles.moreEventsHeader}>
            <h2 className={styles.moreEventsTitle}>View Other Albums</h2>
            <button className={styles.viewAllButton} onClick={onBack} type="button">
              View All
            </button>
          </div>

          <div className={styles.moreEventsCardsRow}>
            {eventdata.slice(0, 2).map((event) => (
              <EventGalleryCard key={event.id} event={event} onClick={() => {}} />
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {activeIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
            <span className={styles.carouselCounter}>
              {activeIndex + 1} / {visibleImages.length}
            </span>

            <button className={styles.closeBtn} onClick={closeLightbox} type="button">
              ×
            </button>

            <img src={resolveImageUrl(visibleImages[activeIndex], props.context)} className={styles.mainImage} alt="Selected" />

            {activeIndex > 0 && (
              <div className={styles.sideThumbsLeft} onClick={goToPrevious}>
                <img src={resolveImageUrl(visibleImages[activeIndex - 1], props.context)} alt="Prev" />
              </div>
            )}

            {activeIndex < visibleImages.length - 1 && (
              <div className={styles.sideThumbsRight} onClick={goToNext}>
                <img src={resolveImageUrl(visibleImages[activeIndex + 1], props.context)} alt="Next" />
              </div>
            )}

            <div className={styles.carouselControls}>
              <button className={styles.carouselBtn} onClick={goToPrevious} disabled={activeIndex === 0} type="button">
                <img src={PrevIcon} alt="Prev" />
              </button>

              <button className={styles.carouselBtn} onClick={goToNext} disabled={activeIndex === visibleImages.length - 1} type="button">
                <img src={NextIcon} alt="Next" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;