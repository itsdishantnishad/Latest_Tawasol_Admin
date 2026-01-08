import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from "@microsoft/sp-http";

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

const getTodayUtcIso = (): string => {
  const now = new Date();
  const utcMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return utcMidnight.toISOString();
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

export const fetchUpcomingEventsAndTraining = async (
  context: WebPartContext,
  listTitle: string = DEFAULT_LIST_TITLE,
  top: number = 5
): Promise<IUpcomingEventsFetchResult> => {
  const webUrl = context.pageContext.web.absoluteUrl;
  const todayIso = getTodayUtcIso();

  const eventsUrl =
    `${webUrl}/_api/web/lists/getbytitle('${listTitle}')/items` +
    `?$select=Id,Title,ContentType,TIREventCategory,TIRLocation,TIREventStartDate,TIREventEndDate,BannerImageUrl` +
    `&$filter=ContentType eq 'TIR Event' and TIREventStartDate ge datetime'${todayIso}'` +
    `&$orderby=TIREventStartDate asc&$top=${top}`;

  const trainingsUrl =
    `${webUrl}/_api/web/lists/getbytitle('${listTitle}')/items` +
    `?$select=Id,Title,ContentType,TIRLocation,TIREventStartDate,TIREventEndDate,BannerImageUrl` +
    `&$filter=ContentType eq 'TIR Training' and TIREventStartDate ge datetime'${todayIso}'` +
    `&$orderby=TIREventStartDate asc&$top=${top}`;

  const [eventsRes, trainingsRes] = await Promise.all([
    context.spHttpClient.get(eventsUrl, SPHttpClient.configurations.v1),
    context.spHttpClient.get(trainingsUrl, SPHttpClient.configurations.v1),
  ]);

  const eventsJson = await eventsRes.json();
  const trainingsJson = await trainingsRes.json();

  const eventsData: IEventData[] = (eventsJson.value || []).map((item: any) => {
    const start = item.TIREventStartDate ? new Date(item.TIREventStartDate) : undefined;
    const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : undefined;

    let category = "";
    const cat = item.TIREventCategory;
    if (cat) category = cat.Label || cat;

    return {
      id: String(item.Id),
      eventImage: mapBannerUrl(item.BannerImageUrl),
      eventTitle: item.Title,
      eventCategory: category,
      eventDate: start ? start.toLocaleDateString() : "",
      eventTime: mapTimeRange(start, end),
      eventLocation: item.TIRLocation || "",
      isRegistered: true,
    };
  });

  const trainingData: IEventData[] = (trainingsJson.value || []).map((item: any) => {
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
      isRegistered: false,
    };
  });

  return { eventsData, trainingData };
};
