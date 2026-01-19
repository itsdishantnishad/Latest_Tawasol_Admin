import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient } from "@microsoft/sp-http";

export class PageMetaRelative {
  private readonly _ctx: ApplicationCustomizerContext;

  private _timer1?: number;
  private _timer2?: number;

  constructor(context: ApplicationCustomizerContext) {
    this._ctx = context;
  }

  public init(): void {
    void this.apply();
    this._timer1 = window.setTimeout((): void => { void this.apply(); }, 800);
    this._timer2 = window.setTimeout((): void => { void this.apply(); }, 1600);
  }

  public onNavigated(): void {
    void this.apply();
    this._timer1 = window.setTimeout((): void => { void this.apply(); }, 600);
    this._timer2 = window.setTimeout((): void => { void this.apply(); }, 1400);
  }

  public dispose(): void {
    if (this._timer1) window.clearTimeout(this._timer1);
    if (this._timer2) window.clearTimeout(this._timer2);
  }

  // ---------------- internal ----------------

  /** Fallback: current page file item Created (UTC) */
  private async getCurrentPageCreated(): Promise<Date | null> {
    try {
      const webUrl = (this._ctx?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
      let serverRel = window.location.pathname || "";
      try { serverRel = decodeURIComponent(serverRel); } catch {}
      serverRel = serverRel.replace(/'/g, "''");

      if (!webUrl || !serverRel) return null;

      const api =
        `${webUrl}/_api/web/GetFileByServerRelativePath(decodedurl='${serverRel}')/ListItemAllFields?$select=Created`;

      const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
      if (!res.ok) return null;

      const data = (await res.json()) as any;
      const created = data?.Created ? new Date(data.Created) : null;
      return created && !isNaN(created.getTime()) ? created : null;
    } catch {
      return null;
    }
  }

  private formatRelativeTime(d: Date): string {
    const diffMs = Date.now() - d.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));

    const min = Math.floor(diffSec / 60);
    const hr  = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const wk  = Math.floor(day / 7);
    const mon = Math.floor(day / 30);
    const yr  = Math.floor(day / 365);

    if (diffSec < 45) return "Just now";
    if (min < 60) return `${min} min ago`;
    if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
    if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
    if (wk < 5) return `${wk} week${wk === 1 ? "" : "s"} ago`;
    if (mon < 12) return `${mon} month${mon === 1 ? "" : "s"} ago`;
    return `${yr} year${yr === 1 ? "" : "s"} ago`;
  }

  // ---------------- NewsDetails helpers ----------------

  /** Parse "30 Dec 2025, 07:45 pm" (NewsDetails meta date text) */
  private parseNewsDateText(text: string): Date | null {
    const t = (text || "").trim();
    const m = t.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*([ap]m)$/i);
    if (!m) return null;

    const day = parseInt(m[1], 10);
    const monName = m[2].toLowerCase();
    const year = parseInt(m[3], 10);
    let hour = parseInt(m[4], 10);
    const minute = parseInt(m[5], 10);
    const ap = m[6].toLowerCase();

    const months: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, sept: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11
    };

    const mon = months[monName] ?? months[monName.slice(0, 3)];
    if (mon === undefined) return null;

    // 12h -> 24h
    if (ap === "pm" && hour < 12) hour += 12;
    if (ap === "am" && hour === 12) hour = 0;

    const d = new Date(year, mon, day, hour, minute, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  /* NewsDetails DOM: */
  private async applyNewsDetailsMeta(): Promise<boolean> {
    const root = document.querySelector('[class*="newsDetails_"]') as HTMLElement | null;
    if (!root) return false;

    const right = root.querySelector('[class*="rightSection_"]') as HTMLElement | null;
    if (!right) return false;

    if (right.dataset.tirMetaRel === window.location.pathname) return true;

    const metaTexts = Array.from(right.querySelectorAll('span[class*="metaText_"]')) as HTMLElement[];
    if (metaTexts.length < 3) return false;

    const readNode =
      metaTexts.find(n => /min\s+read|read\b/i.test((n.textContent || "").trim())) || null;

    const viewsNode =
      metaTexts.find(n => /\bviews?\b/i.test((n.textContent || "").trim())) || null;

    const dateNode =
      metaTexts.find(n => n !== readNode && n !== viewsNode) || metaTexts[metaTexts.length - 1];

    if (!readNode || !viewsNode || !dateNode) return false;

    const dots = Array.from(right.querySelectorAll('span[class*="dot_"]')) as HTMLElement[];
    const dot1 = dots[0] || document.createElement("span");
    const dot2 = dots[1] || document.createElement("span");

    const ensureDot = (d: HTMLElement): HTMLElement => {
      const txt = (d.textContent || "").trim();
      if (txt) return d;
      d.textContent = "•";
      d.setAttribute("aria-hidden", "true");
      d.style.margin = "0 10px";
      return d;
    };

    const parsed = this.parseNewsDateText((dateNode.textContent || "").trim());
    if (parsed) {
      dateNode.textContent = this.formatRelativeTime(parsed);
    } else {
      const created = await this.getCurrentPageCreated();
      if (created) dateNode.textContent = this.formatRelativeTime(created);
    }

    const frag = document.createDocumentFragment();
    frag.appendChild(dateNode);
    frag.appendChild(ensureDot(dot1));
    frag.appendChild(readNode);
    frag.appendChild(ensureDot(dot2));
    frag.appendChild(viewsNode);

    right.innerHTML = "";
    right.appendChild(frag);

    right.dataset.tirMetaRel = window.location.pathname;
    return true;
  }

  // ---------------- Generic page meta (TitleRegion) helpers ----------------

  private findMetaContainer(): HTMLElement | null {
    const scope =
      (document.querySelector('[data-automation-id="TitleRegion"]') as HTMLElement | null) ||
      document.body;

    const spans = Array.from(scope.querySelectorAll("span")) as HTMLSpanElement[];
    const readSpan = spans.find(s => /min read|read\b/i.test((s.textContent || "").trim()));
    if (!readSpan) return null;

    let container: HTMLElement | null = readSpan.parentElement as HTMLElement | null;
    for (let i = 0; i < 7 && container; i++) {
      const t = (container.textContent || "").toLowerCase();
      if (t.includes("read") && t.includes("view") && t.includes("•")) return container;
      container = container.parentElement as HTMLElement | null;
    }
    return null;
  }

  private async apply(): Promise<void> {

    if (await this.applyNewsDetailsMeta()) return;
    const container = this.findMetaContainer();
    if (!container) return;
    if (container.dataset.tirMetaRel === window.location.pathname) return;

    const children = Array.from(container.children) as HTMLElement[];
    const items = children.filter(el => {
      const txt = (el.textContent || "").trim();
      return txt !== "" && txt !== "•";
    });
    if (items.length < 3) return;

    const readNode = items.find(n => /min read|read\b/i.test((n.textContent || "").trim())) || null;
    const viewsNode = items.find(n => /view/i.test((n.textContent || "").trim())) || null;
    const dateNode = items.find(n => n !== readNode && n !== viewsNode) || null;

    if (!readNode || !viewsNode || !dateNode) return;

    const created = await this.getCurrentPageCreated();
    if (created) dateNode.textContent = this.formatRelativeTime(created);

    const sepTemplate = children.find(el => (el.textContent || "").trim() === "•") as HTMLElement | undefined;
    const makeSep = (): HTMLElement => {
      if (sepTemplate) return sepTemplate.cloneNode(true) as HTMLElement;
      const s = document.createElement("span");
      s.textContent = "•";
      s.setAttribute("aria-hidden", "true");
      s.style.margin = "0 10px";
      return s;
    };

    container.innerHTML = "";
    container.appendChild(dateNode);
    container.appendChild(makeSep());
    container.appendChild(readNode);
    container.appendChild(makeSep());
    container.appendChild(viewsNode);

    container.dataset.tirMetaRel = window.location.pathname;
  }
}
