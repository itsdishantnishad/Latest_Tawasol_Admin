import type { IExtensionThemeConfig } from "./themeTypes";

export const EXTENSION_THEME_REGISTRY: Record<
  "default" | "uaeNationalDay",
  IExtensionThemeConfig
> = {
  default: {
    key: "default",
    tenantThemeName: "TawasolTheme",
    header: {
      brand: {
        showFlagNearLogo: false,
        flagWidth: 36,
        flagHeight: 30,
        flagGap: 12
      }
    }
  },

  uaeNationalDay: {
    key: "uaeNationalDay",
    tenantThemeName: "DHRE - UAE National Day",
    detectByPalette: {
      slots: {
        themePrimary: "#202D39",
        bodyBackground: "#FFF4EA",
        bodyText: "#323130",
        neutralQuaternaryAlt: "#dad1ca"
      }
    },
    header: {
      brand: {
        showFlagNearLogo: true,
        flagWidth: 36,
        flagHeight: 30,
        flagGap: 12
      }
    }
  }
};