import * as React from "react";
import {
  IAnnouncementBannerComponentProps,
  IAnnouncementBannerComponentState
} from "./IAnnouncementBannerProps";
import styles from "./AnnouncementBanner.module.scss";
import {
  listServices,
  AnnouncementBannerListItem
} from "../../services/listServices";
import { ListName } from "../../services/Constants";
import { FontIcon, PrimaryButton, Text } from "@fluentui/react";
import ThumbsUpAcknowledgeButton from "./ThumbsUpAcknowledgeButton";

export default class AnnouncementBannerComponent
  extends React.Component<IAnnouncementBannerComponentProps, IAnnouncementBannerComponentState> {

  private sharePointService: listServices;
  private currentUserKey: string;
  private localStorageAcknowledgedMapKey: string;
  private thumbsUpHideAnimationMs = 900;

  constructor(props: IAnnouncementBannerComponentProps) {
    super(props);

    this.sharePointService = new listServices(props.context);

    // Build a per-user storage key (prefer email/UPN; fall back to loginName)
    const user = props.context.pageContext.user as any;
    const upn: string =
      (user?.email as string) ||
      (user?.loginName as string) ||
      "anonymous";
    this.currentUserKey = (upn || "anonymous").toLowerCase();
    this.localStorageAcknowledgedMapKey = `tir_announcement_ack_v1::${this.currentUserKey}`;

    this.state = {
      isLoading: true,
      activeItems: [],
      acknowledgedItemMap: this.getAcknowledgedMapFromLocalStorage(),
      errorMessage: undefined,
      acknowledgingItemId: undefined,
      isShowingThumbsUpAnimation: false
    };
  }

  public componentDidMount(): void {
    void this.loadActiveAnnouncementsFromList();
  }

  // ---------- Persistence (per user) ----------
  private getAcknowledgedMapFromLocalStorage(): Record<number, boolean> {
    try {
      const serialized = window.localStorage.getItem(this.localStorageAcknowledgedMapKey);
      return serialized ? JSON.parse(serialized) : {};
    } catch {
      return {};
    }
  }

  private saveAcknowledgedMapToLocalStorage(updatedMap: Record<number, boolean>): void {
    try {
      window.localStorage.setItem(this.localStorageAcknowledgedMapKey, JSON.stringify(updatedMap));
    } catch { /* ignore quota errors */ }
  }

  // ---------- Data ----------
  private async loadActiveAnnouncementsFromList(): Promise<void> {
    try {
      const resolvedListTitle = this.props.listTitle || ListName.ANNOUNCEMENT_BANNER;
      const activeItems = await this.sharePointService.getActiveAnnouncementBannersByListTitle(resolvedListTitle);
      this.setState({ activeItems, isLoading: false, errorMessage: undefined });
    } catch (loadError: any) {
      this.setState({
        isLoading: false,
        errorMessage: loadError?.message || "Unable to load announcement banners.",
        activeItems: []
      });
    }
  }
  private handleNotedClick = (itemId: number): void => {
    const nextAcknowledged = { ...this.state.acknowledgedItemMap, [itemId]: true };
    this.saveAcknowledgedMapToLocalStorage(nextAcknowledged);
    this.setState({
      acknowledgedItemMap: nextAcknowledged,
      acknowledgingItemId: itemId,
      isShowingThumbsUpAnimation: true
    });

    window.setTimeout(() => {
      this.setState({ isShowingThumbsUpAnimation: false });
    }, this.thumbsUpHideAnimationMs);
  };

  // ---------- Icon source ----------
  private renderIconForItem(item: AnnouncementBannerListItem): React.ReactNode {
    if (item.iconUrl) {
      return <img className={styles.iconImg} src={item.iconUrl} alt="" />;
    }
    // Fallback only if TIRIconURL is empty
    return <FontIcon iconName="Warning" className={styles.iconFallback} aria-label="Announcement" />;
  }

  public render(): React.ReactElement<IAnnouncementBannerComponentProps> | null {
    const {
      isLoading,
      errorMessage,
      activeItems,
      acknowledgedItemMap,
      acknowledgingItemId,
      isShowingThumbsUpAnimation
    } = this.state;

    if (isLoading || errorMessage) return null;

    const firstActiveItem: AnnouncementBannerListItem | undefined = activeItems[0];
    if (!firstActiveItem) return null;

    const isAcknowledgedByThisUser = !!acknowledgedItemMap[firstActiveItem.id];
    const isAnimatingThisItem = isShowingThumbsUpAnimation && acknowledgingItemId === firstActiveItem.id;

    return (
      <div className={styles.wrap} role="region" aria-label="Announcement">
        <div className={styles.card}>
          <div className={styles.iconCol}>{this.renderIconForItem(firstActiveItem)}</div>

          <div className={styles.contentCol}>
            <Text variant="large" className={styles.title}>
              {firstActiveItem.title}
            </Text>
            {!!firstActiveItem.description && (
              <p className={styles.desc}>{firstActiveItem.description}</p>
            )}
          </div>

          <div className={styles.actionCol}>
            <ThumbsUpAcknowledgeButton
              className={undefined /* your own wrapper class if needed */}
              buttonText="Noted 🤞🏻"
              acknowledged={!!acknowledgedItemMap[firstActiveItem.id]}
              onAcknowledge={() => this.handleNotedClick(firstActiveItem.id)}
              animationDurationMs={900}
            />
          </div>
        </div>
      </div>
    );
  }
}
