import styles from "../Extension.module.scss";
import { PhotoService } from "../shared/photoService";

export interface SuggestItem {
  title: string;
  subtitle?: string;
  url: string;
  imageUrl?: string;
  kind: "person" | "page" | "doc";
}

export class SuggestBox {
  private host: HTMLDivElement | null = null;
  private activeIndex = -1;

  private readonly onReposition = () => this.updatePosition();

  constructor(
    private readonly attachUnder: HTMLElement,
    private readonly getWebUrl: () => string,
    private readonly photoService: PhotoService
  ) {}

  private extractAccountNameFromUrl(url: string): string {
    try {
      const u = new URL(url, window.location.origin);
      return (u.searchParams.get("accountname") || "").trim();
    } catch {
      const m = /[?&]accountname=([^&]+)/i.exec(url || "");
      return m ? decodeURIComponent(m[1] || "").trim() : "";
    }
  }

  private extractUsernameFromUserPhotoUrl(url: string): string {
    try {
      const u = new URL(url, window.location.origin);
      return (u.searchParams.get("username") || "").trim();
    } catch {
      const m = /[?&]username=([^&]+)/i.exec(url || "");
      return m ? decodeURIComponent(m[1] || "").trim() : "";
    }
  }

  close(): void {
    this.activeIndex = -1;

    window.removeEventListener("resize", this.onReposition);
    window.removeEventListener("scroll", this.onReposition, true);

    if (this.host) {
      this.host.remove();
      this.host = null;
    }
  }

  open(query: string, items: SuggestItem[]): void {
    this.close();

    const host = document.createElement("div");
    host.className = styles.TIRSuggestHost;
    host.setAttribute("role", "listbox");
    this.host = host;

    const list = document.createElement("div");
    list.className = styles.TIRSuggestList;

    if (!items.length) {
      const row = document.createElement("div");
      row.className = styles.TIRSuggestItem;
      row.setAttribute("aria-disabled", "true");
      row.style.cursor = "default"; // optional (can remove if you want)

      const thumb = document.createElement("div");
      thumb.className = styles.TIRSuggestThumb;

      const textWrap = document.createElement("div");

      const t1 = document.createElement("div");
      t1.className = styles.TIRSuggestTitle;
      t1.textContent = `No results for “${query}”`;

      const t2 = document.createElement("div");
      t2.className = styles.TIRSuggestSub;
      t2.textContent = "Try a different keyword or check the spelling.";

      textWrap.appendChild(t1);
      textWrap.appendChild(t2);

      row.appendChild(thumb);
      row.appendChild(textWrap);
      list.appendChild(row);
    } else {
      items.forEach((it, idx) => {
        const row = document.createElement("div");
        row.className = styles.TIRSuggestItem;
        row.setAttribute("role", "option");
        row.setAttribute("data-index", String(idx));
        row.setAttribute("data-url", it.url);
        row.setAttribute("data-kind", it.kind);
        row.setAttribute("aria-selected", "false");

        const thumb = document.createElement("div");
        thumb.className = styles.TIRSuggestThumb;

        if (it.kind === "person") {
          const img = document.createElement("img");
          img.alt = "";

          const upn =
            this.extractAccountNameFromUrl(it.url) ||
            this.extractUsernameFromUserPhotoUrl(it.imageUrl || "");

          void this.photoService.setAvatar(img, "M", upn, it.title);
          thumb.appendChild(img);
        } else if (it.imageUrl) {
          const img = document.createElement("img");
          img.src = it.imageUrl;
          img.alt = "";
          thumb.appendChild(img);
        }

        const textWrap = document.createElement("div");

        const t1 = document.createElement("div");
        t1.className = styles.TIRSuggestTitle;
        t1.textContent = it.title;

        const t2 = document.createElement("div");
        t2.className = styles.TIRSuggestSub;
        t2.textContent = it.subtitle || "";

        textWrap.appendChild(t1);
        textWrap.appendChild(t2);

        row.appendChild(thumb);
        row.appendChild(textWrap);

        row.addEventListener("click", () => {
          if (it.url) window.location.href = it.url;
        });

        list.appendChild(row);
      });
    }

    const footer = document.createElement("div");
    footer.className = styles.TIRSuggestFooter;
    footer.textContent = items.length ? "View all results" : `Search “${query}”`;

    footer.addEventListener("click", () => {
      const q = query.trim();
      const base = this.getWebUrl().replace(/\/$/, "");
      window.location.href = q
        ? `${base}/_layouts/15/search.aspx?q=${encodeURIComponent(q)}`
        : `${base}/_layouts/15/search.aspx`;
    });

    host.appendChild(list);
    host.appendChild(footer);

    // ✅ IMPORTANT: attach under header wrapper (same stacking context as header)
    // NOT document.body (SharePoint can have weird offsets)
    this.attachUnder.parentElement?.appendChild(host);

    this.updatePosition();

    window.addEventListener("resize", this.onReposition);
    window.addEventListener("scroll", this.onReposition, true);
  }

  // ✅ only set TOP (keep width/left/transform in SCSS)
  updatePosition(): void {
    if (!this.host) return;

    const input = this.attachUnder.getBoundingClientRect();
    const top = Math.round(input.bottom + 8);

    this.host.style.top = `${top}px`;
  }

  moveActive(direction: "down" | "up" | "enter"): boolean {
    if (!this.host) return false;

    const rows = Array.from(
      this.host.querySelectorAll<HTMLElement>(`.${styles.TIRSuggestItem}[data-url]`)
    );

    if (!rows.length) return false;

    if (direction === "enter") {
      if (this.activeIndex < 0 || this.activeIndex >= rows.length) return false;
      const url = rows[this.activeIndex].getAttribute("data-url") || "";
      if (url) window.location.href = url;
      return true;
    }

    if (this.activeIndex >= 0 && this.activeIndex < rows.length) {
      rows[this.activeIndex].setAttribute("aria-selected", "false");
    }

    if (direction === "down") this.activeIndex = (this.activeIndex + 1) % rows.length;
    if (direction === "up") this.activeIndex = (this.activeIndex - 1 + rows.length) % rows.length;

    rows[this.activeIndex].setAttribute("aria-selected", "true");
    rows[this.activeIndex].scrollIntoView({ block: "nearest" });

    return true;
  }
}
