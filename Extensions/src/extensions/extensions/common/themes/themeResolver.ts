import type { IReadonlyTheme } from "@microsoft/sp-component-base";
import { EXTENSION_THEME_REGISTRY } from "./themeRegistry";
import type {
  IExtensionThemeConfig,
  IThemePaletteSignature,
  TawasolThemeKey
} from "./themeTypes";

const normalize = (value?: string): string =>
  (value || "").trim().toLowerCase();

const getComparableSlots = (
  themeVariant?: IReadonlyTheme
): Record<string, string | undefined> => {
  const palette = (themeVariant?.palette || {}) as Record<string, string | undefined>;
  const semanticColors = (themeVariant?.semanticColors || {}) as Record<string, string | undefined>;

  return {
    ...palette,
    ...semanticColors,
    bodyBackground: semanticColors.bodyBackground || palette.white,
    bodyText: semanticColors.bodyText || palette.neutralPrimary
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
    if (!expected) continue;
    if (normalize(current[slot]) !== normalize(expected)) {
      return false;
    }
  }

  return true;
};

export const resolveExtensionThemeKey = (
  themeVariant?: IReadonlyTheme
): TawasolThemeKey => {
  if (
    matchesSignature(
      themeVariant,
      EXTENSION_THEME_REGISTRY.uaeNationalDay.detectByPalette
    )
  ) {
    return "uaeNationalDay";
  }

  return "default";
};

export const getActiveExtensionThemeConfig = (
  themeVariant?: IReadonlyTheme
): IExtensionThemeConfig => {
  const key = resolveExtensionThemeKey(themeVariant);
  return EXTENSION_THEME_REGISTRY[key];
};