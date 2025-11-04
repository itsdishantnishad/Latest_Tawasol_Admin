import { IBannerWebPartProps, BannerType } from "../GlobalBannerWebPart";

export interface IBannerProps extends IBannerWebPartProps {
  bannerType: BannerType;
}
