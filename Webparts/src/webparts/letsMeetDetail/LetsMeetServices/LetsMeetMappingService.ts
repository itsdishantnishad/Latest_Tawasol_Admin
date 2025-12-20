// src/webparts/letsMeetDetail/services/LetsMeetMappingService.ts
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PageVideoItem } from "./LetsMeetDataService";

export type ViewModel = {
  id: number;
  title: string;
  pageUrl: string;
  youtubeUrl: string;
  videoId: string;
  thumbMax: string;
  thumbHQ: string;
};

export class LetsMeetMappingService {
  constructor(private context: WebPartContext) {}

  public mapToViewModel(item: PageVideoItem): ViewModel | null {
    const youtubeUrl = (item?.LetsMeetYouTubeUrl || "").trim();
    if (!youtubeUrl) return null;

    const videoId = this.parseYouTubeId(youtubeUrl);
    if (!videoId) return null;

    const thumbMax = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const thumbHQ = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const absolute = this.toAbsoluteUrl(item.FileRef);

    return {
      id: item.Id,
      title: item.Title || "Let's Meet",
      pageUrl: absolute,
      youtubeUrl,
      videoId,
      thumbMax,
      thumbHQ,
    };
  }

  public mapToViewModels(items: PageVideoItem[]): ViewModel[] {
    return items
      .map((item) => this.mapToViewModel(item))
      .filter((vm): vm is ViewModel => vm !== null);
  }

  private toAbsoluteUrl(serverRelative: string): string {
    const webAbs = this.context.pageContext.web.absoluteUrl;
    const origin = new URL(webAbs).origin;
    return serverRelative.startsWith("http")
      ? serverRelative
      : `${origin}${serverRelative}`;
  }

  private parseYouTubeId(url: string): string | null {
    try {
      const u = new URL(url);

      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.replace("/", "").trim();
        return id || null;
      }

      const v = u.searchParams.get("v");
      if (v) return v;

      const parts = u.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];

      return null;
    } catch {
      return null;
    }
  }
}