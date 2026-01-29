import { DisplayMode } from "@microsoft/sp-core-library";
import { IBannerWebPartProps } from "../GlobalBannerWebPart";

export interface IBannerProps extends IBannerWebPartProps {
  displayMode: DisplayMode;
}
