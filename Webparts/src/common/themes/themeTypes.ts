export type TawasolThemeKey = "default" | "uaeNationalDay";

export interface IThemePaletteSignature {
  slots: Partial<Record<string, string>>;
}

export interface IBrandHeroConfig {
  variant: "brand";
  leadingText?: string;
  accentText: string;
  trailingText?: string;
}

export interface ICelebrationHeroConfig {
  variant: "celebration";
  title: string;
  subTitle: string;
  showFlags: boolean;
  showSparkles: boolean;
  useTitleArt?: boolean;
}

export type IFeatureWheelHeroConfig =
  | IBrandHeroConfig
  | ICelebrationHeroConfig;

export interface ITawasolThemeConfig {
  key: TawasolThemeKey;
  tenantThemeName?: string;
  detectByPalette?: IThemePaletteSignature;
  featureWheel: {
    hero: IFeatureWheelHeroConfig;
  };
}