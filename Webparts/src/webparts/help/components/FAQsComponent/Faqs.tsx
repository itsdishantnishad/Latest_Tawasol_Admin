
import * as React from "react";
import styles from "./Faqs.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IFaqsProps {
  context: WebPartContext;
  listTitle?: string;
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
    listTitle: "FAQs"
  };

  public constructor(props: IFaqsProps) {
    super(props);
    this.state = {
      loading: true,
      error: undefined,
      items: [],
      currentCategory: "Human Capital",
      language: "English",
      expandedId: undefined
    };
  }

  public async componentDidMount(): Promise<void> {
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
        questionAr: i.TIRAnswerArabic || "",
        answerAr: i.TIRFAQCategories || ""
      }));

      const firstInCategory = items.find(
        (x) => x.category === this.state.currentCategory
      );

      this.setState({
        loading: false,
        items,
        expandedId: firstInCategory ? firstInCategory.id : undefined
      });
    } catch (err) {
      console.error("FAQ load error", err);
      this.setState({
        loading: false,
        error: "Unable to load FAQs."
      });
    }
  }

  private setCategory = (category: CategoryKey): void => {
    const { items } = this.state;
    const firstInCategory = items.find((x) => x.category === category);
    this.setState({
      currentCategory: category,
      expandedId: firstInCategory ? firstInCategory.id : undefined
    });
  };

  private setLanguage = (language: LanguageKey): void => {
    this.setState({ language });
  };

  private toggleItem = (id: number): void => {
    this.setState((prev) => ({
      expandedId: prev.expandedId === id ? undefined : id
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
          isActive
            ? `${styles.topTab} ${styles.topTabActive}`
            : styles.topTab
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
      language === "Arabic"
        ? item.questionAr || item.questionEn
        : item.questionEn;

    const answer =
      language === "Arabic"
        ? item.answerAr || item.answerEn
        : item.answerEn;

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
