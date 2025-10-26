export interface ISuggestItem {
  title: string;
  subtitle?: string;
  url: string;
  imageUrl?: string;
  kind: 'person' | 'page' | 'doc';
}