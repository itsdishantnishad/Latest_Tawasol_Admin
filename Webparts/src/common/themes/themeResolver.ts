import type { IReadonlyTheme } from "@microsoft/sp-component-base";
import { TAWASOL_THEME_REGISTRY } from "./themeRegistry";
import type {
  ITawasolThemeConfig,
  IThemePaletteSignature,
  TawasolThemeKey,
} from "./themeTypes";

const normalize = (value?: string): string =>
  (value || "").trim().toLowerCase();

const getComparableSlots = (
  themeVariant?: IReadonlyTheme
): Record<string, string | undefined> => {
  const palette = (themeVariant?.palette || {}) as Record<string, string | undefined>;
  const semanticColors = (themeVariant?.semanticColors || {}) as Record<
    string,
    string | undefined
  >;

  return {
    ...palette,
    ...semanticColors,

    // explicit semantic fallbacks
    bodyBackground: semanticColors.bodyBackground || palette.white,
    bodyText: semanticColors.bodyText || palette.neutralPrimary,
  };
};

const matchesSignature = (
  themeVariant: IReadonlyTheme | undefined,
  signature?: IThemePaletteSignature
): boolean => {
  if (!themeVariant || !signature?.slots) {
    return false;
  }

  const current = getComparableSlots(themeVariant);
  const entries = Object.entries(signature.slots);

  if (!entries.length) {
    return false;
  }

  for (const [slot, expected] of entries) {
    if (!expected) {
      continue;
    }

    if (normalize(current[slot]) !== normalize(expected)) {
      return false;
    }
  }

  return true;
};

export const resolveTawasolThemeKey = (
  themeVariant?: IReadonlyTheme
): TawasolThemeKey => {
  if (
    matchesSignature(
      themeVariant,
      TAWASOL_THEME_REGISTRY.uaeNationalDay.detectByPalette
    )
  ) {
    return "uaeNationalDay";
  }

  return "default";
};

export const getActiveThemeConfig = (
  themeVariant?: IReadonlyTheme
): ITawasolThemeConfig => {
  const key = resolveTawasolThemeKey(themeVariant);
  return TAWASOL_THEME_REGISTRY[key];
};