
import * as React from "react";
import styles from "./Beverages.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import GlobalBreadcrumbs from "../../assets/GlobalBreadcrumbs";
import { Text, Spinner, SpinnerSize } from "@fluentui/react";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IBeveragesProps {
  context: WebPartContext;
  listTitle?: string;
}

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

const LIST_DEFAULT = "Beverages Menu List";
const HOT_IMG = require("../assets/HotBeveragesImg.svg");
const MILK_IMG = require("../assets/MilkAlternativeImg.svg");
const TEA_IMG = require("../assets/TeaMenuImg.svg");
const COLD_IMG = require("../assets/ColdBeveragesImg.svg");
const Ellipse_IMG = require("../assets/EllipseImg.svg");

export default class Beverages extends React.Component<IBeveragesProps, IBeveragesState> {
  private sp: ReturnType<typeof spfi>;

  constructor(props: IBeveragesProps) {
    super(props);
    this.sp = spfi().using(SPFx(props.context));
    this.state = {
      items: [],
      loading: true,
      error: null
    };
  }

  public componentDidMount(): void {
    this.loadItems();
  }

  private async loadItems(): Promise<void> {
    try {
      const listTitle = this.props.listTitle || LIST_DEFAULT;

      const items: IBeverageItem[] = await this.sp.web.lists
        .getByTitle(listTitle).items.select("Id", "Title", "BMCategory", "BMIsActive").filter("BMIsActive eq 1")
        .orderBy("Id", true)
        .top(500)();

      this.setState({ items, loading: false });
    } catch (e: any) {
      this.setState({
        loading: false,
        error: e?.message || "Error fetching beverages."
      });
    }
  }

  private byCategory = (needle: string) => (i: IBeverageItem): boolean => {
    const c = (i.BMCategory || "").toLowerCase();
    return c.includes(needle.toLowerCase());
  };

  private splitFixedColumns(items: IBeverageItem[], cols = 3, rowsPerCol = 4): IBeverageItem[][] {
    const out: IBeverageItem[][] = Array.from({ length: cols }, () => []);
    items.forEach((it, idx) => {
      const colIndex = Math.floor(idx / rowsPerCol);
      if (colIndex < cols) out[colIndex].push(it);
    });
    return out;
  }

  private toPages(items: IBeverageItem[], cols = 3, rowsPerCol = 4): IBeverageItem[][][] {
    const pageSize = cols * rowsPerCol; // 12
    const pages: IBeverageItem[][][] = [];
    for (let i = 0; i < items.length; i += pageSize) {
      const slice = items.slice(i, i + pageSize);
      pages.push(this.splitFixedColumns(slice, cols, rowsPerCol));
    }
    return pages;
  }

  private renderColumn(colItems: IBeverageItem[]): JSX.Element {
    return (
      <div className={styles.menuCol}>
        {colItems.map((it) => (
          <div key={it.Id} className={styles.menuItem}>
            {it.Title}
          </div>
        ))}
      </div>
    );
  }

  private renderMenu(items: IBeverageItem[]): JSX.Element {
    const pages = this.toPages(items, 3, 4);
    if (!pages.length) return <></>;

    return (
      <div className={styles.menuPages}>
        {pages.map((cols, pIdx) => {
          const nonEmptyCols = cols.filter(c => c.length > 0);
          const colCount = nonEmptyCols.length;

          const rowClass =
            colCount === 1 ? styles.menuRowOneCol :
            colCount === 2 ? styles.menuRowTwoCol :
            styles.menuRowThreeCol;

          return (
            <div key={`page-${pIdx}`} className={`${styles.menuRow} ${rowClass}`}>
              {nonEmptyCols.map((col, cIdx) => (
                <React.Fragment key={`col-${pIdx}-${cIdx}`}>
                  {this.renderColumn(col)}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  public render(): JSX.Element {
    const { items, loading, error } = this.state;

    if (loading) {
      return (
        <div className={styles.wrapper}>
          <Spinner size={SpinnerSize.large} label="Loading beverages..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.wrapper}>
          <Text variant="mediumPlus" className={styles.errorText}>{error}</Text>
        </div>
      );
    }

    const hotItems = items.filter(this.byCategory("hot"));
    const milkItems = items.filter(this.byCategory("milk"));
    const teaItems = items.filter(this.byCategory("tea"));
    const coldItems = items.filter(this.byCategory("cold"));

    return (
      <div className={styles.wrapper}>
         <div className={styles.breadcrumbWrap}>
          
           {/* Global Breadcrumbs */}
            <GlobalBreadcrumbs
                sectionLabel="Home"
                currentLabel="Beverage Menu"
                backText="Back"      
                showBack={true}    
             />
         </div>

        {/* HOT BEVERAGES */}
        <div className={styles.hotWrap}>
          <div className={styles.imgWrap}>
            <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
            <img src={HOT_IMG} className={styles.hotImg} alt="Hot beverages" />
          </div>

          <div className={styles.hotMenu}>
            <Text className={styles.menuTitle}>Hot Beverages</Text>
            {this.renderMenu(hotItems)}
          </div>
        </div>

        {/* MILK + TEA ROW */}
        <div className={styles.midWrap}>

          {/* Milk Alternatives */}
          <div className={styles.milkBlock}>
            <div className={styles.imgWrap}>
              <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
              <img src={MILK_IMG} className={styles.milkImg} alt="Milk alternatives" />
            </div>

            <div className={styles.milkMenu}>
              <Text className={styles.menuTitle}>Milk Alternatives</Text>
              {this.renderMenu(milkItems)}
            </div>
          </div>

          {/* Tea Menu */}
          <div className={styles.teaBlock}>
            <div className={styles.imgWrap}>
              <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
              <img src={TEA_IMG} className={styles.teaImg} alt="Tea menu" />
            </div>

            <div className={styles.teaMenu}>
              <Text className={styles.menuTitle}>Tea Menu</Text>
              {this.renderMenu(teaItems)}
            </div>
          </div>

        </div>

        {/* COLD BEVERAGES */}
        <div className={styles.coldWrap}>
          <div className={styles.imgWrap}>
            <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
            <img src={COLD_IMG} className={styles.coldImg} alt="Cold beverages" />
          </div>

          <div className={styles.coldMenu}>
            <Text className={styles.menuTitle}>Cold Beverages</Text>
            {this.renderMenu(coldItems)}
          </div>
        </div>
      </div>
    );
  }
}

