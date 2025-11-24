export type CardType = 'imageCard' | 'textCard' | 'infoCard' | 'banner';

/** Optional grid span for precise layout */
export type Span = 4 | 6 | 12;

export interface BannerModel {
  title: string;
  subtitle?: string;
  icons?: string[];
}

export interface TabModel { key: 'medical' | 'privileges'; text: string; }

export interface BaseCard { type: CardType; span?: Span; }

/** Image card */
export interface ImageCard extends BaseCard {
  type: 'imageCard';
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaUrl?: string;
  imageOverride?: string;
  soft?: boolean;          // peach-tinted background
}

/** Text card */
export interface TextCard extends BaseCard {
  type: 'textCard';
  title: string;
  subtitle?: string;
  bullets?: string[];
  ctaText?: string;
  ctaUrl?: string;
  logoUrl?: string;        // small logo in top-left (Core Direction)
  soft?: boolean;          // peach-tinted background
  accentWords?: string[];  // words to color as accent (red)
}

/** Info card */
export interface InfoRow { label: string; value: string; }
export interface InfoCard extends BaseCard {
  type: 'infoCard';
  title: string;
  rows: InfoRow[];
  soft?: boolean;
}

/** Full-width promo banner */
export interface BigBanner extends BaseCard {
  type: 'banner';
  title: string;
  bullets?: string[];
  rightImageUrl?: string;
  badges?: { imageUrl: string; linkUrl: string }[];
  websiteUrl?: string;
  websiteText?: string;
}

export type AnyCard = ImageCard | TextCard | InfoCard | BigBanner;

export interface PayloadModel {
  banner: BannerModel;
  tabs: TabModel[];
  cards: AnyCard[];
}
  


