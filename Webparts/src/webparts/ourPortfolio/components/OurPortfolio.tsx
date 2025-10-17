import * as React from "react";
import styles from "./OurPortfolio.module.scss";
import { IOurPortfolioProps } from "./IOurPortfolioProps";
import { listServices } from '../../services/listServices';

export interface IOurPortfolioState {
  listItems: any[];
}

export default class OurPortfolio extends React.Component<IOurPortfolioProps, IOurPortfolioState> {
  private spService: listServices;
  public constructor(props: IOurPortfolioProps) {
    super(props);
    this.state = {
      listItems: []
    };
    this.spService = new listServices(this.props.context);
  }


  async componentDidMount(): Promise<void> {
    let lItems: any = [];
    lItems = await this.spService.getOurPortfolio("Our Portfolio");
    this.setState({
      listItems: lItems
    })
    console.log(lItems);
  }

  public render(): React.ReactElement<IOurPortfolioProps> {
    const {

    } = this.props;
    const mainBrands: any = [];
    const categoryWiseBrands: any = [];
    /** main brands = rows with NO BrandChoice */
    this.state.listItems.map((item) => {
      item.PortfolioCategory === "Main" ?
        mainBrands.push(item.Title) : "";
    });
    mainBrands.map((mbItems: any) => {
      this.state.listItems.map((item) => {
        mbItems === item.PortfolioCategory ? categoryWiseBrands.push({ item, mbItems }) : "";
      })
    })

    console.log(mainBrands);

    return (
      <section className={styles.wrapper} aria-labelledby="portfolioHeading">
        {/* Title */}
        <h2 id="portfolioHeading" className={styles.heading}>
          <span className={styles.our}>Our</span>{" "}
          <span className={styles.portfolio}>Portfolio</span>
        </h2>
        <div className={styles.brandsColumns}>
          {mainBrands.map((brand: any) => {
            return (
              <div className={styles.brandColumn} >
                <div className={styles.brandCard} title={brand.Title}>
                  {brand.IconURL ? (
                    <img className={styles.brandLogo} src={brand.IconURL} alt={brand.IconURL} />
                  ) : (
                    <span className={styles.brandFallback}>{brand.Title}</span>
                  )}
                </div>

                {/* sub-brands for this brand (using Choice) */}
                <div className={styles.subGridCols2}>
                  {this.state.listItems.map((item) => {

                    return (
                      <div className={styles.subCell} title={item.Title}>
                        {item.IconURL ? (
                          <img className={styles.subLogo} src={item.IconURL} alt={item.IconURL} />
                        ) : (
                          <span className={styles.subFallback}>{item.Title}</span>
                        )}
                      </div>
                    );
                  })
                  }
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };
}


