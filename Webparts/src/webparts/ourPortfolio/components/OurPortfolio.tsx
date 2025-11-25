import * as React from "react";
import styles from "./OurPortfolio.module.scss";
import { IOurPortfolioProps } from "./IOurPortfolioProps";
import { listServices } from "../../services/listServices";

export interface IOurPortfolioState {
  listItems: any[];
  loading: boolean;
  error?: string;
  activeIndex: number;               // for dots
}

export default class OurPortfolio
  extends React.Component<IOurPortfolioProps, IOurPortfolioState> {

  private spService: listServices;
  private carouselViewportRef: React.RefObject<HTMLDivElement>;

  public constructor(props: IOurPortfolioProps) {
    super(props);
    this.state = {
      listItems: [],
      loading: true,
      error: undefined,
      activeIndex: 0
    };

    this.spService = new listServices(this.props.context);
    this.carouselViewportRef = React.createRef<HTMLDivElement>();
  }

  public async componentDidMount(): Promise<void> {
    try {
      const lItems = await this.spService.getOurPortfolio(
        this.props.listTitle || "Our Portfolio"
      );
      this.setState({ listItems: lItems, loading: false });
    } catch (e: any) {
      this.setState({
        loading: false,
        error: e?.message || "Failed to load portfolio."
      });
    }
  }

  /** Clamp ColumnLayout: minimum 1, maximum 4 columns per row */
  private getColsForBrand = (brand: any): number => {
    const raw = Number(brand?.mainCat?.ColumnLayout || 2);
    const n = isNaN(raw) ? 2 : raw;
    return Math.max(1, Math.min(4, n));   // 1–4 only
  };

  /** when user swipes horizontally, update active dot */
  private handleScroll = (): void => {
    const el = this.carouselViewportRef.current;
    if (!el) return;

    const slideWidth = el.clientWidth;
    if (!slideWidth) return;

    const index = Math.round(el.scrollLeft / slideWidth);
    if (index !== this.state.activeIndex) {
      this.setState({ activeIndex: index });
    }
  };

  /** when user clicks dot, scroll that slide into view */
  private scrollToSlide = (index: number): void => {
    const el = this.carouselViewportRef.current;
    if (!el) return;

    const slideWidth = el.clientWidth;
    el.scrollTo({
      left: index * slideWidth,
      behavior: "smooth"
    });
    this.setState({ activeIndex: index });
  };

  public render(): React.ReactElement<IOurPortfolioProps> {
    const { listItems, loading, error, activeIndex } = this.state;

    // Collect top brands (PortfolioCategory === "Main")
    const mainBrands: any[] = [];
    listItems.forEach((it: any) => {
      if (it.PortfolioCategory === "Main") {
        mainBrands.push({ title: it.Title, item: it });
      }
    });

    // Build [{ mainCat, subBrands[] }]
    const categoryWiseBrands: any[] = mainBrands.map((m: any) => {
      const subBrands = listItems.filter(
        (it: any) => it.PortfolioCategory === m.title
      );
      return { mainCat: m.item, subBrands };
    });

    // --- Find the MAX (clamped) column layout among the brands (for desktop width calc)
    const maxColsAcross = Math.max(
      1,
      ...categoryWiseBrands.map((b: any) => this.getColsForBrand(b))
    );

    // --- Compute a COMMON width so all tiles align on one row (desktop)
    const cellWidth = 240; // matches SCSS .subLogo max-width
    const colGapCommon = maxColsAcross >= 3 ? 32 : 40;
    const minTile = 311;
    const commonWidth = Math.max(
      minTile,
      maxColsAcross * cellWidth + (maxColsAcross - 1) * colGapCommon
    );

    return (
      <section className={styles.wrapper} aria-labelledby="portfolioHeading">
        {/* Title */}
        <h2 id="portfolioHeading" className={styles.heading}>
          <span className={styles.our}>Our</span>{" "}
          <span className={styles.portfolio}>Portfolio</span>
        </h2>

        {loading && <p>Loading…</p>}
        {error && !loading && (
          <p style={{ color: "#c00" }}>{error}</p>
        )}

        {!loading && !error && categoryWiseBrands.length > 0 && (
          <>
            {/* ===== Desktop / tablet: multi-column layout ===== */}
            <div className={styles.brandsColumns}>
              {categoryWiseBrands.map((brand: any) => {
                const cols = this.getColsForBrand(brand);

                // Sort sub-brands by SortOrder (then Title)
                const sub = [...brand.subBrands].sort((a: any, b: any) => {
                  const sa = Number(a?.SortOrder ?? 9999);
                  const sb = Number(b?.SortOrder ?? 9999);
                  return sa !== sb
                    ? sa - sb
                    : String(a?.Title || "").localeCompare(
                        String(b?.Title || "")
                      );
                });

                return (
                  <div
                    className={styles.brandColumn}
                    key={`brand-${brand.mainCat?.Title}`}
                    style={{ width: `${commonWidth}px` }}
                  >
                    {/* Main brand card (fixed layout) */}
                    <div
                      className={styles.brandCard}
                      title={brand.mainCat?.Title}
                    >
                      {brand.mainCat?.IconURL ? (
                        <img
                          className={styles.brandLogo}
                          src={brand.mainCat.IconURL}
                          alt={brand.mainCat?.Title || "Brand"}
                        />
                      ) : (
                        <span className={styles.brandFallback}>
                          {brand.mainCat?.Title}
                        </span>
                      )}
                    </div>

                    {/* Sub-brands grid (dynamic columns, max 4) */}
                    <div
                      className={styles.subGrid}
                      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                    >
                      {sub.map((item: any) => (
                        <div
                          className={styles.subCell}
                          title={item.Title}
                          key={`sub-${brand.mainCat?.Title}-${item.Title}`}
                        >
                          {item.IconURL ? (
                            <img
                              className={styles.subLogo}
                              src={item.IconURL}
                              alt={item.Title}
                            />
                          ) : (
                            <span className={styles.subFallback}>
                              {item.Title}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===== Mobile: touch carousel + dots, 1 category per slide ===== */}
            <div className={styles.carousel}>
              <div
                className={styles.carouselViewport}
                ref={this.carouselViewportRef}
                onScroll={this.handleScroll}
              >
                <div className={styles.carouselTrack}>
                  {categoryWiseBrands.map((brand: any) => {
                    const cols = this.getColsForBrand(brand);

                    const sub = [...brand.subBrands].sort((a: any, b: any) => {
                      const sa = Number(a?.SortOrder ?? 9999);
                      const sb = Number(b?.SortOrder ?? 9999);
                      return sa !== sb
                        ? sa - sb
                        : String(a?.Title || "").localeCompare(
                            String(b?.Title || "")
                          );
                    });

                    return (
                      <div
                        className={styles.carouselSlide}
                        key={`slide-${brand.mainCat?.Title}`}
                      >
                        {/* Main brand card */}
                        <div
                          className={styles.brandCard}
                          title={brand.mainCat?.Title}
                        >
                          {brand.mainCat?.IconURL ? (
                            <img
                              className={styles.brandLogo}
                              src={brand.mainCat.IconURL}
                              alt={brand.mainCat?.Title || "Brand"}
                            />
                          ) : (
                            <span className={styles.brandFallback}>
                              {brand.mainCat?.Title}
                            </span>
                          )}
                        </div>

                        {/* Sub-brands grid inside the slide (same dynamic logic) */}
                        <div
                          className={styles.subGrid}
                          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                        >
                          {sub.map((item: any) => (
                            <div
                              className={styles.subCell}
                              title={item.Title}
                              key={`slide-sub-${brand.mainCat?.Title}-${item.Title}`}
                            >
                              {item.IconURL ? (
                                <img
                                  className={styles.subLogo}
                                  src={item.IconURL}
                                  alt={item.Title}
                                />
                              ) : (
                                <span className={styles.subFallback}>
                                  {item.Title}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dots under the carousel */}
              <div className={styles.dots}>
                {categoryWiseBrands.map((_, index: number) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    className={
                      index === activeIndex
                        ? `${styles.dot} ${styles.dotActive}`
                        : styles.dot
                    }
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => this.scrollToSlide(index)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    );
  }
}
