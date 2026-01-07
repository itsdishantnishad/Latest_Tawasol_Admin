// import * as React from "react";
// import styles from "./Beverages.module.scss";
// import { WebPartContext } from "@microsoft/sp-webpart-base";
// import GlobalBreadcrumbs from "../../assets/GlobalBreadcrumbs";
// import { Text, Spinner, SpinnerSize } from "@fluentui/react";
// import { spfi, SPFx } from "@pnp/sp";

// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";

// export interface IBeveragesProps {
//   context: WebPartContext;
//   listTitle?: string;
// }

// interface IBeverageItem {
//   Id: number;
//   Title: string;
//   BMCategory?: string;
//   BMIsActive?: boolean;
// }

// interface IBeveragesState {
//   items: IBeverageItem[];
//   loading: boolean;
//   error?: string | null;
// }

// const LIST_DEFAULT = "Beverages Menu";

// const HOT_IMG = require("../assets/HotBeveragesImg.svg");
// const MILK_IMG = require("../assets/MilkAlternativeImg.svg");
// const TEA_IMG = require("../assets/TeaMenuImg.svg");
// const COLD_IMG = require("../assets/ColdBeveragesImg.svg");
// const Ellipse_IMG = require("../assets/EllipseImg.svg");

// export default class Beverages extends React.Component<IBeveragesProps, IBeveragesState> {
//   private sp = spfi().using(SPFx(this.props.context));

//   state: IBeveragesState = {
//     items: [],
//     loading: true,
//     error: null
//   };

//   componentDidMount(): void {
//     this.loadItems();
//   }

//   private async loadItems(): Promise<void> {
//     try {
//       const rawItems = await this.sp.web.lists
//         .getByTitle(this.props.listTitle || LIST_DEFAULT)
//         .items.select("Id", "Title", "TIRBMCategory", "TIRIsActive")
//         .filter("TIRIsActive eq 1")
//         .orderBy("Id", true)
//         .top(500)();

//       const items: IBeverageItem[] = rawItems.map((i: any) => ({
//         Id: i.Id,
//         Title: i.Title,
//         BMCategory: i.TIRBMCategory,
//         BMIsActive: i.TIRIsActive
//       }));

//       this.setState({ items, loading: false });
//     } catch (e: any) {
//       this.setState({ loading: false, error: e?.message });
//     }
//   }

//   private byCategory = (key: string) => (i: IBeverageItem) =>
//     (i.BMCategory || "").toLowerCase().includes(key);

//   private splitColumns(items: IBeverageItem[], rowsPerCol = 4): IBeverageItem[][] {
//     const cols: IBeverageItem[][] = [];
//     for (let i = 0; i < items.length; i += rowsPerCol) {
//       cols.push(items.slice(i, i + rowsPerCol));
//     }
//     return cols;
//   }

//   private renderMenu(items: IBeverageItem[]) {
//     if (!items.length) return null;
//     const cols = this.splitColumns(items);

//     return (
//       <div className={styles.menuRow}>
//         {cols.map((col, i) => (
//           <div key={i} className={styles.menuCol}>
//             {col.map(it => (
//               <div key={it.Id} className={styles.menuItem}>{it.Title}</div>
//             ))}
//           </div>
//         ))}
//       </div>
//     );
//   }

//   private getCategoryClass(items: IBeverageItem[]) {
//     return items.length > 4 ? styles.fullRow : styles.inlineRow;
//   }

//   render(): JSX.Element {
//     const { items, loading, error } = this.state;

//     if (loading) {
//       return <Spinner size={SpinnerSize.large} label="Loading beverages..." />;
//     }

//     if (error) {
//       return <Text className={styles.errorText}>{error}</Text>;
//     }

//     const hot = items.filter(this.byCategory("hot"));
//     const milk = items.filter(this.byCategory("milk"));
//     const tea = items.filter(this.byCategory("tea"));
//     const cold = items.filter(this.byCategory("cold"));

//     return (
//       <div className={styles.wrapper}>
//         <div className={styles.categoriesContainer}>

//           {[
//             { title: "Hot Beverages", items: hot, img: HOT_IMG, cls: styles.hotImg },
//             { title: "Milk Menu", items: milk, img: MILK_IMG, cls: styles.milkImg },
//             { title: "Tea Menu", items: tea, img: TEA_IMG, cls: styles.teaImg },
//             { title: "Cold Beverages", items: cold, img: COLD_IMG, cls: styles.coldImg }
//           ].map((c, i) => (
//             <div key={i} className={`${styles.categoryBlock} ${this.getCategoryClass(c.items)}`}>
//               <div className={styles.imgWrap}>
//                 <img src={Ellipse_IMG} className={styles.ellipseImg} alt="" />
//                 <img src={c.img} className={c.cls} alt={c.title} />
//               </div>
//               <div>
//                 <Text className={styles.menuTitle}>{c.title}</Text>
//                 {this.renderMenu(c.items)}
//               </div>
//             </div>
//           ))}

//         </div>
//       </div>
//     );
//   }
// }






import * as React from "react";
import styles from "./Beverages.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
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
  private sp = spfi().using(SPFx(this.props.context));

  state: IBeveragesState = {
    items: [],
    loading: true,
    error: null
  };

  componentDidMount(): void {
    this.loadItems();
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
        BMIsActive: i.TIRIsActive
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
            {col.map(it => (
              <div key={it.Id} className={styles.menuItem}>
                {it.Title}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  render(): JSX.Element {
    const { items, loading, error } = this.state;

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
              <img src={HOT_IMG} className={`${styles.hotImg} ${styles.hotImg1}`} alt="Hot Beverages" />
            </div>
            <div>
              <Text className={styles.menuTitle}>Hot Beverages</Text>
              {this.renderMenu(hot)}
            </div>
          </div>

          {/* TEA (🔥 NOW BELOW HOT) */}
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
              <img src={COLD_IMG} className={`${styles.coldImg} ${styles.coldImg1}`} alt="Cold Beverages" />
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
              <img src={MILK_IMG} className={`${styles.milkImg} ${styles.milkImg1}`} alt="Milk Menu" />
            </div>
            <div>
              <Text className={styles.menuTitle}>Milk Alternative</Text>
              {this.renderMenu(milk)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
