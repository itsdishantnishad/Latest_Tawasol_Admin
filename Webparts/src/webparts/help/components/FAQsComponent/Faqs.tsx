import * as React from "react";
import styles from "./Faqs.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

const chatBotIcon: string = require("../../assets/ChatBot.svg");

export interface IFaqsProps {
  context: WebPartContext;
  listTitle?: string;
  chatBotDeepLink?: string;
  showChatBot?: boolean;
}

interface IFaqItem {
  id: number;
  category: string;
  questionEn: string;
  answerEn: string;
  questionAr?: string;
  answerAr?: string;
}

type CategoryKey = "Human Capital" | "Technology" | "Administration";
type LanguageKey = "English" | "Arabic";

interface IFaqsState {
  loading: boolean;
  error?: string;
  items: IFaqItem[];
  currentCategory: CategoryKey;
  language: LanguageKey;
  expandedId?: number;
}

export default class Faqs extends React.Component<IFaqsProps, IFaqsState> {
  public static defaultProps: Partial<IFaqsProps> = {
    listTitle: "FAQs",
    showChatBot: true,
  };

  private chatBotRef = React.createRef<HTMLAnchorElement>();
  private rafId: number | null = null;

  public constructor(props: IFaqsProps) {
    super(props);
    this.state = {
      loading: true,
      error: undefined,
      items: [],
      currentCategory: "Human Capital",
      language: "English",
      expandedId: undefined,
    };
  }

  public async componentDidMount(): Promise<void> {
    if (this.props.showChatBot !== false) {
      this.startFloatCheck();
    }

    try {
      const sp = spfi().using(SPFx(this.props.context));
      const listTitle = this.props.listTitle as string;

      const raw: any[] = await sp.web.lists
        .getByTitle(listTitle)
        .items.select(
          "Id",
          "TIRQuestion",
          "TIRAnswer",
          "TIRQuestionArabic",
          "TIRAnswerArabic",
          "TIRFAQCategories"
        )
        .orderBy("ID")();

      const items: IFaqItem[] = raw.map((i) => ({
        id: i.Id,
        category: i.TIRFAQCategories || "",
        questionEn: i.TIRQuestion || "",
        answerEn: i.TIRAnswer || "",
        questionAr: i.TIRQuestionArabic || "",
        answerAr: i.TIRAnswerArabic || "",
      }));

      const firstInCategory = items.find(
        (x) => x.category === this.state.currentCategory
      );

      this.setState({
        loading: false,
        items,
        expandedId: firstInCategory ? firstInCategory.id : undefined,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("FAQ load error", err);
      this.setState({
        loading: false,
        error: "Unable to load FAQs.",
      });
    }
  }

  public componentDidUpdate(prevProps: IFaqsProps): void {
    const prevShow = prevProps.showChatBot !== false;
    const currShow = this.props.showChatBot !== false;

    if (prevShow !== currShow) {
      if (currShow) {
        this.startFloatCheck();
      } else {
        this.stopFloatCheck();
      }
    }
  }

  public componentWillUnmount(): void {
    this.stopFloatCheck();
  }

  // ========== FLOATING CHATBOT ==========
  private startFloatCheck(): void {
    // avoid starting multiple RAF loops
    if (this.rafId !== null) return;
    this.checkFloatPosition();
  }

  private stopFloatCheck(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // reset raise if element still exists
    const chatBot = this.chatBotRef.current;
    if (chatBot) chatBot.style.setProperty("--chatbot-raise", "0px");
  }

  private checkFloatPosition = (): void => {
    // if bot is globally OFF, stop the loop
    if (this.props.showChatBot === false) {
      this.stopFloatCheck();
      return;
    }

    const chatBot = this.chatBotRef.current;

    // if bot not in DOM yet, keep waiting (only when enabled)
    if (!chatBot) {
      this.rafId = requestAnimationFrame(this.checkFloatPosition);
      return;
    }

    const footer = document.querySelector('[class*="TIRFooter"]') as
      | HTMLElement
      | null;

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

  private setCategory = (category: CategoryKey): void => {
    const { items } = this.state;
    const firstInCategory = items.find((x) => x.category === category);
    this.setState({
      currentCategory: category,
      expandedId: firstInCategory ? firstInCategory.id : undefined,
    });
  };

  private setLanguage = (language: LanguageKey): void => {
    this.setState({ language });
  };

  private toggleItem = (id: number): void => {
    this.setState((prev) => ({
      expandedId: prev.expandedId === id ? undefined : id,
    }));
  };

  private get visibleItems(): IFaqItem[] {
    const { items, currentCategory } = this.state;
    return items
      .filter((i) => i.category === currentCategory)
      .sort((a, b) => a.id - b.id);
  }

  public render(): React.ReactElement<IFaqsProps> {
    const { loading, error, currentCategory, language } = this.state;
    const items = this.visibleItems;

    const botHref = (
      this.props.chatBotDeepLink ||
      "https://teams.microsoft.com/l/app/58e72336-dc5b-4253-8dc2-cf961136ebe3?source=app-header-share-entrypoint"
    ).trim();

    const showBot = this.props.showChatBot !== false && !!botHref;

    if (loading) {
      return <div className={styles.wrapper}>Loading…</div>;
    }

    if (error) {
      return <div className={styles.wrapper}>{error}</div>;
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.topTabs}>
          {this.renderTopTab("Human Capital")}
          {this.renderTopTab("Technology")}
          {this.renderTopTab("Administration")}
        </div>

        <div className={styles.topSeparator} />
        <h2 className={styles.faqTitle}>FAQs</h2>

        <div className={styles.subHeaderRow}>
          <span className={styles.subCategoryLabel}>{currentCategory}</span>
          <span className={styles.subCategoryDash} />
          <div className={styles.languageToggle}>
            <button
              type="button"
              className={
                language === "English"
                  ? `${styles.langButton} ${styles.langButtonActive}`
                  : `${styles.langButton} ${styles.langButtonInactive}`
              }
              onClick={() => this.setLanguage("English")}
            >
              English
            </button>
            <button
              type="button"
              className={
                language === "Arabic"
                  ? `${styles.langButton} ${styles.langButtonActive}`
                  : `${styles.langButton} ${styles.langButtonInactive}`
              }
              onClick={() => this.setLanguage("Arabic")}
            >
              Arabic
            </button>
          </div>
        </div>

        <div className={styles.faqList}>
          {items.map((item) => this.renderItem(item))}
        </div>

        {/* ✅ CHATBOT FAB (hidden when showChatBot is OFF) */}
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

  private renderTopTab(category: CategoryKey): JSX.Element {
    const isActive = this.state.currentCategory === category;
    return (
      <button
        key={category}
        type="button"
        className={
          isActive ? `${styles.topTab} ${styles.topTabActive}` : styles.topTab
        }
        onClick={() => this.setCategory(category)}
      >
        {category}
        {isActive && <span className={styles.topTabUnderline} />}
      </button>
    );
  }

  private renderItem(item: IFaqItem): JSX.Element {
    const isOpen = this.state.expandedId === item.id;
    const { language } = this.state;

    const question =
      language === "Arabic" ? item.questionAr || item.questionEn : item.questionEn;

    const answer =
      language === "Arabic" ? item.answerAr || item.answerEn : item.answerEn;

    return (
      <div
        key={item.id}
        className={isOpen ? styles.faqItemExpanded : styles.faqItemCollapsed}
      >
        <button
          type="button"
          className={styles.faqItemButton}
          onClick={() => this.toggleItem(item.id)}
        >
          <div className={styles.iconBox}>
            {isOpen ? (
              <span className={styles.iconMinus} />
            ) : (
              <span className={styles.iconPlus}>+</span>
            )}
          </div>

          <div className={styles.faqContent}>
            <div className={styles.questionText}>{question}</div>
            {isOpen && <div className={styles.answerText}>{answer}</div>}
          </div>
        </button>
      </div>
    );
  }
}