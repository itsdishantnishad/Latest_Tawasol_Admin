export class PhotoService {
  private readonly webUrl: string;
  private readonly currentUserUpn: string;

  constructor(webUrl: string, currentUserUpn: string) {
    this.webUrl = webUrl || '';
    this.currentUserUpn = currentUserUpn || '';
  }

  private buildUrl(size: 'S' | 'M' | 'L', upn?: string): string {
    const email = (upn || this.currentUserUpn || '').trim();
    const ver = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const userParam = email ? `&username=${encodeURIComponent(email)}` : '';
    return `${this.webUrl}/_layouts/15/userphoto.aspx?size=${size}${userParam}&ver=${ver}`;
  }

  getSmall(upn?: string): string  { return this.buildUrl('S', upn); }
  getMedium(upn?: string): string { return this.buildUrl('M', upn); }
  getLarge(upn?: string): string  { return this.buildUrl('L', upn); }
}
