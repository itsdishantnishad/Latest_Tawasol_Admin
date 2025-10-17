// import * as React from "react";
// import styles from "../styles/MoreForYou.module.scss";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// import { spfi, SPFI } from "@pnp/sp";
// import { SPFx as spSPFx } from "@pnp/sp/behaviors/spfx";
// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/content-types";
// import { resolveDeptNoteInternalName } from "./utils/resolveDeptNote";
// import type { IMoreForYouItem } from "../models/IMoreForYouItem";
// /* ───────────────────── Utilities & UI helpers ───────────────────── */
// export interface IMoreForYouProps {
//   context: any;
//   take?: number;
//   randomizeAcrossDepartment?: boolean;
// }
// const normalizeCategory = (cat: any): string => {
//   if (!cat) return "";
//   if (typeof cat === "string") return cat;
//   if (Array.isArray(cat)) return (cat[0]?.Label || (cat[0] as any) || "").toString();
//   if (typeof cat === "object" && "Label" in cat) return ((cat as any).Label || "").toString();
//   return String(cat);
// };
// const formatReadTime = (mins?: number) => {
//   if (!mins || mins <= 0) return "1 min read";
//   if (mins < 60) return `${mins} min read`;
//   const h = Math.floor((mins as number) / 60);
//   const m = (mins as number) % 60;
//   return m ? `${h} hr ${m} min read` : `${h} hr read`;
// };
// const timeAgo = (iso?: string) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   const diff = (Date.now() - d.getTime()) / 1000;
//   const h = Math.floor(diff / 3600);
//   if (h < 1) return "just now";
//   if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
//   const days = Math.floor(h / 24);
//   return `${days} day${days > 1 ? "s" : ""} ago`;
// };
// // ES2015-safe (no matchAll)
// const decodeHtml = (s: string) =>
//   s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
// const getControlJsonBlobs = (decodedHtml: string): string[] => {
//   const blobs: string[] = [];
//   const re = /data-sp-controldata="({.+?})"/g;
//   let m: RegExpExecArray | null;
//   while ((m = re.exec(decodedHtml)) !== null) blobs.push(m[1]);
//   return blobs;
// };
// const getBestImage = (it: any): string => {
//   if (it?.BannerImageUrl) return it.BannerImageUrl;
//   const html: string = it?.CanvasContent1 || "";
//   if (html) {
//     const decoded = decodeHtml(html);
//     const blobs = getControlJsonBlobs(decoded);
//     for (const json of blobs) {
//       try {
//         const ctrl = JSON.parse(json);
//         // Modern Image web part path
//         const imgMap = ctrl?.webPartData?.serverProcessedContent?.imageSources;
//         if (imgMap) {
//           const values = Object.keys(imgMap).map((k) => (imgMap as any)[k]);
//           const first = values.find((u: any) => typeof u === "string" && /^https?:\/\//i.test(u));
//           if (first) return first as string;
//         }
//         // Older props
//         const props = ctrl?.webPartData ? ctrl.webPartData.properties || {} : {};
//         const candidates = [
//           (props as any).imgSrc,
//           (props as any).imageSource && (props as any).imageSource.src,
//           (props as any).src,
//           (props as any).linkUrl,
//         ].filter(Boolean) as string[];
//         const found = candidates.find((u) => /^https?:\/\//i.test(u));
//         if (found) return found;
//       } catch { /* continue */ }
//     }
//   }
//   return "/_layouts/15/images/sitepagethumbnail.png";
// };
// /** News CT id: prefer exact “New News Article”, else any “News*” */
// async function getNewsContentTypeId(sp: SPFI): Promise<string | null> {
//   try {
//     const cts = await sp.web.lists.getByTitle("Site Pages").contentTypes.select("Name,StringId")();
//     const exact = cts.find((c: any) => c.Name === "New News Article");
//     if (exact) return exact.StringId;
//     const anyNews = cts.find((c: any) => /news/i.test(c.Name));
//     return anyNews ? anyNews.StringId : null;
//   } catch {
//     return null;
//   }
// }
// /** Department label (hidden note mirror first, then taxonomy Label) */
// const getDeptLabel = (it: any, noteInternalName?: string | null): string => {
//   const key = noteInternalName ?? undefined;
//   const fromNoteRaw = key ? (it?.[key] ?? "") : "";
//   const fromNote = typeof fromNoteRaw === "string" ? fromNoteRaw.trim() : String(fromNoteRaw ?? "");
//   if (fromNote) {
//     const first = fromNote.split("|")[0].trim();
//     if (first) return first;
//   }
//   const tax = it?.NADepartment;
//   if (tax) {
//     if (typeof tax === "string") return (tax.split("|")[0] || "").trim();
//     if (typeof tax === "object" && "Label" in tax) {
//       const lbl = (tax as any).Label;
//       const wss = String((tax as any).WssId ?? "");
//       if (lbl && String(lbl).trim() && String(lbl).trim() !== wss) return String(lbl).trim();
//     }
//   }
//   return "";
// };
// /* ───── category & department icons (your Figma SVGs) ───── */
// const AnnouncementIcon: string = require("../assets/Announcement.svg");
// const AroundTheWorldIcon: string = require("../assets/ArroundTheWorld.svg"); // keep filename
// const DHREStoriesIcon: string = require("../assets/DHREStoriesCheck.svg");
// const DeptPeopleIcon: string = require("../assets/HumanCapital.svg");
// const getCategoryIcon = (category: string): string | null => {
//   const key = (category || "").toLowerCase();
//   if (key.includes("announcement")) return AnnouncementIcon;
//   if (key.includes("around")) return AroundTheWorldIcon;
//   if (key.includes("dhre")) return DHREStoriesIcon;
//   return null; // unknown → no badge
// };
// /* ─────────────────── OOTB views (Search API + light fallback) ─────────────────── */
// async function getOotbViews(context: any, fileRef?: string, itemId?: number): Promise<number | undefined> {
//   const siteUrl: string = context.pageContext.web.absoluteUrl.replace(/\/$/, "");
//   const absoluteUrl = fileRef
//     ? (fileRef.startsWith("http") ? fileRef : new URL(fileRef, siteUrl).toString())
//     : undefined;
//   if (absoluteUrl) {
//     const select = encodeURIComponent("ViewsLifeTime,ViewsRecent,Popularity,Path,Title");
//     const qtext = encodeURIComponent(`path:"${absoluteUrl.replace(/"/g, '\\"')}"`);
//     const url = `${siteUrl}/_api/search/query?querytext='${qtext}'&selectproperties='${select}'&rowlimit=1`;
//     console.log("[MFY][Views:Search] GET:", url);
//     try {
//       const res = await fetch(url, { headers: { accept: "application/json;odata=nometadata" } });
//       if (res.ok) {
//         const json: any = await res.json();
//         const rows = json?.PrimaryQueryResult?.RelevantResults?.Table?.Rows || [];
//         if (rows.length) {
//           const cells: any[] = rows[0].Cells || [];
//           const map: Record<string, any> = {};
//           cells.forEach(c => (map[c.Key] = c.Value));
//           const life = map["ViewsLifeTime"];
//           const recent = map["ViewsRecent"];
//           const pop = map["Popularity"];
//           const picked =
//             (life != null ? Number(life) : undefined) ??
//             (recent != null ? Number(recent) : undefined) ??
//             (pop != null ? Number(pop) : undefined);
//           const views = Number.isFinite(picked) ? Math.round(Number(picked)) : undefined;
//           console.log("[MFY][Views:Search] for", absoluteUrl, { life, recent, pop, chosen: views });
//           if (typeof views === "number") return views;
//         }
//       } else {
//         console.warn("[MFY][Views:Search] HTTP", res.status, res.statusText);
//       }
//     } catch (e) {
//       console.warn("[MFY][Views:Search] Failed:", e);
//     }
//   }
//   // Fallback: /sitepages/pages/GetById(id)/Analytics if available (may not exist on all tenants)
//   if (typeof itemId === "number") {
//     try {
//       const r = await fetch(
//         `${siteUrl}/_api/sitepages/pages/GetById(${itemId})/Analytics`,
//         { headers: { accept: "application/json;odata=nometadata" } }
//       );
//       if (r.ok) {
//         const j: any = await r.json();
//         const v =
//           j?.ViewsLifeTime ?? j?.ViewsRecent ?? j?.UniquePageViewsLifeTime ?? j?.UniquePageViewsRecent;
//         const n = Number(v);
//         if (Number.isFinite(n)) return n;
//       }
//     } catch { /* ignore */ }
//   }
//   return undefined;
// }
// /* ───────────────────────── Component ───────────────────────── */
// const MoreForYou: React.FC<IMoreForYouProps> = ({
//   context,
//   take = 4,
//   randomizeAcrossDepartment = true,
// }) => {
//   const [items, setItems] = React.useState<IMoreForYouItem[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [deptNoteName, setDeptNoteName] = React.useState<string | null>(null);
//   const sp: SPFI = React.useMemo(() => spfi().using(spSPFx(context)), [context]);
//   const safeGo = (it: IMoreForYouItem) => {
//     const url =
//       (typeof (it as any).FileRef === "string" && (it as any).FileRef) ||
//       (it as any)?.File?.ServerRelativeUrl ||
//       (it as any)?.File?.ServerRelativePath?.DecodedUrl ||
//       "";
//     if (url) window.location.href = url;
//   };
//   React.useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const listTitle = "Site Pages";
//         const currentId: number | undefined = context?.pageContext?.listItem?.id;
//         const newsCtId = await getNewsContentTypeId(sp);
//         // resolve hidden text internal name for NADepartment (same approach as simple list)
//         const noteInternal = await resolveDeptNoteInternalName(sp, listTitle);
//         setDeptNoteName(noteInternal);
//         // current page dept (for scoping results)
//         let currentDeptLabel = "";
//         if (currentId) {
//           const me = await sp.web.lists
//             .getByTitle(listTitle)
//             .items.getById(currentId)
//             .select("Id", "Title", "NADepartment", noteInternal || "Id")();
//           currentDeptLabel = getDeptLabel(me, noteInternal).toLowerCase();
//         }
//         const selectBase: string[] = [
//           "Id",
//           "Title",
//           "FileRef",
//           "BannerImageUrl",
//           "CanvasContent1",
//           "NADepartment",
//           "NACategory",
//           "NAHashtags",
//           "NAReadTimeMinutes",
//           "Modified",
//           "Created",
//           "FirstPublishedDate",
//         ];
//         if (noteInternal) selectBase.push(noteInternal);
//         const filters: string[] = [];
//         if (newsCtId) filters.push(`startswith(ContentTypeId,'${newsCtId}')`);
//         else filters.push(`PromotedState eq 2`);
//         if (currentId) filters.push(`Id ne ${currentId}`);
//         const filter = filters.join(" and ");
//         const list = (await (sp.web.lists
//           .getByTitle("Site Pages")
//           .items.top(120)
//           .orderBy("Modified", false)
//           .select(...selectBase)
//           .filter(filter) as any)()) as IMoreForYouItem[];
//         let pool = list || [];
//         if (randomizeAcrossDepartment && currentDeptLabel) {
//           pool = pool.filter(
//             (it) => getDeptLabel(it, noteInternal).toLowerCase() === currentDeptLabel
//           );
//         }
//         const chosen = [...pool].sort(() => Math.random() - 0.5).slice(0, take);
//         const withViews = await Promise.all(
//           chosen.map(async (it) => {
//             const fileRef = (it as any).FileRef as string | undefined;
//             const views = await getOotbViews(context, fileRef, it.Id);
//             console.log("[MFY] Views for", it.Title, "→", views);
//             return { ...it, _Views: typeof views === "number" ? views : undefined };
//           })
//         );
//         setItems(withViews);
//       } catch (e) {
//         console.error("❌ MoreForYou load failed", e);
//         setItems([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [sp, take, randomizeAcrossDepartment, context]);
//   if (loading) return <div>Loading…</div>;
//   if (!items.length) return <div>No recommendations found.</div>;
//   return (
//     <div className={styles.wrapper}>
//       <h3 className={styles.heading}>More for you</h3>
//       <div className={styles.grid}>
//         {items.map((it) => {
//           const category = normalizeCategory(it.NACategory);
//           const published = it.FirstPublishedDate || it.Modified || it.Created || "";
//           const img = getBestImage(it);
//           const dept = getDeptLabel(it, deptNoteName);
//           const catIcon = getCategoryIcon(category);
//           return (
//             <article
//               key={it.Id}
//               className={styles.card}
//               onClick={() => safeGo(it)}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === "Enter" && safeGo(it)}
//             >
//               <div className={styles.imageWrap}>
//                 <img src={img} alt={it.Title} loading="lazy" />
//                 {catIcon && (
//                   <span className={styles.catBadge} aria-hidden="true">
//                     <img src={catIcon} alt={category} />
//                   </span>
//                 )}
//                 <div className={styles.fadeTop}></div>
//                 <div className={styles.fadeBottom}></div>
//               </div>
//               <div className={styles.contentOverlay}>
//                 <div className={styles.title}>{it.Title}</div>
//                 {/* Meta line: left = department chip, right = time/read/views */}
//                 <div className={styles.metaRow}>
//                   <div>
//                     {!!dept && (
//                       <span className={`${styles.metaItem} ${styles.dept}`}>
//                         <img src={DeptPeopleIcon} alt="Department" />
//                         {dept}
//                       </span>
//                     )}
//                   </div>
//                   <div className={`${styles.metaItem} ${styles.right}`}>
//                     {published && <span>{timeAgo(published)}</span>}
//                     <span className={styles.dotIcon}>•</span>
//                     <span>{formatReadTime(it.NAReadTimeMinutes)}</span>
//                     {typeof (it as any)._Views === "number" && (
//                       <>
//                         <span className={styles.dotIcon}>•</span>
//                         <span>{(it as any)._Views.toLocaleString()} Views</span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </article>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
// export default MoreForYou;
import * as React from "react";
import styles from "../styles/MoreForYou.module.scss";
import { spfi } from "@pnp/sp";
import { SPFx as spSPFx } from "@pnp/sp/behaviors/spfx";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/content-types";
import { SPHttpClient } from "@microsoft/sp-http";
import { resolveDeptNoteInternalName } from "./utils/resolveDeptNote";
var normalizeCategory = function (cat) {
    var _a;
    if (!cat)
        return "";
    if (typeof cat === "string")
        return cat;
    if (Array.isArray(cat))
        return (((_a = cat[0]) === null || _a === void 0 ? void 0 : _a.Label) || cat[0] || "").toString();
    if (typeof cat === "object" && "Label" in cat)
        return (cat.Label || "").toString();
    return String(cat);
};
var formatReadTime = function (mins) {
    if (!mins || mins <= 0)
        return "1 min read";
    if (mins < 60)
        return "".concat(mins, " min read");
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return m ? "".concat(h, " hr ").concat(m, " min read") : "".concat(h, " hr read");
};
var timeAgo = function (iso) {
    if (!iso)
        return "";
    var d = new Date(iso);
    var diff = (Date.now() - d.getTime()) / 1000;
    var h = Math.floor(diff / 3600);
    if (h < 1)
        return "just now";
    if (h < 24)
        return "".concat(h, " hour").concat(h > 1 ? "s" : "", " ago");
    var days = Math.floor(h / 24);
    return "".concat(days, " day").concat(days > 1 ? "s" : "", " ago");
};
// ES2015-safe (no matchAll)
var decodeHtml = function (s) {
    return s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
};
var getControlJsonBlobs = function (decodedHtml) {
    var blobs = [];
    var re = /data-sp-controldata="({.+?})"/g;
    var m;
    while ((m = re.exec(decodedHtml)) !== null)
        blobs.push(m[1]);
    return blobs;
};
var getBestImage = function (it) {
    var _a, _b;
    if (it === null || it === void 0 ? void 0 : it.BannerImageUrl)
        return it.BannerImageUrl;
    var html = (it === null || it === void 0 ? void 0 : it.CanvasContent1) || "";
    if (html) {
        var decoded = decodeHtml(html);
        var blobs = getControlJsonBlobs(decoded);
        var _loop_1 = function (json) {
            try {
                var ctrl = JSON.parse(json);
                // Modern Image web part path
                var imgMap_1 = (_b = (_a = ctrl === null || ctrl === void 0 ? void 0 : ctrl.webPartData) === null || _a === void 0 ? void 0 : _a.serverProcessedContent) === null || _b === void 0 ? void 0 : _b.imageSources;
                if (imgMap_1) {
                    var values = Object.keys(imgMap_1).map(function (k) { return imgMap_1[k]; });
                    var first = values.find(function (u) { return typeof u === "string" && /^https?:\/\//i.test(u); });
                    if (first)
                        return { value: first };
                }
                // Older props
                var props = (ctrl === null || ctrl === void 0 ? void 0 : ctrl.webPartData) ? ctrl.webPartData.properties || {} : {};
                var candidates = [
                    props.imgSrc,
                    props.imageSource && props.imageSource.src,
                    props.src,
                    props.linkUrl,
                ].filter(Boolean);
                var found = candidates.find(function (u) { return /^https?:\/\//i.test(u); });
                if (found)
                    return { value: found };
            }
            catch (_c) {
                /* continue */
            }
        };
        for (var _i = 0, blobs_1 = blobs; _i < blobs_1.length; _i++) {
            var json = blobs_1[_i];
            var state_1 = _loop_1(json);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    }
    return "/_layouts/15/images/sitepagethumbnail.png";
};
/** News CT id: prefer exact “New News Article”, else any “News*” */
function getNewsContentTypeId(sp) {
    return __awaiter(this, void 0, void 0, function () {
        var cts, exact, anyNews, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, sp.web.lists.getByTitle("Site Pages").contentTypes.select("Name,StringId")()];
                case 1:
                    cts = _b.sent();
                    exact = cts.find(function (c) { return c.Name === "New News Article"; });
                    if (exact)
                        return [2 /*return*/, exact.StringId];
                    anyNews = cts.find(function (c) { return /news/i.test(c.Name); });
                    return [2 /*return*/, anyNews ? anyNews.StringId : null];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/** Department label (hidden note mirror first, then taxonomy Label) */
var getDeptLabel = function (it, noteInternalName) {
    var _a, _b;
    var key = noteInternalName !== null && noteInternalName !== void 0 ? noteInternalName : undefined;
    var fromNoteRaw = key ? ((_a = it === null || it === void 0 ? void 0 : it[key]) !== null && _a !== void 0 ? _a : "") : "";
    var fromNote = typeof fromNoteRaw === "string" ? fromNoteRaw.trim() : String(fromNoteRaw !== null && fromNoteRaw !== void 0 ? fromNoteRaw : "");
    if (fromNote) {
        var first = fromNote.split("|")[0].trim();
        if (first)
            return first;
    }
    var tax = it === null || it === void 0 ? void 0 : it.NADepartment;
    if (tax) {
        if (typeof tax === "string")
            return (tax.split("|")[0] || "").trim();
        if (typeof tax === "object" && "Label" in tax) {
            var lbl = tax.Label;
            var wss = String((_b = tax.WssId) !== null && _b !== void 0 ? _b : "");
            if (lbl && String(lbl).trim() && String(lbl).trim() !== wss)
                return String(lbl).trim();
        }
    }
    return "";
};
/* ───── category & department icons (your Figma SVGs) ───── */
var AnnouncementIcon = require("../assets/Announcement.svg");
var AroundTheWorldIcon = require("../assets/ArroundTheWorld.svg"); // keep filename
var DHREStoriesIcon = require("../assets/DHREStoriesCheck.svg");
var DeptPeopleIcon = require("../assets/HumanCapital.svg");
var getCategoryIcon = function (category) {
    var key = (category || "").toLowerCase();
    if (key.includes("announcement"))
        return AnnouncementIcon;
    if (key.includes("around"))
        return AroundTheWorldIcon;
    if (key.includes("dhre"))
        return DHREStoriesIcon;
    return null; // unknown → no badge
};
/* ─────────────────── OOTB views (multi-strategy, with Search fallback) ─────────────────── */
function getOotbViews(context, itemId, serverRelUrl) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function () {
        var webUrl, r, j, v, n, e_1, r2, j2, v2, n2, e_2, path, enc, url, r3, j3, rows, cells_1, get, n, e_3;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, context.spHttpClient.get("".concat(webUrl, "/_api/sitepages/pages/GetById(").concat(itemId, ")/Analytics"), SPHttpClient.configurations.v1)];
                case 2:
                    r = _h.sent();
                    if (!r.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, r.json()];
                case 3:
                    j = _h.sent();
                    v = (_c = (_b = (_a = j === null || j === void 0 ? void 0 : j.ViewsLifeTime) !== null && _a !== void 0 ? _a : j === null || j === void 0 ? void 0 : j.ViewsRecent) !== null && _b !== void 0 ? _b : j === null || j === void 0 ? void 0 : j.UniquePageViewsLifeTime) !== null && _c !== void 0 ? _c : j === null || j === void 0 ? void 0 : j.UniquePageViewsRecent;
                    n = Number(v);
                    if (Number.isFinite(n)) {
                        console.log("[MFY][Views] Analytics:", n, { itemId: itemId });
                        return [2 /*return*/, n];
                    }
                    _h.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_1 = _h.sent();
                    console.log("[MFY][Views] Analytics fail (ok to ignore):", e_1);
                    return [3 /*break*/, 6];
                case 6:
                    _h.trys.push([6, 10, , 11]);
                    return [4 /*yield*/, context.spHttpClient.get("".concat(webUrl, "/_api/web/lists/getByTitle('Site Pages')/items(").concat(itemId, ")?$select=PageViewCount"), SPHttpClient.configurations.v1)];
                case 7:
                    r2 = _h.sent();
                    if (!r2.ok) return [3 /*break*/, 9];
                    return [4 /*yield*/, r2.json()];
                case 8:
                    j2 = _h.sent();
                    v2 = j2 === null || j2 === void 0 ? void 0 : j2.PageViewCount;
                    n2 = Number(v2);
                    if (Number.isFinite(n2)) {
                        console.log("[MFY][Views] List field PageViewCount:", n2, { itemId: itemId });
                        return [2 /*return*/, n2];
                    }
                    _h.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    e_2 = _h.sent();
                    console.log("[MFY][Views] List field fail (ok to ignore):", e_2);
                    return [3 /*break*/, 11];
                case 11:
                    _h.trys.push([11, 15, , 16]);
                    path = serverRelUrl || "";
                    if (!path) return [3 /*break*/, 14];
                    enc = encodeURIComponent("path:\"".concat(path, "\""));
                    url = "".concat(webUrl, "/_api/search/query?querytext='").concat(enc, "'&selectproperties='ViewsLifeTime,ViewsRecent,UniqueViews,HitHighlightedSummary'&rowlimit=1");
                    return [4 /*yield*/, context.spHttpClient.get(url, SPHttpClient.configurations.v1)];
                case 12:
                    r3 = _h.sent();
                    if (!r3.ok) return [3 /*break*/, 14];
                    return [4 /*yield*/, r3.json()];
                case 13:
                    j3 = _h.sent();
                    rows = ((_f = (_e = (_d = j3 === null || j3 === void 0 ? void 0 : j3.PrimaryQueryResult) === null || _d === void 0 ? void 0 : _d.RelevantResults) === null || _e === void 0 ? void 0 : _e.Table) === null || _f === void 0 ? void 0 : _f.Rows) || [];
                    cells_1 = ((_g = rows[0]) === null || _g === void 0 ? void 0 : _g.Cells) || [];
                    get = function (k) { var _a; return (_a = cells_1.find(function (c) { return c.Key === k; })) === null || _a === void 0 ? void 0 : _a.Value; };
                    n = Number(get("ViewsLifeTime")) ||
                        Number(get("ViewsRecent")) ||
                        Number(get("UniqueViews"));
                    if (Number.isFinite(n)) {
                        console.log("[MFY][Views] Search fallback:", n, { itemId: itemId, path: path });
                        return [2 /*return*/, n];
                    }
                    _h.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    e_3 = _h.sent();
                    console.log("[MFY][Views] Search fallback fail (ok to ignore):", e_3);
                    return [3 /*break*/, 16];
                case 16:
                    console.log("[MFY][Views] No view data for item", itemId, serverRelUrl);
                    return [2 /*return*/, null];
            }
        });
    });
}
/* ───────────────────────── Component ───────────────────────── */
var MoreForYou = function (_a) {
    var context = _a.context, _b = _a.take, take = _b === void 0 ? 4 : _b, _c = _a.randomizeAcrossDepartment, randomizeAcrossDepartment = _c === void 0 ? true : _c;
    var _d = React.useState([]), items = _d[0], setItems = _d[1];
    var _e = React.useState(true), loading = _e[0], setLoading = _e[1];
    var _f = React.useState(null), deptNoteName = _f[0], setDeptNoteName = _f[1];
    var sp = React.useMemo(function () { return spfi().using(spSPFx(context)); }, [context]);
    var safeGo = function (it) {
        var _a, _b, _c;
        var url = (typeof it.FileRef === "string" && it.FileRef) ||
            ((_a = it === null || it === void 0 ? void 0 : it.File) === null || _a === void 0 ? void 0 : _a.ServerRelativeUrl) ||
            ((_c = (_b = it === null || it === void 0 ? void 0 : it.File) === null || _b === void 0 ? void 0 : _b.ServerRelativePath) === null || _c === void 0 ? void 0 : _c.DecodedUrl) ||
            "";
        if (url)
            window.location.href = url;
    };
    React.useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var listTitle, currentId, newsCtId, noteInternal_1, currentDeptLabel_1, me, selectBase, filters, filter, list, pool, chosen, withViews, e_4;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        setLoading(true);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        listTitle = "Site Pages";
                        currentId = (_c = (_b = context === null || context === void 0 ? void 0 : context.pageContext) === null || _b === void 0 ? void 0 : _b.listItem) === null || _c === void 0 ? void 0 : _c.id;
                        return [4 /*yield*/, getNewsContentTypeId(sp)];
                    case 2:
                        newsCtId = _d.sent();
                        return [4 /*yield*/, resolveDeptNoteInternalName(sp, listTitle)];
                    case 3:
                        noteInternal_1 = _d.sent();
                        setDeptNoteName(noteInternal_1);
                        currentDeptLabel_1 = "";
                        if (!currentId) return [3 /*break*/, 5];
                        return [4 /*yield*/, sp.web.lists
                                .getByTitle(listTitle)
                                .items.getById(currentId)
                                .select("Id", "Title", "NADepartment", noteInternal_1 || "Id")()];
                    case 4:
                        me = _d.sent();
                        currentDeptLabel_1 = getDeptLabel(me, noteInternal_1).toLowerCase();
                        _d.label = 5;
                    case 5:
                        selectBase = [
                            "Id",
                            "Title",
                            "FileRef",
                            "BannerImageUrl",
                            "CanvasContent1",
                            "NADepartment",
                            "NACategory",
                            "NAHashtags",
                            "NAReadTimeMinutes",
                            "Modified",
                            "Created",
                            "FirstPublishedDate",
                        ];
                        if (noteInternal_1)
                            selectBase.push(noteInternal_1);
                        filters = [];
                        if (newsCtId)
                            filters.push("startswith(ContentTypeId,'".concat(newsCtId, "')"));
                        else
                            filters.push("PromotedState eq 2");
                        if (currentId)
                            filters.push("Id ne ".concat(currentId));
                        filter = filters.join(" and ");
                        return [4 /*yield*/, (_a = sp.web.lists
                                .getByTitle("Site Pages")
                                .items.top(120)
                                .orderBy("Modified", false))
                                .select.apply(_a, selectBase).filter(filter)()];
                    case 6:
                        list = (_d.sent());
                        pool = list || [];
                        if (randomizeAcrossDepartment && currentDeptLabel_1) {
                            pool = pool.filter(function (it) { return getDeptLabel(it, noteInternal_1).toLowerCase() === currentDeptLabel_1; });
                        }
                        chosen = __spreadArray([], pool, true).sort(function () { return Math.random() - 0.5; }).slice(0, take);
                        return [4 /*yield*/, Promise.all(chosen.map(function (it) { return __awaiter(void 0, void 0, void 0, function () {
                                var fileRef, views;
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            fileRef = it.FileRef ||
                                                ((_a = it === null || it === void 0 ? void 0 : it.File) === null || _a === void 0 ? void 0 : _a.ServerRelativeUrl) ||
                                                ((_c = (_b = it === null || it === void 0 ? void 0 : it.File) === null || _b === void 0 ? void 0 : _b.ServerRelativePath) === null || _c === void 0 ? void 0 : _c.DecodedUrl) ||
                                                "";
                                            return [4 /*yield*/, getOotbViews(context, it.Id, fileRef)];
                                        case 1:
                                            views = _d.sent();
                                            return [2 /*return*/, __assign(__assign({}, it), { _Views: Number.isFinite(Number(views)) ? Number(views) : undefined })];
                                    }
                                });
                            }); }))];
                    case 7:
                        withViews = _d.sent();
                        setItems(withViews);
                        return [3 /*break*/, 10];
                    case 8:
                        e_4 = _d.sent();
                        console.error("❌ MoreForYou load failed", e_4);
                        setItems([]);
                        return [3 /*break*/, 10];
                    case 9:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        }); })();
    }, [sp, take, randomizeAcrossDepartment, context]);
    if (loading)
        return React.createElement("div", null, "Loading\u2026");
    if (!items.length)
        return React.createElement("div", null, "No recommendations found.");
    return (React.createElement("div", { className: styles.wrapper },
        React.createElement("h3", { className: styles.heading }, "More for you"),
        React.createElement("div", { className: styles.grid }, items.map(function (it) {
            var category = normalizeCategory(it.NACategory);
            var published = it.FirstPublishedDate || it.Modified || it.Created || "";
            var img = getBestImage(it);
            var dept = String(getDeptLabel(it, deptNoteName) || "");
            var catIcon = getCategoryIcon(category);
            return (React.createElement("article", { key: it.Id, className: styles.card, onClick: function () { return safeGo(it); }, role: "button", tabIndex: 0, onKeyDown: function (e) { return e.key === "Enter" && safeGo(it); } },
                React.createElement("div", { className: styles.imageWrap },
                    React.createElement("img", { src: img, alt: it.Title, loading: "lazy" }),
                    catIcon && (React.createElement("span", { className: styles.catBadge, "aria-hidden": "true" },
                        React.createElement("img", { src: catIcon, alt: category }))),
                    React.createElement("div", { className: styles.fadeTop }),
                    React.createElement("div", { className: styles.fadeBottom })),
                React.createElement("div", { className: styles.contentOverlay },
                    React.createElement("div", { className: styles.title }, it.Title),
                    React.createElement("div", { className: styles.metaRow },
                        React.createElement("div", null, !!dept && (React.createElement("span", { className: "".concat(styles.metaItem, " ").concat(styles.dept) },
                            React.createElement("img", { src: DeptPeopleIcon, alt: "Department" }),
                            dept))),
                        React.createElement("div", { className: "".concat(styles.metaItem, " ").concat(styles.right) },
                            published && React.createElement("span", null, timeAgo(published)),
                            React.createElement("span", { className: styles.dotIcon }, "\u2022"),
                            React.createElement("span", null, formatReadTime(it.NAReadTimeMinutes)),
                            typeof it._Views === "number" && (React.createElement(React.Fragment, null,
                                React.createElement("span", { className: styles.dotIcon }, "\u2022"),
                                React.createElement("span", null,
                                    it._Views.toLocaleString(),
                                    " Views"))))))));
        }))));
};
export default MoreForYou;
//# sourceMappingURL=MoreForYou.js.map