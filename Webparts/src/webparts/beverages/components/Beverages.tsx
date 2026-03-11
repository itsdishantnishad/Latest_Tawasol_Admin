import * as React from "react";
import styles from "./Beverages.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Text, Spinner, SpinnerSize } from "@fluentui/react";
import { spfi, SPFx } from "@pnp/sp";
const chatBotIcon: string = require("../assets/ChatBot.svg");
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IBeveragesProps } from "./IBeveragesProps";

interface IBeverageItem {
  Id: number;
  Title: string;
  BMCategory?: string;
  BMIsActive?: boolean;
}

interface IBeveragesState {
  items: IBeverageItem[];
  loading: boolean;
  error?: string | null;
}

const LIST_DEFAULT = "Beverages Menu";

const HOT_IMG = require("../assets/HotBeveragesImg.svg");
const MILK_IMG = require("../assets/MilkAlternativeImg.svg");
const TEA_IMG = require("../assets/TeaMenuImg.svg");
const COLD_IMG = require("../assets/ColdBeveragesImg.svg");
const Ellipse_IMG = require("../assets/EllipseImg.svg");

export default class Beverages extends React.Component<
  IBeveragesProps,
  IBeveragesState
> {
  public static defaultProps: Partial<IBeveragesProps> = {
    listTitle: LIST_DEFAULT,
    showChatBot: true,
  };

  private sp = spfi().using(SPFx(this.props.context));
  private chatBotRef = React.createRef<HTMLAnchorElement>();
  private rafId: number | null = null;

  state: IBeveragesState = {
    items: [],
    loading: true,
    error: null,
  };

  componentDidMount(): void {
    this.loadItems();

    // only run floating loop if chatbot is enabled
    if (this.props.showChatBot !== false) {
      this.startFloatCheck();
    }
  }

  componentDidUpdate(prevProps: IBeveragesProps): void {
    const prevShow = prevProps.showChatBot !== false;
    const currShow = this.props.showChatBot !== false;

    // start/stop RAF when toggle changes
    if (prevShow !== currShow) {
      if (currShow) this.startFloatCheck();
      else this.stopFloatCheck();
    }
  }

  componentWillUnmount(): void {
    this.stopFloatCheck();
  }

  private async loadItems(): Promise<void> {
    try {
      const rawItems = await this.sp.web.lists
        .getByTitle(this.props.listTitle || LIST_DEFAULT)
        .items.select("Id", "Title", "TIRBMCategory", "TIRIsActive")
        .filter("TIRIsActive eq 1")
        .orderBy("Id", true)
        .top(500)();

      const items: IBeverageItem[] = rawItems.map((i: any) => ({
        Id: i.Id,
        Title: i.Title,
        BMCategory: i.TIRBMCategory,
        BMIsActive: i.TIRIsActive,
      }));

      this.setState({ items, loading: false });
    } catch (e: any) {
      this.setState({ loading: false, error: e?.message });
    }
  }

  private byCategory = (key: string) => (i: IBeverageItem) =>
    (i.BMCategory || "").toLowerCase().includes(key);

  private splitColumns(items: IBeverageItem[], rowsPerCol = 4): IBeverageItem[][] {
    const cols: IBeverageItem[][] = [];
    for (let i = 0; i < items.length; i += rowsPerCol) {
      cols.push(items.slice(i, i + rowsPerCol));
    }
    return cols;
  }

  private renderMenu(items: IBeverageItem[]) {
    if (!items.length) return null;

    const cols = this.splitColumns(items);

    return (
      <div className={styles.menuRow}>
        {cols.map((col, i) => (
          <div key={i} className={styles.menuCol}>
            {col.map((it) => (
              <div key={it.Id} className={styles.menuItem}>
                {it.Title}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ========== FLOATING CHATBOT LOGIC ==========
  private startFloatCheck(): void {
    // avoid multiple RAF loops
    if (this.rafId !== null) return;
    this.checkFloatPosition();
  }

  private stopFloatCheck(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // reset raise
    const chatBot = this.chatBotRef.current;
    if (chatBot) chatBot.style.setProperty("--chatbot-raise", "0px");
  }

  private checkFloatPosition = (): void => {
    // if bot is OFF, stop loop
    if (this.props.showChatBot === false) {
      this.stopFloatCheck();
      return;
    }

    const chatBot = this.chatBotRef.current;
    if (!chatBot) {
      this.rafId = requestAnimationFrame(this.checkFloatPosition);
      return;
    }

    const footer = document.querySelector('[class*="TIRFooter"]') as HTMLElement | null;
    if (!footer) {
      chatBot.style.setProperty("--chatbot-raise", "0px");
      this.rafId = requestAnimationFrame(this.checkFloatPosition);
      return;
    }

    const chatBotRect = chatBot.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const chatBotBottom = chatBotRect.bottom;
    const footerTop = footerRect.top;
    const overlap = chatBotBottom - footerTop;

    if (overlap > 0 && footerTop < viewportHeight) {
      const raise = overlap + 70;
      chatBot.style.setProperty("--chatbot-raise", `${raise}px`);
    } else {
      chatBot.style.setProperty("--chatbot-raise", "0px");
    }

    this.rafId = requestAnimationFrame(this.checkFloatPosition);
  };

  render(): JSX.Element {
    const { items, loading, error } = this.state;

    const botHref = (
      this.props.chatBotDeepLink ||
      "https://teams.microsoft.com/l/app/58e72336-dc5b-4253-8dc2-cf961136ebe3?source=app-header-share-entrypoint"
    ).trim();

    const showBot = this.props.showChatBot !== false && !!botHref;

    if (loading) {
      return <Spinner size={SpinnerSize.large} label="Loading beverages..." />;
    }

    if (error) {
      return <Text className={styles.errorText}>{error}</Text>;
    }

    const hot = items.filter(this.byCategory("hot"));
    const tea = items.filter(this.byCategory("tea"));
    const milk = items.filter(this.byCategory("milk"));
    const cold = items.filter(this.byCategory("cold"));

    return (
      <div className={styles.wrapper}>
        <div className={styles.categoriesContainer}>
          {/* HOT */}
          <div className={`${styles.categoryBlock} ${styles.fullRow}`}>
            <div className={styles.imgWrap}>
              <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
              <img
                src={HOT_IMG}
                className={`${styles.hotImg} ${styles.hotImg1}`}
                alt="Hot Beverages"
              />
            </div>
            <div>
              <Text className={styles.menuTitle}>Hot Beverages</Text>
              {this.renderMenu(hot)}
            </div>
          </div>

          {/* TEA */}
          <div className={`${styles.categoryBlock} ${styles.fullRow}`}>
            <div className={styles.imgWrap}>
              <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
              <img src={TEA_IMG} className={styles.teaImg} alt="Tea Menu" />
            </div>
            <div>
              <Text className={styles.menuTitle}>Tea Menu</Text>
              {this.renderMenu(tea)}
            </div>
          </div>

          {/* COLD */}
          <div className={`${styles.categoryBlock} ${styles.fullRow}`}>
            <div className={styles.imgWrap}>
              <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
              <img
                src={COLD_IMG}
                className={`${styles.coldImg} ${styles.coldImg1}`}
                alt="Cold Beverages"
              />
            </div>
            <div>
              <Text className={styles.menuTitle}>Cold Beverages</Text>
              {this.renderMenu(cold)}
            </div>
          </div>

          {/* MILK */}
          <div className={`${styles.categoryBlock} ${styles.inlineRow}`}>
            <div className={styles.imgWrap}>
              <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
              <img
                src={MILK_IMG}
                className={`${styles.milkImg} ${styles.milkImg1}`}
                alt="Milk Menu"
              />
            </div>
            <div>
              <Text className={styles.menuTitle}>Milk Alternatives</Text>
              {this.renderMenu(milk)}
            </div>
          </div>
        </div>

        {/* CHATBOT FAB (hidden when toggle OFF) */}
        {showBot && (
          <a
            ref={this.chatBotRef}
            className={styles.chatBotFab}
            href={botHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Open chatbot"
          >
            <img src={chatBotIcon} alt="Chatbot" />
          </a>
        )}
      </div>
    );
  }
}