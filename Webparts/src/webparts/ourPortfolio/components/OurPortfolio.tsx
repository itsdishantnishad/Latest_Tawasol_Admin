import * as React from "react";
import styles from "./OurPortfolio.module.scss";
import { IOurPortfolioProps } from "./IOurPortfolioProps";
import { listServices } from "../../services/listServices";

export interface IOurPortfolioState {
  listItems: any[];
}

export default class OurPortfolio extends React.Component<IOurPortfolioProps, IOurPortfolioState> {
  private spService: listServices;

  public constructor(props: IOurPortfolioProps) {
    super(props);
    this.state = { listItems: [] };
    this.spService = new listServices(this.props.context);
  }

  public async componentDidMount(): Promise<void> {
    const lItems = await this.spService.getOurPortfolio(this.props.listTitle || "Our Portfolio");
    this.setState({ listItems: lItems });
  }

  public render(): React.ReactElement<IOurPortfolioProps> {
    // Collect top brands (PortfolioCategory === "Main")
    const mainBrands: any[] = [];
    this.state.listItems.forEach((it: any) => {
      if (it.PortfolioCategory === "Main") {
        mainBrands.push({ title: it.Title, item: it });
      }
    });

    // Build [{ mainCat, subBrands[] }]
    const categoryWiseBrands: any[] = mainBrands.map((m: any) => {
      const subBrands = this.state.listItems.filter((it: any) => it.PortfolioCategory === m.title);
      return { mainCat: m.item, subBrands };
    });

    // --- Find the MAX column layout among the brands
    const maxColsAcross = Math.max(
      2,
      ...categoryWiseBrands.map((b: any) => Math.max(2, Number(b?.mainCat?.ColumnLayout || 2)))
    );

    // --- Compute a COMMON width so all tiles align on one row
    const cellWidth = 240;                       // matches SCSS .subLogo max-width
    const colGapCommon = maxColsAcross >= 3 ? 32 : 40; // match SCSS gaps after reduction
    const minTile = 311;                         // base card width
    const commonWidth = Math.max(minTile, maxColsAcross * cellWidth + (maxColsAcross - 1) * colGapCommon);

    return (
      <section className={styles.wrapper} aria-labelledby="portfolioHeading">
        {/* Title */}
        <h2 id="portfolioHeading" className={styles.heading}>
          <span className={styles.our}>Our</span>{" "}
          <span className={styles.portfolio}>Portfolio</span>
        </h2>

        <div className={styles.brandsColumns}>
          {categoryWiseBrands.map((brand: any) => {
            const cols = Math.max(2, Number(brand?.mainCat?.ColumnLayout || 2));

            // Sort sub-brands by SortOrder (then Title)
            const sub = [...brand.subBrands].sort((a: any, b: any) => {
              const sa = Number(a?.SortOrder ?? 9999);
              const sb = Number(b?.SortOrder ?? 9999);
              return sa !== sb ? sa - sb : String(a?.Title || "").localeCompare(String(b?.Title || ""));
            });

            return (
              <div
                className={styles.brandColumn}
                key={`brand-${brand.mainCat?.Title}`}
                style={{ width: `${commonWidth}px` }}   // << all tiles same width
              >
                {/* Main brand card */}
                <div className={styles.brandCard} title={brand.mainCat?.Title}>
                  {brand.mainCat?.IconURL ? (
                    <img
                      className={styles.brandLogo}
                      src={brand.mainCat.IconURL}
                      alt={brand.mainCat?.Title || "Brand"}
                    />
                  ) : (
                    <span className={styles.brandFallback}>{brand.mainCat?.Title}</span>
                  )}
                </div>

                {/* Sub-brands with dynamic column count */}
                <div
                  className={cols >= 3 ? styles.subGridCols3 : styles.subGridCols2}
                  style={cols > 3 ? { display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}
                >
                  {sub.map((item: any) => (
                    <div className={styles.subCell} title={item.Title} key={`sub-${brand.mainCat?.Title}-${item.Title}`}>
                      {item.IconURL ? (
                        <img className={styles.subLogo} src={item.IconURL} alt={item.Title} />
                      ) : (
                        <span className={styles.subFallback}>{item.Title}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
}
