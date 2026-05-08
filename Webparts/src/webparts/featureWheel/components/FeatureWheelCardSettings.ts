export interface ICustomFeatureContentCardSettings {
  /** Optional unique id. If blank, it is generated from the title. */
  id?: string;
  /** Toggle from the property pane. Defaults to true. */
  enabled?: boolean;
  /** Text shown on the inner/basic content card. */
  title: string;
  /** Optional short text for the inner/basic content card. */
  description?: string;
  /** URL or small data URL used as the inner/basic content card image. */
  imageUrl?: string;
  /** URL opened when the inner/basic content card is clicked. */
  targetUrl?: string;
}

export interface ICustomFeatureCardSettings {
  /** Optional unique id. Keep this stable if you want to map this card to a coded React component. */
  id?: string;
  /** Toggle from the property pane. Defaults to true. */
  enabled?: boolean;
  /** Text shown on the wheel card. */
  title: string;
  /** Short text / card description. */
  description?: string;
  /** Backward-compatible alias for description. */
  subtitle?: string;
  /** Heading shown below the wheel when this card is selected. */
  header?: string;
  /** Sub-heading shown below the wheel when this card is selected. */
  subHeader?: string;
  /** URL or small data URL used as the wheel card background image. */
  imageUrl?: string;
  /** Optional fallback URL opened from this custom card if no inner cards are configured. */
  targetUrl?: string;
  /** Optional no-code inner cards shown below this custom wheel card. */
  contentCards?: ICustomFeatureContentCardSettings[];
}

export interface IResolvedCustomFeatureContentCardSettings
  extends ICustomFeatureContentCardSettings {
  id: string;
  title: string;
}

export interface IResolvedCustomFeatureCardSettings extends ICustomFeatureCardSettings {
  id: string;
  title: string;
  contentCards?: IResolvedCustomFeatureContentCardSettings[];
}

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

const readText = (value: unknown): string => String(value || "").trim();

const parseCustomFeatureContentCards = (
  rawCards?: ICustomFeatureContentCardSettings[] | unknown
): IResolvedCustomFeatureContentCardSettings[] => {
  if (!Array.isArray(rawCards)) return [];

  const usedIds = new Set<string>();

  return rawCards
    .map((item: any): IResolvedCustomFeatureContentCardSettings | undefined => {
      const title = readText(item?.title);
      const imageUrl = readText(item?.imageUrl);
      const targetUrl = readText(item?.targetUrl);
      const id = normalizeId(readText(item?.id) || title || `card_${usedIds.size + 1}`);

      if (!id || (!title && !imageUrl && !targetUrl)) return undefined;
      if (usedIds.has(id)) return undefined;

      usedIds.add(id);

      return {
        id,
        enabled: item?.enabled === false ? false : true,
        title,
        description: readText(item?.description) || undefined,
        imageUrl: imageUrl || undefined,
        targetUrl: targetUrl || undefined,
      };
    })
    .filter(
      (item): item is IResolvedCustomFeatureContentCardSettings =>
        !!item && item.enabled !== false
    );
};

export const parseCustomFeatureCards = (
  rawCards?: ICustomFeatureCardSettings[] | unknown
): IResolvedCustomFeatureCardSettings[] => {
  if (!Array.isArray(rawCards)) return [];

  const usedIds = new Set<string>();

  return rawCards
    .map((item: any): IResolvedCustomFeatureCardSettings | undefined => {
      const title = readText(item?.title);
      const id = normalizeId(readText(item?.id) || title);

      if (!id || !title) return undefined;
      if (usedIds.has(id)) return undefined;

      usedIds.add(id);

      const description = readText(item?.description || item?.subtitle);
      const header = readText(item?.header || title);
      const subHeader = readText(item?.subHeader || description);
      const contentCards = parseCustomFeatureContentCards(item?.contentCards);

      return {
        id,
        enabled: item?.enabled === false ? false : true,
        title,
        description: description || undefined,
        subtitle: description || undefined,
        header: header || undefined,
        subHeader: subHeader || undefined,
        imageUrl: readText(item?.imageUrl) || undefined,
        targetUrl: readText(item?.targetUrl) || undefined,
        contentCards,
      };
    })
    .filter((item): item is IResolvedCustomFeatureCardSettings => !!item && item.enabled !== false);
};

/** Optional migration helper for old pages that still have customCardsJson saved. */
export const parseCustomFeatureCardsJson = (
  rawJson?: string
): IResolvedCustomFeatureCardSettings[] => {
  const raw = readText(rawJson);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return parseCustomFeatureCards(parsed);
  } catch {
    return [];
  }
};
