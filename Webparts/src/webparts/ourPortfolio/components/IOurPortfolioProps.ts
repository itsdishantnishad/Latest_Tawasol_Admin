import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IOurPortfolioProps {
 context: WebPartContext;
  siteUrl: string;
  listTitle?: string;     // e.g. "AboutDHREOurPortfolio"
  brandField?: string;    // internal name of the Choice column (default: "ABoutDHRECategory")
}
