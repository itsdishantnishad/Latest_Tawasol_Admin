import * as React from "react";
import styles from "./Dashboards.module.scss";

interface DashboardItem { title: string; image?: string; url?: string; }
type Props = { item?: DashboardItem };

const FALLBACK =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='760'>" +
      "<rect width='100%' height='100%' fill='#f6f2ee'/>" +
      "<rect x='40' y='40' rx='24' ry='24' width='1320' height='680' fill='white' stroke='rgba(0,0,0,.08)'/>" +
      "<text x='70' y='110' fill='#d66' font-family='Segoe UI' font-size='42'>Dashboard Preview</text>" +
      "<text x='70' y='160' fill='#999' font-family='Segoe UI' font-size='20'>Add a Power BI URL in web part properties.</text>" +
    "</svg>"
  );

/** Allow only http(s) embeds; block javascript: etc. */
function sanitizeUrl(u: string): string {
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:" ? u : "";
  } catch {
    return "";
  }
}

const DashboardPreview: React.FC<Props> = ({ item }) => {
  const it: DashboardItem = item || { title: "Dashboard", image: "", url: "" };

  // normalize inputs
  const rawUrl = (it.url || "").trim();
  const safeUrl = sanitizeUrl(rawUrl);
  const hasUrl = safeUrl.length > 0;

  const imgSrc =
    it.image && it.image.trim().length > 0 ? it.image : FALLBACK;

  return (
    <section className={styles.previewCard} aria-label="Dashboard preview">
      <header className={styles.previewHeader}>
        <div className={styles.logoStub} />
        <h2 className={styles.previewTitle}>{it.title || "Dashboard"}</h2>
      </header>

      <div className={styles.previewBody}>
        {hasUrl ? (
          <iframe
            className={styles.previewFrame}
            src={safeUrl}
            title={it.title || "Dashboard"}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <img
            className={styles.previewImg}
            src={imgSrc}
            alt={it.title || "Dashboard"}
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
};

export default DashboardPreview;





