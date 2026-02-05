import * as React from "react";
import styles from "./Gallery.module.scss";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import ConditionalLink from "../ConditionalLink/ConditionalLink";
import GalleryService, { IGalleryImage as IServiceGalleryImage } from "../../services/FeaturedContent/GalleryService";

export interface IGalleryProps {
  onViewAll?: () => void;
  seeAllURL?: string;
  context: any;
}

export const Gallery: React.FC<IGalleryProps> = (props) => {
  const [spImages, setSpImages] = React.useState<IServiceGalleryImage[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setHasError(false);
      try {
        const svc = new GalleryService(props.context, "Image Gallery");
        const latest = await svc.getLatestFolderImages(8);
        if (mounted) setSpImages(latest || []);
      } catch {
        if (mounted) {
          setHasError(true);
          setSpImages([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (props.context?.pageContext?.web?.absoluteUrl) {
      void load();
    } else {
      setSpImages([]);
    }

    return () => {
      mounted = false;
    };
  }, [props.context]);

  // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
  const webUrl: string = (props.context?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
  const origin: string = webUrl ? new URL(webUrl).origin : "";

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();
    const raw = configured || "SitePages/DHRE-Gallery.aspx";

    if (!webUrl) return raw;

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    if (raw.startsWith("/")) {
      return `${origin}${raw}`;
    }

    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  const hasImages = spImages.length > 0;

  return (
    <div className={styles.galleryContainer}>
      {isLoading && (
        <div className={styles.statusMessage} role="status" aria-live="polite">
          Loading gallery...
        </div>
      )}

      {!isLoading && hasError && (
        <div className={styles.statusMessage} role="status" aria-live="polite">
          Something went wrong. Please reload the page.
        </div>
      )}

      {!isLoading && !hasError && !hasImages && (
        <div className={styles.statusMessage} role="status" aria-live="polite">
          No Image Found in Library
        </div>
      )}

      {hasImages && (
        <div className={styles.imageGrid}>
          {/* Row 1 */}
          <div className={styles.row}>
            {spImages.slice(0, 4).map((image, index) => (
              <div
                key={image.id}
                className={`${styles.imageItem} ${
                  index === 0 || index === 3 ? styles.shortImage : styles.tallImage
                }`}
              >
                <img src={image.url} alt={image.alt || `Gallery image ${index + 1}`} />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className={styles.row}>
            {spImages.slice(4, 8).map((image, index) => (
              <div
                key={image.id}
                className={`${styles.imageItem} ${
                  index === 0 || index === 3 ? styles.shortImage : styles.tallImage
                }`}
              >
                <img src={image.url} alt={image.alt || `Gallery image ${index + 5}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.buttonContainer}>
        <ConditionalLink to={viewAllHref}>
          <PrimaryButton label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Gallery;
