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
  extraRightText?: string; // e.g., "5 years"
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

const PeopleSimpleFeed: React.FC<PeopleSimpleFeedProps> = ({ items, webAbsoluteUrl, emptyText, renderCta }) => {
  if (!items || items.length === 0) {
    return <div className={s.empty}>{emptyText || "No records found."}</div>;
  }

  return (
    <div className={s.list}>
      {items.map((p: IPersonBase) => {
        const name = (p.firstName + " " + p.lastName).trim();
        return (
          <article key={p.id} className={s.row}>
            <div className={s.avatarCol}>
              <img className={s.avatar} src={resolveImg(p.imageUrl, webAbsoluteUrl)} alt={name || "profile"} />
            </div>

            <div className={s.mainCol}>
              <div className={s.name}>{name}</div>
              <div className={s.sub}>
                {(p.designation ? p.designation : "") + (p.department ? " • " + p.department : "")}
              </div>

              {p.extraRightText ? <div className={s.meta}>{p.extraRightText}</div> : null}
            </div>

            <div className={s.ctaCol}>
              {renderCta
                ? renderCta(p)
                : (p.wishLink
                  ? <a className={s.wishBtn}
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
