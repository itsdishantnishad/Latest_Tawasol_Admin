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

const DEFAULT_LIST_TITLE = "Site Pages";

// Registration lists
const REGISTERED_EVENTS_LIST = "Registered User Event";
const REGISTERED_TRAINING_LIST = "Registered Training";

// Registration internal fields
const REG_EVENTS_IDS_FIELD = "TIRRegisteredUsers"; // expected: "130, 129, 166"
const REG_TRAINING_ID_FIELD = "TIRTrainingID"; // number

const escOData = (s: string): string => (s || "").replace(/'/g, "''");

const uniqNums = (arr: number[]): number[] =>
  Array.from(new Set((arr || []).map(Number).filter((n) => Number.isFinite(n) && n > 0)));

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const readOkJson = async (res: Response, label: string): Promise<any> => {
  if (!res.ok) throw new Error(`${label} failed: ${res.status} ${res.statusText}`);
  return res.json();
};

const getTodayLocalMidnightIso = (): string => {
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

const getCtIdString = (item: any): string => {
  const raw = item?.ContentTypeId;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return String(raw?.StringValue || "");
};

const isCtStartsWith = (ctId: string, prefix: string): boolean =>
  (ctId || "").toLowerCase().startsWith((prefix || "").toLowerCase());

const isUpcomingByDates = (startIso?: string, endIso?: string, todayMs?: number): boolean => {
  const t = todayMs ?? Date.now();
  const start = startIso ? new Date(startIso) : undefined;
  const end = endIso ? new Date(endIso) : undefined;

  if (end && !isNaN(end.getTime())) return end.getTime() >= t;
  if (start && !isNaN(start.getTime())) return start.getTime() >= t;

  return true;
};

/** STRICT: only full numeric tokens allowed */
const parseNumericCsvIds = (raw: any): number[] => {
  const text = String(raw ?? "").trim();
  if (!text) return [];

  const tokens = text
    .split(/[,\n\r]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const ids = tokens
    .filter((t) => /^\d+$/.test(t))
    .map((t) => parseInt(t, 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  return uniqNums(ids);
};

const getCurrentUserId = async (context: WebPartContext): Promise<number> => {
  const legacyId = (context.pageContext as any)?.legacyPageContext?.userId;
  if (legacyId) return Number(legacyId);

  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const res = await context.spHttpClient.get(
    `${webUrl}/_api/web/currentuser?$select=Id`,
    SPHttpClient.configurations.v1
  );
  const json = await readOkJson(res as any, "currentuser");
  return Number(json?.Id || 0);
};

/** Taxonomy helpers */
const extractWssIds = (val: any): number[] => {
  if (val == null) return [];

  if (typeof val === "number") return [val];

  // "44;#Celebrations|<guid>" OR "44;#Celebrations"
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    const parts = s.split(";#");
    const id = parseInt(parts[0], 10);
    return isNaN(id) ? [] : [id];
  }

  if (Array.isArray(val)) {
    const ids: number[] = [];
    for (const v of val) ids.push(...extractWssIds(v));
    return uniqNums(ids);
  }

  if (typeof val === "object") {
    const id = Number(val?.WssId ?? val?.wssId ?? val?.Id ?? 0);
    return id ? [id] : [];
  }

  return [];
};

const normalizeTaxText = (raw: any): string => {
  const s = String(raw ?? "").trim();
  if (!s) return "";

  // Common REST shapes: "44;#Celebrations|guid" OR "44;#Celebrations"
  if (s.includes(";#")) {
    const after = s.split(";#")[1] || "";
    const label = after.split("|")[0]?.trim() || "";
    return label && !/^\d+$/.test(label) ? label : "";
  }

  // If it's just a number, ignore (WssId)
  if (/^\d+$/.test(s)) return "";

  return s;
};

const fetchTaxonomyTitlesByWssId = async (
  context: WebPartContext,
  wssIds: number[]
): Promise<Map<number, string>> => {
  const map = new Map<number, string>();
  const ids = uniqNums(wssIds || []);
  if (!ids.length) return map;

  // IMPORTANT: TaxonomyHiddenList is at site collection root
  const siteAbs = context.pageContext.site.absoluteUrl.replace(/\/$/, "");
  const groups = chunk(ids, 40);

  for (const g of groups) {
    const filter = g.map((id) => `Id eq ${id}`).join(" or ");
    const url =
      `${siteAbs}/_api/web/lists/getbytitle('TaxonomyHiddenList')/items` +
      `?$select=Id,Title&$filter=${filter}`;

    const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!res.ok) continue;

    const json = await res.json();
    (json.value || []).forEach((row: any) => {
      const id = Number(row?.Id);
      const title = String(row?.Title || "").trim();
      if (id && title) map.set(id, title);
    });
  }

  return map;
};

const fetchMyRegisteredEventIds = async (context: WebPartContext, userId: number): Promise<number[]> => {
  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");

  const url =
    `${webUrl}/_api/web/lists/getbytitle('${escOData(REGISTERED_EVENTS_LIST)}')/items` +
    `?$select=Id,AuthorId,${REG_EVENTS_IDS_FIELD}` +
    `&$filter=AuthorId eq ${userId}` +
    `&$top=5000`;

  const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
  const json = await readOkJson(res as any, "registered events list");
  const rows: any[] = json.value || [];

  const all: number[] = [];
  rows.forEach((r) => all.push(...parseNumericCsvIds(r?.[REG_EVENTS_IDS_FIELD])));
  return uniqNums(all);
};

const fetchMyRegisteredTrainingIds = async (context: WebPartContext, userId: number): Promise<number[]> => {
  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");

  const url =
    `${webUrl}/_api/web/lists/getbytitle('${escOData(REGISTERED_TRAINING_LIST)}')/items` +
    `?$select=Id,AuthorId,${REG_TRAINING_ID_FIELD}` +
    `&$filter=AuthorId eq ${userId}` +
    `&$top=5000`;

  const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
  const json = await readOkJson(res as any, "registered training list");
  const rows: any[] = json.value || [];

  const ids = rows
    .map((r) => Number(r?.[REG_TRAINING_ID_FIELD]))
    .filter((n) => Number.isFinite(n) && n > 0);

  return uniqNums(ids);
};

const fetchSitePagesByIds = async (
  context: WebPartContext,
  listTitle: string,
  ids: number[]
): Promise<any[]> => {
  const webUrl = context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const cleanIds = uniqNums(ids);
  if (!cleanIds.length) return [];

  const groups = chunk(cleanIds, 40);
  const allRows: any[] = [];

  for (const g of groups) {
    const idFilter = g.map((id) => `Id eq ${id}`).join(" or ");

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${escOData(listTitle)}')/items` +
      `?$select=Id,Title,FileRef,ContentTypeId,TIRLocation,TIREventStartDate,TIREventEndDate,BannerImageUrl,` +
      `TIREventCategory,FieldValuesAsText` +
      `&$expand=FieldValuesAsText` +
      `&$filter=(${idFilter})&$top=5000`;

    const res = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await readOkJson(res as any, "site pages query");
    allRows.push(...(json.value || []));
  }

  return allRows;
};

export const fetchUpcomingEventsAndTraining = async (
  context: WebPartContext,
  listTitle: string = DEFAULT_LIST_TITLE,
  top: number = 5
): Promise<IUpcomingEventsFetchResult> => {
  const todayIso = getTodayLocalMidnightIso();
  const todayMs = new Date(todayIso).getTime();

  const userId = await getCurrentUserId(context);

  const [eventIds, trainingIds] = await Promise.all([
    fetchMyRegisteredEventIds(context, userId),
    fetchMyRegisteredTrainingIds(context, userId),
  ]);

  const [eventRowsRaw, trainingRowsRaw] = await Promise.all([
    fetchSitePagesByIds(context, listTitle, eventIds),
    fetchSitePagesByIds(context, listTitle, trainingIds),
  ]);

  const upcomingEventRows = (eventRowsRaw || []).filter((r: any) => {
    const ctId = getCtIdString(r);
    return (
      isCtStartsWith(ctId, ContentTypeId.EVENT) &&
      isUpcomingByDates(r?.TIREventStartDate, r?.TIREventEndDate, todayMs)
    );
  });

  const upcomingTrainingRows = (trainingRowsRaw || []).filter((r: any) => {
    const ctId = getCtIdString(r);
    return (
      isCtStartsWith(ctId, ContentTypeId.TRAINING) &&
      isUpcomingByDates(r?.TIREventStartDate, r?.TIREventEndDate, todayMs)
    );
  });

  // Resolve taxonomy labels for Event Category
  const allWssIds: number[] = [];
  upcomingEventRows.forEach((r: any) => allWssIds.push(...extractWssIds(r?.TIREventCategory)));
  const labelMap = await fetchTaxonomyTitlesByWssId(context, allWssIds);

  const eventsData: IEventData[] = upcomingEventRows
    .sort((a: any, b: any) => {
      const sa = a?.TIREventStartDate ? new Date(a.TIREventStartDate).getTime() : 0;
      const sb = b?.TIREventStartDate ? new Date(b.TIREventStartDate).getTime() : 0;
      return sa - sb;
    })
    .map((item: any) => {
      const start = item.TIREventStartDate ? new Date(item.TIREventStartDate) : undefined;
      const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : undefined;

      // 1) try readable label from FieldValuesAsText
      const fvatLabel = normalizeTaxText(item?.FieldValuesAsText?.TIREventCategory);

      // 2) else resolve by WssId via TaxonomyHiddenList
      const ids = extractWssIds(item?.TIREventCategory);
      const hiddenLabel = ids.length ? labelMap.get(ids[0]) || "" : "";

      return {
        id: String(item.Id),
        eventImage: mapBannerUrl(item.BannerImageUrl),
        eventTitle: item.Title,
        eventCategory: fvatLabel || hiddenLabel,
        eventDate: item?.TIREventStartDate || (start ? start.toISOString() : ""),
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
        eventDate: item?.TIREventStartDate || (start ? start.toISOString() : ""),
        eventTime: mapTimeRange(start, end),
        eventLocation: item.TIRLocation || "",
        isRegistered: true,
      };
    })
    .slice(0, top);

  return { eventsData, trainingData };
};
