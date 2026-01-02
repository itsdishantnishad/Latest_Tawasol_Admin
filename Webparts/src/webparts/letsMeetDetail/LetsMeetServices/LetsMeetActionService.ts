
export class LetsMeetActionService {
  public static getEmbedUrl(videoId: string): string {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  public static navigateToPage(pageUrl: string): void {
    window.location.href = pageUrl;
  }

  public static handleThumbnailFallback(
    ev: React.SyntheticEvent<HTMLImageElement, Event>,
    fallbackSrc: string
  ): void {
    const img = ev.currentTarget;
    if (img && img.src !== fallbackSrc) {
      img.src = fallbackSrc;
    }
  }
}