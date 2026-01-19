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

export default class AnnouncementBannerComponent
  extends React.Component<IAnnouncementBannerComponentProps, IAnnouncementBannerComponentState> {

  private sharePointService: listServices;
  private currentUserStorageKey: string;
  private localStorageAcknowledgedKey: string;
  // private animationDurationMs = 900; 

  constructor(props: IAnnouncementBannerComponentProps) {
    super(props);

    this.sharePointService = new listServices(props.context);

    // Per-user storage key (prefer email/UPN; fall back to loginName)
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
      isShowingThumbsUpAnimation: false
    };
  }

  public componentDidMount(): void {
    void this.loadActiveAnnouncements();
  }

  // ---------- Persistence (per user) ----------
  private readAcknowledgedMap(): Record<number, boolean> {
    try {
      const raw = window.localStorage.getItem(this.localStorageAcknowledgedKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  // private writeAcknowledgedMap(map: Record<number, boolean>): void {
  //   try {
  //     window.localStorage.setItem(this.localStorageAcknowledgedKey, JSON.stringify(map));
  //   } catch { /* ignore */ }
  // }

  // ---------- Data ----------
  private async loadActiveAnnouncements(): Promise<void> {
    try {
      const listTitle = this.props.listTitle || ListName.ANNOUNCEMENT_BANNER;
      const activeItems = await this.sharePointService.getActiveAnnouncementBannersByListTitle(listTitle);
      this.setState({ activeItems, isLoading: false, errorMessage: undefined });
    } catch (e: any) {
      this.setState({
        isLoading: false,
        errorMessage: e?.message || "Unable to load announcement banners.",
        activeItems: []
      });
    }
  }

  // ---------- UX: Noted -> CSS 👍 pop -> persist + keep banner with static 👍 ----------
  // private handleNotedClick = (itemId: number): void => {
  //   const acknowledgedNext = { ...this.state.acknowledgedItemMap, [itemId]: true };
  //   this.writeAcknowledgedMap(acknowledgedNext);

  //   this.setState({
  //     acknowledgedItemMap: acknowledgedNext,
  //     acknowledgingItemId: itemId,
  //     isShowingThumbsUpAnimation: true
  //   });

  //   window.setTimeout(() => {
  //     this.setState({ isShowingThumbsUpAnimation: false });
  //     // keep acknowledgedItemMap[itemId] = true so after refresh we still show static 👍
  //   }, this.animationDurationMs);
  // };

  // Icon comes from TIRIconURL; fallback only when empty
  private renderLeadIcon(item: AnnouncementBannerListItem): React.ReactNode {
    if (item.iconUrl) {
      return <img className={styles.iconImg} src={item.iconUrl} alt="" />;
    }
    return <FontIcon iconName="Warning" className={styles.iconFallback} aria-label="Announcement" />;
  }

  public render(): React.ReactElement<IAnnouncementBannerComponentProps> | null {
    const {
      isLoading,
      errorMessage,
      activeItems,
      // acknowledgedItemMap,
      // acknowledgingItemId,
      // isShowingThumbsUpAnimation
    } = this.state;

    if (isLoading || errorMessage) return null;

    // Show first active item (if you later want multiple, map over activeItems)
    const firstActiveItem: AnnouncementBannerListItem | undefined = activeItems[0];
    if (!firstActiveItem) return null;

    // const isAcknowledgedByUser = !!acknowledgedItemMap[firstActiveItem.id];
    // const isAnimatingThisItem = isShowingThumbsUpAnimation && acknowledgingItemId === firstActiveItem.id;

    return (
      <div className={styles.wrap} role="region" aria-label="Announcement">
        <div className={styles.card}>
          <div className={styles.iconCol}>{this.renderLeadIcon(firstActiveItem)}</div>

          <div className={styles.contentCol}>
            <Text variant="large" className={styles.title}>
              {firstActiveItem.title}
            </Text>
            {!!firstActiveItem.description && (
              <p className={styles.desc}>{firstActiveItem.description}</p>
            )}
          </div>

          <div className={styles.actionCol}>
            {/* When clicked: animate 👍 once */}
            {/* {isAnimatingThisItem && (
              <div className={styles.thumbsUpAnimation} aria-hidden="true">👍</div>
            )} */}

            {/* After acknowledged: persistent 👍 */}
            {/* {!isAnimatingThisItem && isAcknowledgedByUser && (
              <div className={styles.thumbsUpStatic} title="Acknowledged">👍</div>
            )} */}

            {/* Before acknowledged: show Noted button */}
            {/* {!isAnimatingThisItem && !isAcknowledgedByUser && (
              <PrimaryButton
                text="Noted 🤞🏻"
                onClick={() => this.handleNotedClick(firstActiveItem.id)}
              />
            )} */}
          </div>
        </div>
      </div>
    );
  }
}
