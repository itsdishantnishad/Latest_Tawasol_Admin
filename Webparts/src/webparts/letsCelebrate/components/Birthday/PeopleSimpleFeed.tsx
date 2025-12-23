import * as React from "react";
import s from "./PeopleSimpleFeed.module.scss";

export interface IPersonBase {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  imageUrl: string;
  date?: string;
  wishLink?: string;
  extraRightText?: string; // e.g., "2nd Anniversary"
}

export interface PeopleSimpleFeedProps {
  items: IPersonBase[];
  webAbsoluteUrl?: string;
  emptyText?: string;

  /* fully control the CTA cell */
  renderCta?: (item: IPersonBase) => React.ReactNode;
}

/* ES5-safe resolver (no startsWith) */
const resolveImg = (raw?: string, web?: string) => {
  if (!raw) return "";
  const u: string = (raw + "").trim();

  // data url (base64)
  if (/^data:image\//i.test(u)) return u;

  // absolute http(s)
  if (/^https?:\/\//i.test(u)) return u;

  // server-relative (/sites/...)
  if (u.length > 0 && u[0] === "/") {
    var origin = (typeof window !== "undefined" && window.location && window.location.origin) || "";
    return origin + u;
  }

  // web-relative ("SiteAssets/...")
  const base = (web || "").replace(/\/$/, "");
  return base ? (base + "/" + u.replace(/^\//, "")) : u;
};

const BORDER_COUNT = 6;

const hashIndex = (key: string, mod: number): number => {
  const str = (key || "").toString();
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0; // 32-bit
  }
  const n = Math.abs(h);
  return mod ? (n % mod) : 0;
};

const parseOrdinal = (text: string): { num: string; suf: string; word: string } => {
  const t = (text || "").trim();
  const parts = t.split(/\s+/);
  const first = parts[0] || "";
  const word = parts.slice(1).join(" ");

  const m = first.match(/^(\d+)(st|nd|rd|th)$/i);
  if (m) return { num: m[1], suf: m[2], word: word || "Anniversary" };

  // fallback (if API ever gives "2 Anniversary" etc.)
  return { num: first, suf: "", word: word || "Anniversary" };
};

const PeopleSimpleFeed: React.FC<PeopleSimpleFeedProps> = ({ items, webAbsoluteUrl, emptyText, renderCta }) => {
  if (!items || items.length === 0) {
    return <div className={s.empty}>{emptyText || "No records found."}</div>;
  }

  return (
    <div className={s.list}>
      {items.map((p: IPersonBase) => {
        const name = (p.firstName + " " + p.lastName).trim();

        // avatar border color class (stable per person id)
        const idx = hashIndex(p.id || name, BORDER_COUNT);
        const borderClass = (s as any)[`border${idx}`] || "";

        // show left anniversary block only when text contains "Anniversary"
        const isAnniversary = !!(p.extraRightText && /anniversary/i.test(p.extraRightText));
        const left = isAnniversary ? parseOrdinal(p.extraRightText || "") : null;

        return (
          <article key={p.id} className={s.row + (isAnniversary ? " " + s.rowWithLeft : "")}>
            {isAnniversary && left ? (
              <div className={s.leftCol} aria-label={p.extraRightText}>
                <div className={s.annivTop}>
                  <span className={s.annivNum}>{left.num}</span>
                  {left.suf ? <span className={s.annivSuffix}>{left.suf}</span> : null}
                </div>
                <div className={s.annivWord}>{left.word}</div>
              </div>
            ) : null}

            <div className={s.avatarCol}>
              <img
                className={s.avatar + " " + borderClass}
                src={resolveImg(p.imageUrl, webAbsoluteUrl)}
                alt={name || "profile"}
              />
            </div>

            <div className={s.mainCol}>
              <div className={s.name}>{name}</div>
              <div className={s.sub}>
                {(p.designation ? p.designation : "") + (p.department ? " • " + p.department : "")}
              </div>

              {/* keep meta ONLY for non-anniversary use-cases */}
              {!isAnniversary && p.extraRightText ? <div className={s.meta}>{p.extraRightText}</div> : null}
            </div>

            <div className={s.ctaCol}>
              {renderCta
                ? renderCta(p)
                : (p.wishLink
                  ? <a
                      className={s.wishBtn}
                      target="_blank"
                      data-interception="off"
                      href={p.wishLink}
                      rel="noreferrer"
                    >
                      <span aria-hidden="true">🎉</span>&nbsp; Wish Now
                    </a>
                  : null)}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default PeopleSimpleFeed;
