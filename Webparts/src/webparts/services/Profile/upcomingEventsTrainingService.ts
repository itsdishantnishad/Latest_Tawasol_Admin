// import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { SPHttpClient } from "@microsoft/sp-http";

// export interface IEventData {
//   id: string;
//   eventImage?: string;
//   eventTitle: string;
//   eventCategory: string;
//   eventDate: string;
//   eventTime: string;
//   eventLocation: string;
//   isRegistered: boolean;
// }

// export interface IUpcomingEventsFetchResult {
//   eventsData: IEventData[];
//   trainingData: IEventData[];
// }

// const DEFAULT_LIST_TITLE = "Site Pages";

// const getTodayUtcIso = (): string => {
//   const now = new Date();
//   const utcMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
//   return utcMidnight.toISOString();
// };

// const mapBannerUrl = (banner: any): string | undefined => {
//   if (!banner) return undefined;
//   return banner.Url || banner;
// };

// const mapTimeRange = (start?: Date, end?: Date): string => {
//   if (!start || !end) return "";
//   const s = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   const e = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   return `${s} - ${e}`;
// };

// /** Extract WssId(s) from different REST taxonomy shapes */
// const extractWssIds = (val: any): number[] => {
//   if (val == null) return [];

//   if (typeof val === "number") return [val];

//   // e.g. "44;#Holiday|<guid>" OR "44;#Holiday"
//   if (typeof val === "string") {
//     const s = val.trim();
//     if (!s) return [];
//     const parts = s.split(";#");
//     const id = parseInt(parts[0], 10);
//     return isNaN(id) ? [] : [id];
//   }

//   if (Array.isArray(val)) {
//     const ids: number[] = [];
//     for (const v of val) {
//       ids.push(...extractWssIds(v));
//       if (typeof v === "object") {
//         const id = Number(v?.WssId ?? v?.wssId ?? v?.Id ?? 0);
//         if (id) ids.push(id);
//       }
//     }
//     return Array.from(new Set(ids)).filter(Boolean);
//   }

//   if (typeof val === "object") {
//     const id = Number(val?.WssId ?? val?.wssId ?? val?.Id ?? 0);
//     return id ? [id] : [];
//   }

//   return [];
// };

// const chunk = <T,>(arr: T[], size: number): T[][] => {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// };

// /**
//  * Resolve WssIds -> Term labels using TaxonomyHiddenList
//  * IMPORTANT: Use site collection root (context.pageContext.site.absoluteUrl)
//  */
// const fetchTaxonomyTitlesByWssId = async (
//   context: WebPartContext,
//   wssIds: number[]
// ): Promise<Map<number, string>> => {
//   const map = new Map<number, string>();
//   const ids = Array.from(new Set((wssIds || []).map((n) => Number(n)).filter(Boolean)));
//   if (!ids.length) return map;

//   const siteAbs = context.pageContext.site.absoluteUrl.replace(/\/$/, ""); // ✅ root site collection
//   const groups = chunk(ids, 40);

//   for (const g of groups) {
//     const filter = g.map((id) => `Id eq ${id}`).join(" or ");
//     const url =
//       `${siteAbs}/_api/web/lists/getbytitle('TaxonomyHiddenList')/items` +
//       `?$select=Id,Title&$filter=${filter}`;

//     const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     if (!res.ok) continue;

//     const json = await res.json();
//     (json.value || []).forEach((row: any) => {
//       const id = Number(row?.Id);
//       const title = String(row?.Title || "").trim();
//       if (id && title) map.set(id, title);
//     });
//   }

//   return map;
// };

// /**
//  * OPTIONAL extra safety: try to pick a non-numeric label from FieldValuesAsText dynamically
//  * (No hardcoded guessing like TIREventCategory0)
//  */
// const pickCategoryFromFieldValuesAsText = (fvat: any): string => {
//   if (!fvat) return "";
//   const keys = Object.keys(fvat).filter((k) => k.toLowerCase().startsWith("tireventcategory"));
//   for (const k of keys) {
//     const v = String(fvat[k] ?? "").trim();
//     if (v && !/^\d+$/.test(v)) return v; // ignore pure numeric
//   }
//   return "";
// };

// export const fetchUpcomingEventsAndTraining = async (
//   context: WebPartContext,
//   listTitle: string = DEFAULT_LIST_TITLE,
//   top: number = 5
// ): Promise<IUpcomingEventsFetchResult> => {
//   const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");
//   const todayIso = getTodayUtcIso();

//   // ✅ Uses SAME column name as listServices.ts: TIREventCategory
//   // Also expand FieldValuesAsText (dynamic fallback, no hardcoding)
//   const eventsUrl =
//     `${webUrl}/_api/web/lists/getbytitle('${listTitle}')/items` +
//     `?$select=Id,Title,ContentType,TIRLocation,TIREventStartDate,TIREventEndDate,BannerImageUrl,TIREventCategory,FieldValuesAsText` +
//     `&$expand=FieldValuesAsText` +
//     `&$filter=ContentType eq 'TIR Event' and TIREventStartDate ge datetime'${todayIso}'` +
//     `&$orderby=TIREventStartDate asc&$top=${top}`;

//   const trainingsUrl =
//     `${webUrl}/_api/web/lists/getbytitle('${listTitle}')/items` +
//     `?$select=Id,Title,ContentType,TIRLocation,TIREventStartDate,TIREventEndDate,BannerImageUrl` +
//     `&$filter=ContentType eq 'TIR Training' and TIREventStartDate ge datetime'${todayIso}'` +
//     `&$orderby=TIREventStartDate asc&$top=${top}`;

//   const [eventsRes, trainingsRes] = await Promise.all([
//     context.spHttpClient.get(eventsUrl, SPHttpClient.configurations.v1),
//     context.spHttpClient.get(trainingsUrl, SPHttpClient.configurations.v1),
//   ]);

//   if (!eventsRes.ok) throw new Error(`Events API failed: ${eventsRes.status} ${eventsRes.statusText}`);
//   if (!trainingsRes.ok) throw new Error(`Trainings API failed: ${trainingsRes.status} ${trainingsRes.statusText}`);

//   const eventsJson = await eventsRes.json();
//   const trainingsJson = await trainingsRes.json();

//   const eventRows: any[] = eventsJson.value || [];

//   // collect all taxonomy WssIds from TIREventCategory
//   const allWssIds: number[] = [];
//   eventRows.forEach((r) => allWssIds.push(...extractWssIds(r?.TIREventCategory)));

//   // resolve WssIds -> labels via TaxonomyHiddenList (site root)
//   const labelMap = await fetchTaxonomyTitlesByWssId(context, allWssIds);

//   const eventsData: IEventData[] = eventRows.map((item: any) => {
//     const start = item.TIREventStartDate ? new Date(item.TIREventStartDate) : undefined;
//     const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : undefined;

//     // 1) try text from FieldValuesAsText (dynamic, no guessing)
//     const textLabel = pickCategoryFromFieldValuesAsText(item?.FieldValuesAsText);

//     // 2) else resolve from TaxonomyHiddenList using WssId
//     const ids = extractWssIds(item?.TIREventCategory);
//     const hiddenLabel = ids.length ? (labelMap.get(ids[0]) || "") : "";

//     const categoryLabel = textLabel || hiddenLabel; // final label

//     return {
//       id: String(item.Id),
//       eventImage: mapBannerUrl(item.BannerImageUrl),
//       eventTitle: item.Title,
//       eventCategory: categoryLabel,
//       eventDate: start ? start.toLocaleDateString() : "",
//       eventTime: mapTimeRange(start, end),
//       eventLocation: item.TIRLocation || "",
//       isRegistered: true,
//     };
//   });

//   const trainingData: IEventData[] = (trainingsJson.value || []).map((item: any) => {
//     const start = item.TIREventStartDate ? new Date(item.TIREventStartDate) : undefined;
//     const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : undefined;

//     return {
//       id: String(item.Id),
//       eventImage: mapBannerUrl(item.BannerImageUrl),
//       eventTitle: item.Title,
//       eventCategory: "Training",
//       eventDate: start ? start.toLocaleDateString() : "",
//       eventTime: mapTimeRange(start, end),
//       eventLocation: item.TIRLocation || "",
//       isRegistered: false,
//     };
//   });

//   return { eventsData, trainingData };
// };
























// services/Profile/upcomingEventsTrainingService.ts

import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from "@microsoft/sp-http";
import { ContentTypeId } from "../listServices";

export interface IEventData {
  id: string;
  eventImage?: string;
  eventTitle: string;
  eventCategory: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  isRegistered: boolean;
}

export interface IUpcomingEventsFetchResult {
  eventsData: IEventData[];
  trainingData: IEventData[];
}

const DBG = true;
const log = (...args: any[]) => DBG && console.log("[UpcomingEventsTrainingService]", ...args);
const warn = (...args: any[]) => DBG && console.warn("[UpcomingEventsTrainingService]", ...args);

const DEFAULT_LIST_TITLE = "Site Pages";

// ✅ Your registration lists/titles
const REGISTERED_EVENTS_LIST = "Registered User Event";
const REGISTERED_TRAINING_LIST = "Registered Training";

// ✅ Your internal field names (as you confirmed)
const REG_EVENTS_IDS_FIELD = "TIRRegisteredUsers"; // text like: "130, 129, AAAAA..."
const REG_TRAINING_ID_FIELD = "TIRTrainingID";     // number

const escOData = (s: string): string => (s || "").replace(/'/g, "''");

const getTodayLocalMidnightIso = (): string => {
  // local midnight -> ISO (SharePoint stores UTC internally; this is safer than UTC midnight)
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return localMidnight.toISOString();
};

const mapBannerUrl = (banner: any): string | undefined => {
  if (!banner) return undefined;
  return banner.Url || banner;
};

const mapTimeRange = (start?: Date, end?: Date): string => {
  if (!start || !end) return "";
  const s = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const e = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${s} - ${e}`;
};

const uniqNums = (arr: number[]): number[] =>
  Array.from(new Set((arr || []).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)));

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const readOkJson = async (res: Response, label: string): Promise<any> => {
  if (!res.ok) throw new Error(`${label} failed: ${res.status} ${res.statusText}`);
  return res.json();
};

const getCurrentUserId = async (context: WebPartContext): Promise<number> => {
  const legacyId = (context.pageContext as any)?.legacyPageContext?.userId;
  if (legacyId) {
    log("UserId from legacyPageContext:", legacyId);
    return Number(legacyId);
  }

  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const res = await context.spHttpClient.get(
    `${webUrl}/_api/web/currentuser?$select=Id`,
    SPHttpClient.configurations.v1
  );
  const json = await readOkJson(res as any, "currentuser");
  const id = Number(json?.Id || 0);
  log("UserId from _api/web/currentuser:", id);
  return id;
};

/** Extract IDs like: "130, 129, AAAA..." -> [130,129] */
const extractLikelyItemIds = (text: string): number[] => {
  if (!text) return [];
  const matches = String(text).match(/\d+/g) || [];
  const nums = matches.map((m) => parseInt(m, 10)).filter((n) => Number.isFinite(n) && n > 0);

  // keep reasonable list item ids only
  return uniqNums(nums.filter((n) => n < 200000));
};

const getCtIdString = (item: any): string => {
  const raw = item?.ContentTypeId;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return String(raw?.StringValue || "");
};

const isCtStartsWith = (ctId: string, prefix: string): boolean => {
  return (ctId || "").toLowerCase().startsWith((prefix || "").toLowerCase());
};

const isUpcomingByDates = (startIso?: string, endIso?: string, todayMs?: number): boolean => {
  const t = todayMs ?? Date.now();

  const start = startIso ? new Date(startIso) : undefined;
  const end = endIso ? new Date(endIso) : undefined;

  // Prefer end-date check (covers all-day + multi-day correctly)
  if (end && !isNaN(end.getTime())) return end.getTime() >= t;
  if (start && !isNaN(start.getTime())) return start.getTime() >= t;

  // if no dates, keep it (or change to false if you want strict)
  return true;
};

const fetchMyRegisteredEventIds = async (context: WebPartContext, userId: number): Promise<number[]> => {
  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");

  const url =
    `${webUrl}/_api/web/lists/getbytitle('${escOData(REGISTERED_EVENTS_LIST)}')/items` +
    `?$select=Id,Title,AuthorId,${REG_EVENTS_IDS_FIELD}` +
    `&$filter=AuthorId eq ${userId}` +
    `&$top=5000`;

  log("Registered Events URL:", url);

  const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
  const json = await readOkJson(res as any, "registered events list");
  const rows: any[] = json.value || [];

  log("Registered Events rows count:", rows.length);
  if (rows[0]) log("Registered Events sample row:", rows[0]);

  const allIds: number[] = [];
  rows.forEach((r) => {
    const raw = String(r?.[REG_EVENTS_IDS_FIELD] || "");
    const ids = extractLikelyItemIds(raw);
    log(`Row ${r?.Id} Title:${r?.Title} raw:`, raw, "parsedIds:", ids);
    allIds.push(...ids);
  });

  const finalIds = uniqNums(allIds);
  log("Final Event IDs:", finalIds);
  return finalIds;
};

const fetchMyRegisteredTrainingIds = async (context: WebPartContext, userId: number): Promise<number[]> => {
  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");

  const url =
    `${webUrl}/_api/web/lists/getbytitle('${escOData(REGISTERED_TRAINING_LIST)}')/items` +
    `?$select=Id,Title,AuthorId,${REG_TRAINING_ID_FIELD}` +
    `&$filter=AuthorId eq ${userId}` +
    `&$top=5000`;

  log("Registered Training URL:", url);

  const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
  const json = await readOkJson(res as any, "registered training list");
  const rows: any[] = json.value || [];

  log("Registered Training rows count:", rows.length);
  if (!rows.length) {
    warn(
      "No training rows found for this user via AuthorId. If items are created by Flow/admin, you need a User field in this list."
    );
  }
  if (rows[0]) log("Registered Training sample row:", rows[0]);

  const ids: number[] = rows
    .map((r) => Number(r?.[REG_TRAINING_ID_FIELD]))
    .filter((n) => Number.isFinite(n) && n > 0);

  const finalIds = uniqNums(ids);
  log("Final Training IDs:", finalIds);
  return finalIds;
};

const fetchSitePagesByIds = async (
  context: WebPartContext,
  listTitle: string,
  ids: number[]
): Promise<any[]> => {
  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const cleanIds = uniqNums(ids);
  if (!cleanIds.length) return [];

  log("fetchSitePagesByIds list:", listTitle, "ids:", cleanIds);

  const groups = chunk(cleanIds, 40);
  const allRows: any[] = [];

  for (const g of groups) {
    const idFilter = g.map((id) => `Id eq ${id}`).join(" or ");

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${escOData(listTitle)}')/items` +
      `?$select=Id,Title,FileRef,ContentTypeId,TIRLocation,TIREventStartDate,TIREventEndDate,BannerImageUrl,` +
      `TIREventCategory,FieldValuesAsText/TIREventCategory` +
      `&$expand=FieldValuesAsText` +
      `&$filter=(${idFilter})&$top=5000`;

    log("Site Pages fetch URL:", url);

    const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await readOkJson(res as any, "site pages query");
    const rows = json.value || [];

    log("Site Pages rows returned:", rows.length, "for chunk ids:", g);

    // log each row summary (important for your issue)
    rows.slice(0, 10).forEach((r: any) => {
      const ct = getCtIdString(r);
      log("SitePage row:", {
        Id: r?.Id,
        Title: r?.Title,
        ContentTypeId: ct,
        Start: r?.TIREventStartDate,
        End: r?.TIREventEndDate,
      });
    });

    allRows.push(...rows);
  }

  return allRows;
};

export const fetchUpcomingEventsAndTraining = async (
  context: WebPartContext,
  listTitle: string = DEFAULT_LIST_TITLE,
  top: number = 5
): Promise<IUpcomingEventsFetchResult> => {
  log("START fetchUpcomingEventsAndTraining");
  const web = context.pageContext.web.absoluteUrl;
  const site = context.pageContext.site.absoluteUrl;
  log("Web:", web);
  log("Site:", site);
  log("ListTitle:", listTitle);

  const todayIso = getTodayLocalMidnightIso();
  const todayMs = new Date(todayIso).getTime();
  log("Today Local Midnight ISO:", todayIso);

  const userId = await getCurrentUserId(context);

  const [eventIds, trainingIds] = await Promise.all([
    fetchMyRegisteredEventIds(context, userId),
    fetchMyRegisteredTrainingIds(context, userId),
  ]);

  log("Registered eventIds:", eventIds);
  log("Registered trainingIds:", trainingIds);

  const [eventRowsRaw, trainingRowsRaw] = await Promise.all([
    fetchSitePagesByIds(context, listTitle, eventIds),
    fetchSitePagesByIds(context, listTitle, trainingIds),
  ]);

  log("Raw SitePages eventRows:", eventRowsRaw.length);
  log("Raw SitePages trainingRows:", trainingRowsRaw.length);

  // ---- Filter (CT + Upcoming) with reason logs ----
  const upcomingEventRows = (eventRowsRaw || []).filter((r: any) => {
    const ctId = getCtIdString(r);
    const ctOk = isCtStartsWith(ctId, ContentTypeId.EVENT);
    const upcomingOk = isUpcomingByDates(r?.TIREventStartDate, r?.TIREventEndDate, todayMs);

    if (!ctOk || !upcomingOk) {
      log("Filtered OUT event row:", {
        Id: r?.Id,
        Title: r?.Title,
        ContentTypeId: ctId,
        ctOk,
        Start: r?.TIREventStartDate,
        End: r?.TIREventEndDate,
        upcomingOk,
      });
    }
    return ctOk && upcomingOk;
  });

  const upcomingTrainingRows = (trainingRowsRaw || []).filter((r: any) => {
    const ctId = getCtIdString(r);
    const ctOk = isCtStartsWith(ctId, ContentTypeId.TRAINING);
    const upcomingOk = isUpcomingByDates(r?.TIREventStartDate, r?.TIREventEndDate, todayMs);

    if (!ctOk || !upcomingOk) {
      log("Filtered OUT training row:", {
        Id: r?.Id,
        Title: r?.Title,
        ContentTypeId: ctId,
        ctOk,
        Start: r?.TIREventStartDate,
        End: r?.TIREventEndDate,
        upcomingOk,
      });
    }
    return ctOk && upcomingOk;
  });

  log("Upcoming Events after CT+date filter:", upcomingEventRows.length);
  log("Upcoming Trainings after CT+date filter:", upcomingTrainingRows.length);

  // ---- Map to UI model ----
  const eventsData: IEventData[] = upcomingEventRows
    .sort((a: any, b: any) => {
      const sa = a?.TIREventStartDate ? new Date(a.TIREventStartDate).getTime() : 0;
      const sb = b?.TIREventStartDate ? new Date(b.TIREventStartDate).getTime() : 0;
      return sa - sb;
    })
    .map((item: any) => {
      const start = item.TIREventStartDate ? new Date(item.TIREventStartDate) : undefined;
      const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : undefined;

      // ✅ taxonomy label from FieldValuesAsText (already working in your UI now)
      const categoryLabel = String(item?.FieldValuesAsText?.TIREventCategory || "").trim();

      return {
        id: String(item.Id),
        eventImage: mapBannerUrl(item.BannerImageUrl),
        eventTitle: item.Title,
        eventCategory: categoryLabel,
        eventDate: start ? start.toLocaleDateString() : "",
        eventTime: mapTimeRange(start, end),
        eventLocation: item.TIRLocation || "",
        isRegistered: true,
      };
    })
    .slice(0, top);

  const trainingData: IEventData[] = upcomingTrainingRows
    .sort((a: any, b: any) => {
      const sa = a?.TIREventStartDate ? new Date(a.TIREventStartDate).getTime() : 0;
      const sb = b?.TIREventStartDate ? new Date(b.TIREventStartDate).getTime() : 0;
      return sa - sb;
    })
    .map((item: any) => {
      const start = item.TIREventStartDate ? new Date(item.TIREventStartDate) : undefined;
      const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : undefined;

      return {
        id: String(item.Id),
        eventImage: mapBannerUrl(item.BannerImageUrl),
        eventTitle: item.Title,
        eventCategory: "Training",
        eventDate: start ? start.toLocaleDateString() : "",
        eventTime: mapTimeRange(start, end),
        eventLocation: item.TIRLocation || "",
        isRegistered: true,
      };
    })
    .slice(0, top);

  log("FINAL eventsData:", eventsData);
  log("FINAL trainingData:", trainingData);
  log("END fetchUpcomingEventsAndTraining");

  return { eventsData, trainingData };
};
