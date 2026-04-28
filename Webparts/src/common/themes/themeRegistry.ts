import type { ITawasolThemeConfig } from "./themeTypes";

export const TAWASOL_THEME_REGISTRY: Record<
  "default" | "uaeNationalDay",
  ITawasolThemeConfig
> = {
  default: {
    key: "default",
    tenantThemeName: "TawasolTheme",
    featureWheel: {
      hero: {
        variant: "brand",
        accentText: "Tawasol",
        trailingText: ", The smarter way to stay connected",
      },
    },
  },

  uaeNationalDay: {
    key: "uaeNationalDay",
    tenantThemeName: "DHRE - UAE National Day",
    detectByPalette: {
      slots: {
        themePrimary: "#202D39",
        bodyBackground: "#FFF4EA",
        bodyText: "#323130",

        /**
         * Marker slot:
         * Make this value slightly different only in the
         * "DHRE - UAE National Day" tenant theme.
         *
         * Example:
         * TawasolTheme            -> #dad1c9
         * DHRE - UAE National Day -> #dad1ca
         */
        neutralQuaternaryAlt: "#dad1ca",
      },
    },
    featureWheel: {
      hero: {
        variant: "celebration",
        title: "Celebrating 52nd UAE National Day!",
        subTitle:
          "Proudly celebrating the spirit of Union Day with unity and pride",
        showFlags: true,
        showSparkles: true,
        useTitleArt: true,
      },
    },
  },
};