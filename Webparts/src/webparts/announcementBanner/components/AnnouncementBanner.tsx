import * as React from "react";
import {
  IAnnouncementBannerComponentProps,
  IAnnouncementBannerComponentState,
} from "./IAnnouncementBannerProps";
import styles from "./AnnouncementBanner.module.scss";
import {
  listServices,
  AnnouncementBannerListItem,
} from "../../services/listServices";
import { ListName } from "../../services/Constants";
import { Text } from "@fluentui/react";

// ✅ Local fallback icon (danger.png)
// Current component path: webparts/announcementBanner/components
// Your image is in: webparts/aboutDhreQuote/assets/danger.png
const dangerIcon: string = require("../../aboutDhreQuote/assets/Alert.svg");

export default class AnnouncementBannerComponent extends React.Component<
  IAnnouncementBannerComponentProps,
  IAnnouncementBannerComponentState
> {
  private sharePointService: listServices;
  private currentUserStorageKey: string;
  private localStorageAcknowledgedKey: string;

  constructor(props: IAnnouncementBannerComponentProps) {
    super(props);

    this.sharePointService = new listServices(props.context);

    const spUser: any = props.context.pageContext.user;
    const upn =
      (spUser?.email as string) ||
      (spUser?.loginName as string) ||
      "anonymous";

    this.currentUserStorageKey = (upn || "anonymous").toLowerCase();
    this.localStorageAcknowledgedKey = `tir_announcement_ack_v1::${this.currentUserStorageKey}`;

    this.state = {
      isLoading: true,
      errorMessage: undefined,
      activeItems: [],
      acknowledgedItemMap: this.readAcknowledgedMap(),
      acknowledgingItemId: undefined,
      isShowingThumbsUpAnimation: false,
    };
  }

  public componentDidMount(): void {
    void this.loadActiveAnnouncements();
  }

  private readAcknowledgedMap(): Record<number, boolean> {
    try {
      const raw = window.localStorage.getItem(this.localStorageAcknowledgedKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private async loadActiveAnnouncements(): Promise<void> {
    try {
      const listTitle = this.props.listTitle || ListName.ANNOUNCEMENT_BANNER;
      const activeItems =
        await this.sharePointService.getActiveAnnouncementBannersByListTitle(
          listTitle
        );
      this.setState({ activeItems, isLoading: false, errorMessage: undefined });
    } catch (e: any) {
      this.setState({
        isLoading: false,
        errorMessage: e?.message || "Unable to load announcement banners.",
        activeItems: [],
      });
    }
  }

  // ✅ Icon comes from SharePoint field iconUrl; fallback is local danger.png
  private renderLeadIcon(item: AnnouncementBannerListItem): React.ReactNode {
    const src = item.iconUrl ? item.iconUrl : dangerIcon;
    return <img className={styles.iconImg} src={src} alt="Announcement" />;
  }

  public render(): React.ReactElement<IAnnouncementBannerComponentProps> | null {
    const { isLoading, errorMessage, activeItems } = this.state;

    if (isLoading || errorMessage) return null;

    const firstActiveItem: AnnouncementBannerListItem | undefined =
      activeItems[0];
    if (!firstActiveItem) return null;

    return (
      <div className={styles.wrap} role="region" aria-label="Announcement">
        <div className={styles.card}>
          <div className={styles.iconCol}>
            {this.renderLeadIcon(firstActiveItem)}
          </div>

          <div className={styles.contentCol}>
            <Text variant="large" className={styles.title}>
              {firstActiveItem.title}
            </Text>

            {!!firstActiveItem.description && (
              <p className={styles.desc}>{firstActiveItem.description}</p>
            )}
          </div>

          <div className={styles.actionCol}>{/* buttons commented */}</div>
        </div>
      </div>
    );
  }
}
