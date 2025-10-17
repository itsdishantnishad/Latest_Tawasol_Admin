// import * as React from "react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import type { WebPartContext } from "@microsoft/sp-webpart-base";
// import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
// import styles from "../styles/NewsPage.module.scss";
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
// /* ───────────────── types ───────────────── */
// type Props = { spfxContext: WebPartContext; siteUrl: string };
// type Person = { Title?: string; EMail?: string; Name?: string };
// type Item = {
//   Id: number;
//   Title: string;
//   FileRef: string;
//   Created: string;
//   Modified: string;
//   ContentType?: { Name?: string };
//   // custom
//   NACategory?: string;
//   NAHashtags?: string;
//   NAIsFeatured?: boolean;
//   NAReadTimeMinutes?: number;
//   // author & dept
//   NAAuthor?: Person | Person[];
//   FieldValuesAsText?: { NADepartment?: string };
//   // internal view cache (from Search fallback)
//   __views?: number;
//   [key: string]: any;
// };
// const CT_NAME = "New News Article";
// const DEPT_LABEL_FIELD_INTERNAL = "b6547384e0b841d5a2bf78325d80b47d";
// /* ───────────────── helpers ───────────────── */
// const getDeptName = (it: Item): string | undefined => {
//   const raw =
//     (it[DEPT_LABEL_FIELD_INTERNAL] as string | undefined) ??
//     it.FieldValuesAsText?.NADepartment;
//   if (!raw) return undefined;
//   const first = (raw.split(/;#|;/)[0] || raw).trim();
//   return first.includes("|") ? first.split("|")[0].trim() : first;
// };
// const pickDateIso = (it: Item) => {
//   const c = new Date(it.Created).getTime();
//   const m = new Date(it.Modified).getTime();
//   return Math.abs(m - c) < 1000 ? it.Created : it.Modified;
// };
// const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "");
// const getAuthor = (v?: Person | Person[]): Person | undefined =>
//   Array.isArray(v) ? v[0] : v;
// const authorPhotoUrl = (siteUrl: string, p?: Person): string | undefined => {
//   if (!p) return undefined;
//   const acct = p.EMail || p.Name;
//   return acct
//     ? `${siteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${encodeURIComponent(
//         acct
//       )}`
//     : undefined;
// };
// const formatReadTime = (mins?: number): string | undefined => {
//   if (typeof mins !== "number" || mins <= 0) return undefined;
//   if (mins >= 60) {
//     const h = Math.floor(mins / 60);
//     const m = mins % 60;
//     const hLabel = h === 1 ? "hr" : "hrs";
//     return `${h}${hLabel} ${String(m).padStart(2, "0")}mins`;
//   }
//   return `${mins} min read`;
// };
// /* ——— Hashtag parsing ——— */
// const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "");
// const decodeHtml = (s: string) =>
//   s
//     .replace(/&amp;/g, "&")
//     .replace(/&lt;/g, "<")
//     .replace(/&gt;/g, ">")
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'");
// const splitToTags = (raw?: string): string[] => {
//   if (!raw) return [];
//   const cleaned = stripHtml(decodeHtml(String(raw)));
//   const parts = cleaned
//     .split(/[\s,;#]+/g)
//     .map((t) => t.trim())
//     .filter((t) => t.length > 0);
//   const ok = parts
//     .map((t) => t.replace(/^#/, ""))
//     .filter((t) => /^[\p{L}\p{N}_-]+$/u.test(t));
//   const seen = new Set<string>();
//   const out: string[] = [];
//   for (const t of ok) {
//     const key = t.toLowerCase();
//     if (!seen.has(key)) {
//       seen.add(key);
//       out.push(t);
//     }
//   }
//   return out;
// };
// // Views via Search
// const fetchViewsForPathsViaSearch = async (
//   spfx: WebPartContext,
//   siteUrl: string,
//   absoluteUrls: string[]
// ): Promise<Record<string, number>> => {
//   if (absoluteUrls.length === 0) return {};
//   const chunkSize = 20;
//   const map: Record<string, number> = {};
//   const select = encodeURIComponent("ViewsLifeTime,ViewsRecent,Popularity,Path,Title");
//   for (let i = 0; i < absoluteUrls.length; i += chunkSize) {
//     const chunk = absoluteUrls.slice(i, i + chunkSize);
//     const q = chunk.map((u) => `path:"${u.replace(/"/g, '\\"')}"`).join(" OR ");
//     const url =
//       `${siteUrl}/_api/search/query?querytext='${encodeURIComponent("(" + q + ")")}'` +
//       `&selectproperties='${select}'&rowlimit=${chunk.length}`;
//     const res = await spfx.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     if (!res.ok) continue;
//     const json: any = await res.json();
//     const rows = json?.PrimaryQueryResult?.RelevantResults?.Table?.Rows || [];
//     rows.forEach((r: any) => {
//       const cells: any[] = r.Cells || [];
//       const c: Record<string, any> = {};
//       cells.forEach((kv) => (c[kv.Key] = kv.Value));
//       const path = String(c.Path || "").toLowerCase();
//       const life = c.ViewsLifeTime != null ? Number(c.ViewsLifeTime) : undefined;
//       const recent = c.ViewsRecent != null ? Number(c.ViewsRecent) : undefined;
//       const pop = c.Popularity != null ? Number(c.Popularity) : undefined;
//       const chosen = Number.isFinite(life)
//         ? life
//         : Number.isFinite(recent)
//         ? recent
//         : Number.isFinite(pop)
//         ? pop
//         : undefined;
//       if (typeof chosen === "number") map[path] = Math.round(chosen);
//     });
//   }
//   return map;
// };
// /* ───────────────── UI helpers ───────────────── */
// const isAnnouncement = (it: Item) =>
//   (it.NACategory || "").toLowerCase().includes("announce");
// type TabKey = "All" | "Announcements";
// type ViewMode = "grid" | "list";
// type CategoryKey = "All" | "Announcements" | "DHRE Stories" | "Around the World";
// // simple icon map for categories
// const catIcon = (cat?: string): string => {
//   const c = (cat || "").toLowerCase();
//   if (c.includes("announce")) return "🛎️";
//   if (c.includes("around")) return "🌍";
//   if (c.includes("dhre")) return "📰";
//   return "✳️";
// };
// /* ───────────────── component ───────────────── */
// const NewsPage: React.FC<Props> = ({ spfxContext, siteUrl }) => {
//   const [items, setItems] = useState<Item[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   // UI state
//   const [tab, setTab] = useState<TabKey>("All");
//   const [dept, setDept] = useState<string>("All");
//   const [category, setCategory] = useState<CategoryKey>("All");
//   const [q, setQ] = useState<string>("");
//   const [view, setView] = useState<ViewMode>("grid");
//   const searchRef = useRef<HTMLInputElement>(null);
//   const getJson = async (res: SPHttpClientResponse) => {
//     if (!res.ok) {
//       const body = await res.text().catch(() => "");
//       throw new Error(`HTTP ${res.status} ${res.statusText} - ${body}`);
//     }
//     return res.json();
//   };
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         // 1) Site Pages GUID
//         const meta = await getJson(
//           await spfxContext.spHttpClient.get(
//             `${siteUrl}/_api/web/lists/getbytitle('Site Pages')?$select=Id,Title`,
//             SPHttpClient.configurations.v1
//           )
//         );
//         const listId: string = meta?.Id;
//         if (!listId) throw new Error("Could not resolve Site Pages list Id.");
//         // 2) CT Id
//         const ctJson = await getJson(
//           await spfxContext.spHttpClient.get(
//             `${siteUrl}/_api/web/lists(guid'${listId}')/ContentTypes` +
//               `?$select=Name,Id/StringValue&$expand=Id&$filter=Name eq '${CT_NAME.replace(/'/g, "''")}'`,
//             SPHttpClient.configurations.v1
//           )
//         );
//         const ct = (ctJson.value || [])[0];
//         if (!ct?.Id?.StringValue)
//           throw new Error(`Content Type '${CT_NAME}' not found on this Site Pages library.`);
//         const ctId: string = ct.Id.StringValue;
//         // 3) Items
//         const itemsUrl =
//           `${siteUrl}/_api/web/lists(guid'${listId}')/items` +
//           `?$select=Id,Title,FileRef,Created,Modified,ContentType/Name,` +
//           `NACategory,NAHashtags,NAIsFeatured,NAReadTimeMinutes,` +
//           `${DEPT_LABEL_FIELD_INTERNAL},FieldValuesAsText/NADepartment,` +
//           `NAAuthor/Title,NAAuthor/EMail,NAAuthor/Name` +
//           `&$expand=ContentType,FieldValuesAsText,NAAuthor` +
//           `&$filter=startswith(ContentTypeId,'${ctId}')` +
//           `&$orderby=Modified desc` +
//           `&$top=200`;
//         const itemsJson = await getJson(
//           await spfxContext.spHttpClient.get(itemsUrl, SPHttpClient.configurations.v1)
//         );
//         const rows: Item[] = itemsJson.value || [];
//         const absoluteUrls = rows.map((r) => new URL(r.FileRef, siteUrl).toString());
//         const viewMap = await fetchViewsForPathsViaSearch(spfxContext, siteUrl, absoluteUrls);
//         const withViews = rows.map((r) => {
//           const abs = new URL(r.FileRef, siteUrl).toString().toLowerCase();
//           const v = viewMap[abs];
//           r.__views = typeof v === "number" ? v : undefined;
//           return r;
//         });
//         setItems(withViews);
//       } catch (e: any) {
//         console.error("[NewsPage] Error:", e);
//         setError(e?.message || "Failed to fetch news pages.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [spfxContext, siteUrl]);
//   /* ───────────── filters ───────────── */
//   const departments = useMemo(
//     () => [
//       { key: "All", label: "Department : All" },
//       { key: "Human Capital", label: "Human Capital" },
//     ],
//     []
//   );
//   const filtered = useMemo(() => {
//     const norm = (s: string) => s.toLowerCase();
//     const qq = norm(q.trim());
//     return items.filter((it) => {
//       if (tab === "Announcements" && !isAnnouncement(it)) return false;
//       if (category !== "All") {
//         const cat = (it.NACategory || "").trim();
//         if (cat.toLowerCase() !== category.toLowerCase()) return false;
//       }
//       const dn = getDeptName(it) || "";
//       if (dept !== "All" && dn.toLowerCase() !== dept.toLowerCase()) return false;
//       if (qq) {
//         const t = (it.Title || "").toLowerCase();
//         const tags = splitToTags(it.NAHashtags).map((x) => x.toLowerCase());
//         if (!t.includes(qq) && !tags.some((tg) => tg.includes(qq))) return false;
//       }
//       return true;
//     });
//   }, [items, tab, dept, category, q]);
//   /* ───────────── controls ───────────── */
//   const Segmented = () => (
//     <div className={styles.segmented}>
//       {(["All", "Announcements"] as TabKey[]).map((k) => (
//         <button
//           key={k}
//           onClick={() => setTab(k)}
//           className={`${styles.segBtn} ${tab === k ? styles.active : ""}`}
//           aria-pressed={tab === k}
//         >
//           {k === "All" ? "All News" : "Announcements"}
//         </button>
//       ))}
//     </div>
//   );
//   const CategoryFilter = () => (
//     <div className={styles.dept}>
//       <select
//         aria-label="Filter by category"
//         value={category}
//         onChange={(e) => setCategory(e.target.value as CategoryKey)}
//       >
//         <option value="All">Category : All</option>
//         <option value="Announcements">Announcements</option>
//         <option value="DHRE Stories">DHRE Stories</option>
//         <option value="Around the World">Around the World</option>
//       </select>
//       <span className={styles.chev} aria-hidden>▾</span>
//     </div>
//   );
//   const DeptFilter = () => (
//     <div className={`${styles.dept} ${styles.deptTransparent}`}>
//       <select
//         aria-label="Filter by department"
//         value={dept}
//         onChange={(e) => setDept(e.target.value)}
//       >
//         {departments.map((d) => (
//           <option key={d.key} value={d.key}>
//             {d.label}
//           </option>
//         ))}
//       </select>
//       <span className={styles.chev} aria-hidden>▾</span>
//     </div>
//   );
//   const SearchBox = () => (
//     <div className={styles.search}>
//       <span className={styles.searchIcon} aria-hidden>🔍</span>
//       <input
//         ref={searchRef}
//         placeholder="Search News"
//         value={q}
//         onChange={(e) => {
//           setQ(e.target.value);
//           requestAnimationFrame(() => searchRef.current?.focus());
//         }}
//         onKeyDown={(e) => e.stopPropagation()}
//       />
//     </div>
//   );
//   const ViewToggle = () => (
//     <div className={styles.viewToggle} role="group" aria-label="View">
//       <button
//         className={`${styles.viewBtn} ${view === "grid" ? styles.viewActive : ""}`}
//         onMouseDown={(e) => e.preventDefault()}
//         onClick={() => setView("grid")}
//         aria-pressed={view === "grid"}
//         title="Grid view"
//       >
//         <span className={styles.gridDots} />
//       </button>
//       <button
//         className={`${styles.viewBtn} ${view === "list" ? styles.viewActive : ""}`}
//         onMouseDown={(e) => e.preventDefault()}
//         onClick={() => setView("list")}
//         aria-pressed={view === "list"}
//         title="List view"
//       >
//         <span className={styles.listLines} />
//       </button>
//     </div>
//   );
//   /* ───────────── grid helpers ───────────── */
//   const MetaRowGridRight: React.FC<{ it: Item }> = ({ it }) => {
//     const readText = formatReadTime(it.NAReadTimeMinutes);
//     const views = it.__views;
//     return (
//       <div className={styles.TIRMetaInlineRight}>
//         <span>{fmt(pickDateIso(it))}</span>
//         {readText ? <span>• {readText}</span> : null}
//         {typeof views === "number" ? <span>• {views} Views</span> : null}
//       </div>
//     );
//   };
//   const TIRCategoryIconGrid: React.FC<{ it: Item }> = ({ it }) => (
//     <div className={styles.TIRCategoryIconGrid} title={it.NACategory || "Category"}>
//       {catIcon(it.NACategory)}
//     </div>
//   );
//   const DeptChip: React.FC<{ it: Item }> = ({ it }) => {
//     const deptName = getDeptName(it);
//     if (!deptName) return null;
//     return <span className={styles.badge}>{deptName}</span>;
//   };
//   /* BIG TILE */
//   const TileBig: React.FC<{ it: Item }> = ({ it }) => {
//     const deptName = getDeptName(it);
//     return (
//       <a className={styles.big} href={it.FileRef}>
//         {/* Category icon (top-left) */}
//         <TIRCategoryIconGrid it={it} />
//         {/* Pinned chip (top-right) */}
//         {it.NAIsFeatured ? (
//           <span className={styles.TIRPinnedChip}>Pinned</span>
//         ) : null}
//         {/* Title */}
//         <div className={styles.bigTitle}>{it.Title}</div>
//         {/* Dept (left) + Meta (right) on one row */}
//         <div className={styles.TIRBigMetaRow}>
//           {deptName ? <span className={styles.TIRDeptInline}>{deptName}</span> : <span />}
//           <MetaRowGridRight it={it} />
//         </div>
//       </a>
//     );
//   };
//   /* SMALL TILE (kept as earlier) */
//   const TileSmall: React.FC<{ it: Item }> = ({ it }) => (
//     <a className={styles.small} href={it.FileRef}>
//       <TIRCategoryIconGrid it={it} />
//       <DeptChip it={it} />
//       <div className={styles.smallTitle}>{it.Title}</div>
//       {/* small tile meta stays left, as requested earlier */}
//       <div className={styles.meta}>
//         <span>{fmt(pickDateIso(it))}</span>
//         {formatReadTime(it.NAReadTimeMinutes) ? (
//           <span>• {formatReadTime(it.NAReadTimeMinutes)}</span>
//         ) : null}
//         {typeof it.__views === "number" ? <span>• {it.__views} Views</span> : null}
//       </div>
//     </a>
//   );
//   /* ───────────── content renderers ───────────── */
//   const Grid = () => {
//     if (filtered.length === 0) return <div className={styles.empty}>No results.</div>;
//     const rows: Item[][] = [];
//     for (let i = 0; i < filtered.length; i += 3) rows.push(filtered.slice(i, i + 3));
//     const rowClsMap: Record<"left" | "center" | "right", string> = {
//       left: styles["row-left"],
//       center: styles["row-center"],
//       right: styles["row-right"],
//     };
//     return (
//       <div className={styles.gridWrap}>
//         {rows.map((row, idx) => {
//           const layout: "left" | "center" | "right" =
//             idx % 3 === 0 ? "left" : idx % 3 === 1 ? "center" : "right";
//           const cls = `${styles.gridRow} ${rowClsMap[layout]}`;
//           const a = row[0], b = row[1], c = row[2];
//           let cells: React.ReactNode[];
//           if (layout === "left")
//             cells = [a && <TileBig it={a} />, b && <TileSmall it={b} />, c && <TileSmall it={c} />];
//           else if (layout === "center")
//             cells = [a && <TileSmall it={a} />, b && <TileBig it={b} />, c && <TileSmall it={c} />];
//           else
//             cells = [a && <TileSmall it={a} />, b && <TileSmall it={b} />, c && <TileBig it={c} />];
//           return (
//             <div key={idx} className={cls}>
//               {cells.map((el, i) => (
//                 <React.Fragment key={i}>{el || <div />}</React.Fragment>
//               ))}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };
//   /* LIST (unchanged from previous “fixed” version) */
//   const List = () => (
//     <ul className={styles.listWrap}>
//       {filtered.map((it) => {
//         const deptName = getDeptName(it);
//         const tags = splitToTags(it.NAHashtags);
//         const author = getAuthor(it.NAAuthor);
//         const photo = authorPhotoUrl(siteUrl, author);
//         const readText = formatReadTime(it.NAReadTimeMinutes);
//         const views = it.__views;
//         return (
//           <li key={it.Id} className={styles.listItem}>
//             <div className={styles.listMedia}>
//               <div className={styles.listCatIcon}>{catIcon(it.NACategory)}</div>
//             </div>
//             <div className={styles.listBody}>
//               {/* Row 1: Department + Hashtags */}
//               <div className={styles.topRow}>
//                 {deptName ? <span className={styles.listDept}>{deptName}</span> : null}
//                 {tags.length > 0 ? (
//                   <div className={styles.hashes}>
//                     {tags.map((t) => (
//                       <span key={t} className={styles.hash}>#{t}</span>
//                     ))}
//                   </div>
//                 ) : null}
//               </div>
//               {/* Row 2: Title (left) + Meta (right) */}
//               <div className={styles.titleRow}>
//                 <a href={it.FileRef} className={styles.listTitle}>{it.Title}</a>
//                 <div className={styles.metaInline}>
//                   <span>{fmt(pickDateIso(it))}</span>
//                   {readText ? <span>• {readText}</span> : null}
//                   {typeof views === "number" ? <span>• {views} Views</span> : null}
//                 </div>
//               </div>
//               {/* Row 3: Author (right) */}
//               <div className={styles.authorRow}>
//                 {photo ? <img src={photo} alt="" /> : <span className={styles.authorStub} />}
//                 <span className={styles.authorName}>{author?.Title || ""}</span>
//               </div>
//             </div>
//           </li>
//         );
//       })}
//     </ul>
//   );
//   if (loading) return <div>Loading…</div>;
//   if (error) return <div style={{ color: "crimson" }}>{error}</div>;
//   return (
//     <div className={styles.wrapper}>
//       <div className={styles.controls}>
//         <Segmented />
//         <CategoryFilter />
//         <DeptFilter />
//         <SearchBox />
//         <ViewToggle />
//       </div>
//       {view === "grid" ? <Grid /> : <List />}
//     </div>
//   );
// };
// export default NewsPage;
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import searchIcon from "../assets/news_search_normal.svg";
import { SPHttpClient } from "@microsoft/sp-http";
import styles from "../styles/NewsPage.module.scss";
var CT_NAME = "New News Article";
var DEPT_LABEL_FIELD_INTERNAL = "b6547384e0b841d5a2bf78325d80b47d";
/* ───────── helpers ───────── */
var getDeptName = function (it) {
    var _a, _b;
    var raw = (_a = it[DEPT_LABEL_FIELD_INTERNAL]) !== null && _a !== void 0 ? _a : (_b = it.FieldValuesAsText) === null || _b === void 0 ? void 0 : _b.NADepartment;
    if (!raw)
        return undefined;
    var first = (raw.split(/;#|;/)[0] || raw).trim();
    return first.includes("|") ? first.split("|")[0].trim() : first;
};
var pickDateIso = function (it) {
    var c = new Date(it.Created).getTime();
    var m = new Date(it.Modified).getTime();
    return Math.abs(m - c) < 1000 ? it.Created : it.Modified;
};
var fmt = function (iso) { return (iso ? new Date(iso).toLocaleString() : ""); };
var getAuthor = function (v) {
    return Array.isArray(v) ? v[0] : v;
};
var authorPhotoUrl = function (siteUrl, p) {
    if (!p)
        return undefined;
    var acct = p.EMail || p.Name;
    return acct
        ? "".concat(siteUrl, "/_layouts/15/userphoto.aspx?size=S&accountname=").concat(encodeURIComponent(acct))
        : undefined;
};
var formatReadTime = function (mins) {
    if (typeof mins !== "number" || mins <= 0)
        return undefined;
    if (mins >= 60) {
        var h = Math.floor(mins / 60);
        var m = mins % 60;
        return "".concat(h).concat(h === 1 ? "hr" : "hrs", " ").concat(String(m).padStart(2, "0"), "mins");
    }
    return "".concat(mins, " min read");
};
var stripHtml = function (s) { return s.replace(/<[^>]*>/g, ""); };
var decodeHtml = function (s) {
    return s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};
var splitToTags = function (raw) {
    if (!raw)
        return [];
    var cleaned = stripHtml(decodeHtml(String(raw)));
    var parts = cleaned
        .split(/[\s,;#]+/g)
        .map(function (t) { return t.trim(); })
        .filter(function (t) { return t.length > 0; });
    var ok = parts
        .map(function (t) { return t.replace(/^#/, ""); })
        .filter(function (t) { return /^[\p{L}\p{N}_-]+$/u.test(t); });
    var seen = new Set();
    var out = [];
    for (var _i = 0, ok_1 = ok; _i < ok_1.length; _i++) {
        var t = ok_1[_i];
        var key = t.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            out.push(t);
        }
    }
    return out;
};
var fetchViewsForPathsViaSearch = function (spfx, siteUrl, absoluteUrls) { return __awaiter(void 0, void 0, void 0, function () {
    var chunkSize, map, select, i, chunk, q, url, res, json, rows;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (absoluteUrls.length === 0)
                    return [2 /*return*/, {}];
                chunkSize = 20;
                map = {};
                select = encodeURIComponent("ViewsLifeTime,ViewsRecent,Popularity,Path,Title");
                i = 0;
                _d.label = 1;
            case 1:
                if (!(i < absoluteUrls.length)) return [3 /*break*/, 5];
                chunk = absoluteUrls.slice(i, i + chunkSize);
                q = chunk.map(function (u) { return "path:\"".concat(u.replace(/"/g, '\\"'), "\""); }).join(" OR ");
                url = "".concat(siteUrl, "/_api/search/query?querytext='").concat(encodeURIComponent("(" + q + ")"), "'") +
                    "&selectproperties='".concat(select, "'&rowlimit=").concat(chunk.length);
                return [4 /*yield*/, spfx.spHttpClient.get(url, SPHttpClient.configurations.v1)];
            case 2:
                res = _d.sent();
                if (!res.ok)
                    return [3 /*break*/, 4];
                return [4 /*yield*/, res.json()];
            case 3:
                json = _d.sent();
                rows = ((_c = (_b = (_a = json === null || json === void 0 ? void 0 : json.PrimaryQueryResult) === null || _a === void 0 ? void 0 : _a.RelevantResults) === null || _b === void 0 ? void 0 : _b.Table) === null || _c === void 0 ? void 0 : _c.Rows) || [];
                rows.forEach(function (r) {
                    var cells = r.Cells || [];
                    var c = {};
                    cells.forEach(function (kv) { return (c[kv.Key] = kv.Value); });
                    var path = String(c.Path || "").toLowerCase();
                    var life = c.ViewsLifeTime != null ? Number(c.ViewsLifeTime) : undefined;
                    var recent = c.ViewsRecent != null ? Number(c.ViewsRecent) : undefined;
                    var pop = c.Popularity != null ? Number(c.Popularity) : undefined;
                    var chosen = Number.isFinite(life)
                        ? life
                        : Number.isFinite(recent)
                            ? recent
                            : Number.isFinite(pop)
                                ? pop
                                : undefined;
                    if (typeof chosen === "number")
                        map[path] = Math.round(chosen);
                });
                _d.label = 4;
            case 4:
                i += chunkSize;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/, map];
        }
    });
}); };
/* ───────── UI helpers ───────── */
var isAnnouncement = function (it) {
    return (it.NACategory || "").toLowerCase().includes("announce");
};
var catIcon = function (cat) {
    var c = (cat || "").toLowerCase();
    if (c.includes("announce"))
        return "🛎️";
    if (c.includes("around"))
        return "🌍";
    if (c.includes("dhre"))
        return "📰";
    return "✳️";
};
var DEPARTMENTS = [
    { key: "All", label: "Department : All" },
    { key: "Human Capital", label: "Human Capital" },
];
/* ───────── component ───────── */
var NewsPage = function (_a) {
    var spfxContext = _a.spfxContext, siteUrl = _a.siteUrl;
    var _b = useState([]), items = _b[0], setItems = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(true), loading = _d[0], setLoading = _d[1];
    var _e = useState("All"), tab = _e[0], setTab = _e[1];
    var _f = useState("All"), dept = _f[0], setDept = _f[1];
    var _g = useState("All"), category = _g[0], setCategory = _g[1];
    var _h = useState(""), q = _h[0], setQ = _h[1];
    var _j = useState("grid"), view = _j[0], setView = _j[1];
    var searchRef = useRef(null);
    var getJson = function (res) { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!res.ok) return [3 /*break*/, 2];
                    return [4 /*yield*/, res.text().catch(function () { return ""; })];
                case 1:
                    body = _a.sent();
                    throw new Error("HTTP ".concat(res.status, " ").concat(res.statusText, " - ").concat(body));
                case 2: return [2 /*return*/, res.json()];
            }
        });
    }); };
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var meta, _a, listId, ctJson, _b, ct, ctId, itemsUrl, itemsJson, _c, rows, absoluteUrls, viewMap_1, withViews, e_1;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 8, 9, 10]);
                        setLoading(true);
                        setError(null);
                        _a = getJson;
                        return [4 /*yield*/, spfxContext.spHttpClient.get("".concat(siteUrl, "/_api/web/lists/getbytitle('Site Pages')?$select=Id"), SPHttpClient.configurations.v1)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, [_e.sent()])];
                    case 2:
                        meta = _e.sent();
                        listId = meta === null || meta === void 0 ? void 0 : meta.Id;
                        if (!listId)
                            throw new Error("Could not resolve Site Pages list Id.");
                        _b = getJson;
                        return [4 /*yield*/, spfxContext.spHttpClient.get("".concat(siteUrl, "/_api/web/lists(guid'").concat(listId, "')/ContentTypes") +
                                "?$select=Name,Id/StringValue&$expand=Id&$filter=Name eq '".concat(CT_NAME.replace(/'/g, "''"), "'"), SPHttpClient.configurations.v1)];
                    case 3: return [4 /*yield*/, _b.apply(void 0, [_e.sent()])];
                    case 4:
                        ctJson = _e.sent();
                        ct = (ctJson.value || [])[0];
                        if (!((_d = ct === null || ct === void 0 ? void 0 : ct.Id) === null || _d === void 0 ? void 0 : _d.StringValue))
                            throw new Error("Content Type '".concat(CT_NAME, "' not found on this Site Pages library."));
                        ctId = ct.Id.StringValue;
                        itemsUrl = "".concat(siteUrl, "/_api/web/lists(guid'").concat(listId, "')/items") +
                            "?$select=Id,Title,FileRef,Created,Modified," +
                            "NACategory,NAHashtags,NAIsFeatured,NAReadTimeMinutes," +
                            "".concat(DEPT_LABEL_FIELD_INTERNAL, ",FieldValuesAsText/NADepartment,") +
                            "NAAuthor/Title,NAAuthor/EMail,NAAuthor/Name" +
                            "&$expand=FieldValuesAsText,NAAuthor" +
                            "&$filter=startswith(ContentTypeId,'".concat(ctId, "')") +
                            "&$orderby=Modified desc" +
                            "&$top=200";
                        _c = getJson;
                        return [4 /*yield*/, spfxContext.spHttpClient.get(itemsUrl, SPHttpClient.configurations.v1)];
                    case 5: return [4 /*yield*/, _c.apply(void 0, [_e.sent()])];
                    case 6:
                        itemsJson = _e.sent();
                        rows = itemsJson.value || [];
                        absoluteUrls = rows.map(function (r) {
                            return new URL(r.FileRef, siteUrl).toString();
                        });
                        return [4 /*yield*/, fetchViewsForPathsViaSearch(spfxContext, siteUrl, absoluteUrls)];
                    case 7:
                        viewMap_1 = _e.sent();
                        withViews = rows.map(function (r) {
                            var abs = new URL(r.FileRef, siteUrl).toString().toLowerCase();
                            var v = viewMap_1[abs];
                            r.__views = typeof v === "number" ? v : undefined;
                            return r;
                        });
                        setItems(withViews);
                        return [3 /*break*/, 10];
                    case 8:
                        e_1 = _e.sent();
                        console.error("[NewsPage] Error:", e_1);
                        setError((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || "Failed to fetch news pages.");
                        return [3 /*break*/, 10];
                    case 9:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        }); })();
    }, [spfxContext, siteUrl]);
    /* ───────── filters ───────── */
    var filtered = React.useMemo(function () {
        var norm = function (s) { return s.toLowerCase(); };
        var qq = norm(q.trim());
        return items.filter(function (it) {
            if (tab === "Announcements" && !isAnnouncement(it))
                return false;
            if (category !== "All") {
                var cat = (it.NACategory || "").trim();
                if (cat.toLowerCase() !== category.toLowerCase())
                    return false;
            }
            var dn = getDeptName(it) || "";
            if (dept !== "All" && dn.toLowerCase() !== dept.toLowerCase())
                return false;
            if (qq) {
                var t = (it.Title || "").toLowerCase();
                var tags = splitToTags(it.NAHashtags).map(function (x) { return x.toLowerCase(); });
                if (!t.includes(qq) && !tags.some(function (tg) { return tg.includes(qq); }))
                    return false;
            }
            return true;
        });
    }, [items, tab, dept, category, q]);
    /* ───────── controls ───────── */
    var Segmented = function () { return (React.createElement("div", { className: styles.segmented }, ["All", "Announcements"].map(function (k) { return (React.createElement("button", { key: k, onClick: function () { return setTab(k); }, className: "".concat(styles.segBtn, " ").concat(tab === k ? styles.active : ""), "aria-pressed": tab === k }, k === "All" ? "All News" : "Announcements")); }))); };
    var CategoryFilter = function () { return (React.createElement("div", { className: styles.dept },
        React.createElement("select", { "aria-label": "Filter by category", value: category, onChange: function (e) { return setCategory(e.target.value); } },
            React.createElement("option", { value: "All" }, "Category : All"),
            React.createElement("option", { value: "Announcements" }, "Announcements"),
            React.createElement("option", { value: "DHRE Stories" }, "DHRE Stories"),
            React.createElement("option", { value: "Around the World" }, "Around the World")),
        React.createElement("span", { className: styles.chev, "aria-hidden": true }, "\u25BE"))); };
    var DeptFilter = function () { return (React.createElement("div", { className: "".concat(styles.dept, " ").concat(styles.deptTransparent) },
        React.createElement("select", { "aria-label": "Filter by department", value: dept, onChange: function (e) { return setDept(e.target.value); } }, DEPARTMENTS.map(function (d) { return (React.createElement("option", { key: d.key, value: d.key }, d.label)); })),
        React.createElement("span", { className: styles.chev, "aria-hidden": true }, "\u25BE"))); };
    var SearchBox = function () { return (React.createElement("div", { className: styles.search },
        React.createElement("img", { src: searchIcon, alt: "Search", className: styles.icon }),
        React.createElement("input", { ref: searchRef, placeholder: "Search News", value: q, onChange: function (e) {
                setQ(e.target.value);
                requestAnimationFrame(function () { var _a; return (_a = searchRef.current) === null || _a === void 0 ? void 0 : _a.focus(); });
            }, onKeyDown: function (e) { return e.stopPropagation(); } }))); };
    var ViewToggle = function () { return (React.createElement("div", { className: styles.viewToggle, role: "group", "aria-label": "View" },
        React.createElement("button", { className: "".concat(styles.viewBtn, " ").concat(view === "grid" ? styles.viewActive : ""), onMouseDown: function (e) { return e.preventDefault(); }, onClick: function () { return setView("grid"); }, "aria-pressed": view === "grid", title: "Grid view" },
            React.createElement("span", { className: styles.gridDots })),
        React.createElement("button", { className: "".concat(styles.viewBtn, " ").concat(view === "list" ? styles.viewActive : ""), onMouseDown: function (e) { return e.preventDefault(); }, onClick: function () { return setView("list"); }, "aria-pressed": view === "list", title: "List view" },
            React.createElement("span", { className: styles.listLines })))); };
    /* ───────── grid helpers ───────── */
    var MetaRowGridRight = function (_a) {
        var it = _a.it;
        var readText = formatReadTime(it.NAReadTimeMinutes);
        return (React.createElement("div", { className: styles.TIRMetaInlineRight },
            React.createElement("span", null, fmt(pickDateIso(it))),
            readText ? React.createElement("span", null,
                "\u2022 ",
                readText) : null,
            typeof it.__views === "number" ? React.createElement("span", null,
                "\u2022 ",
                it.__views,
                " Views") : null));
    };
    var TIRCategoryIconGrid = function (_a) {
        var it = _a.it;
        return (React.createElement("div", { className: styles.TIRCategoryIconGrid, title: it.NACategory || "Category" }, catIcon(it.NACategory)));
    };
    var DeptChip = function (_a) {
        var it = _a.it;
        var deptName = getDeptName(it);
        if (!deptName)
            return null;
        return React.createElement("span", { className: styles.badge }, deptName);
    };
    var TileBig = function (_a) {
        var it = _a.it;
        var deptName = getDeptName(it);
        return (React.createElement("a", { className: styles.big, href: it.FileRef },
            React.createElement(TIRCategoryIconGrid, { it: it }),
            it.NAIsFeatured ? React.createElement("span", { className: styles.TIRPinnedChip }, "Pinned") : null,
            React.createElement("div", { className: styles.bigTitle }, it.Title),
            React.createElement("div", { className: styles.TIRBigMetaRow },
                deptName ? React.createElement("span", { className: styles.TIRDeptInline }, deptName) : React.createElement("span", null),
                React.createElement(MetaRowGridRight, { it: it }))));
    };
    var TileSmall = function (_a) {
        var it = _a.it;
        return (React.createElement("a", { className: styles.small, href: it.FileRef },
            React.createElement(TIRCategoryIconGrid, { it: it }),
            React.createElement(DeptChip, { it: it }),
            React.createElement("div", { className: styles.smallTitle }, it.Title),
            React.createElement("div", { className: styles.meta },
                React.createElement("span", null, fmt(pickDateIso(it))),
                formatReadTime(it.NAReadTimeMinutes) ? (React.createElement("span", null,
                    "\u2022 ",
                    formatReadTime(it.NAReadTimeMinutes))) : null,
                typeof it.__views === "number" ? React.createElement("span", null,
                    "\u2022 ",
                    it.__views,
                    " Views") : null)));
    };
    /* ───────── renderers ───────── */
    var Grid = function () {
        if (filtered.length === 0)
            return React.createElement("div", { className: styles.empty }, "No results.");
        var rows = [];
        for (var i = 0; i < filtered.length; i += 3)
            rows.push(filtered.slice(i, i + 3));
        var rowClsMap = {
            left: styles["row-left"],
            center: styles["row-center"],
            right: styles["row-right"],
        };
        return (React.createElement("div", { className: styles.gridWrap }, rows.map(function (row, idx) {
            var layout = idx % 3 === 0 ? "left" : idx % 3 === 1 ? "center" : "right";
            var cls = "".concat(styles.gridRow, " ").concat(rowClsMap[layout]);
            var a = row[0], b = row[1], c = row[2];
            var cells;
            if (layout === "left")
                cells = [a && React.createElement(TileBig, { it: a }), b && React.createElement(TileSmall, { it: b }), c && React.createElement(TileSmall, { it: c })];
            else if (layout === "center")
                cells = [a && React.createElement(TileSmall, { it: a }), b && React.createElement(TileBig, { it: b }), c && React.createElement(TileSmall, { it: c })];
            else
                cells = [a && React.createElement(TileSmall, { it: a }), b && React.createElement(TileSmall, { it: b }), c && React.createElement(TileBig, { it: c })];
            return (React.createElement("div", { key: idx, className: cls }, cells === null || cells === void 0 ? void 0 : cells.map(function (el, i) { return React.createElement(React.Fragment, { key: i }, el || React.createElement("div", null)); })));
        })));
    };
    var List = function () { return (React.createElement("ul", { className: styles.listWrap }, filtered.map(function (it) {
        var deptName = getDeptName(it);
        var tags = splitToTags(it.NAHashtags);
        var author = getAuthor(it.NAAuthor);
        var photo = authorPhotoUrl(siteUrl, author);
        var readText = formatReadTime(it.NAReadTimeMinutes);
        var views = it.__views;
        return (React.createElement("li", { key: it.Id, className: styles.listItem },
            React.createElement("div", { className: styles.listMedia },
                React.createElement("div", { className: styles.listCatIcon }, catIcon(it.NACategory))),
            React.createElement("div", { className: styles.listBody },
                React.createElement("div", { className: styles.topRow },
                    deptName ? React.createElement("span", { className: styles.listDept }, deptName) : null,
                    tags.length > 0 ? (React.createElement("div", { className: styles.hashes }, tags.map(function (t) { return (React.createElement("span", { key: t, className: styles.hash },
                        "#",
                        t)); }))) : null),
                React.createElement("div", { className: styles.titleRow },
                    React.createElement("a", { href: it.FileRef, className: styles.listTitle }, it.Title),
                    React.createElement("div", { className: styles.metaInline },
                        React.createElement("span", null, fmt(pickDateIso(it))),
                        readText ? React.createElement("span", null,
                            "\u2022 ",
                            readText) : null,
                        typeof views === "number" ? React.createElement("span", null,
                            "\u2022 ",
                            views,
                            " Views") : null)),
                React.createElement("div", { className: styles.authorRow },
                    photo ? React.createElement("img", { src: photo, alt: "" }) : React.createElement("span", { className: styles.authorStub }),
                    React.createElement("span", { className: styles.authorName }, (author === null || author === void 0 ? void 0 : author.Title) || "")))));
    }))); };
    if (loading)
        return React.createElement("div", null, "Loading\u2026");
    if (error)
        return React.createElement("div", { style: { color: "crimson" } }, error);
    return (React.createElement("div", { className: styles.wrapper },
        React.createElement("div", { className: styles.controls },
            React.createElement(Segmented, null),
            React.createElement(CategoryFilter, null),
            React.createElement(DeptFilter, null),
            React.createElement(SearchBox, null),
            React.createElement(ViewToggle, null)),
        view === "grid" ? React.createElement(Grid, null) : React.createElement(List, null)));
};
export default NewsPage;
//# sourceMappingURL=NewsPage.js.map