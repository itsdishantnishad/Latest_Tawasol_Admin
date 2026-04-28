import type { IReadonlyTheme } from "@microsoft/sp-component-base";

export type TawasolThemeKey = "default" | "uaeNationalDay";

export interface IThemePaletteSignature {
  slots: Partial<Record<string, string>>;
}

export interface IHeaderBrandThemeConfig {
  showFlagNearLogo: boolean;
  flagWidth: number;
  flagHeight: number;
  flagGap: number;
}

export interface IExtensionThemeConfig {
  key: TawasolThemeKey;
  tenantThemeName?: string;
  detectByPalette?: IThemePaletteSignature;
  header: {
    brand: IHeaderBrandThemeConfig;
  };
}

export interface IResolvedExtensionTheme {
  themeKey: TawasolThemeKey;
  config: IExtensionThemeConfig;
  themeVariant?: IReadonlyTheme;
}