import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import OurPortfolio from "./components/OurPortfolio";
import { IOurPortfolioProps } from "./components/IOurPortfolioProps";

export interface IOurPortfolioWebPartProps {
  description: string;
  listTitle?: string;   // e.g. "AboutDHREOurPortfolio"
  brandField?: string;  // e.g. "ABoutDHRECategory"
}

export default class OurPortfolioWebPart
  extends BaseClientSideWebPart<IOurPortfolioWebPartProps> {


  public render(): void {
    const element: React.ReactElement<IOurPortfolioProps> = React.createElement(
      OurPortfolio,
      {
        context: this.context,
        siteUrl: this.context.pageContext.web.absoluteUrl,
        listTitle: this.properties.listTitle || "AboutDHREOurPortfolio",
        brandField: this.properties.brandField || "ABoutDHRECategory",       
       
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: any): void {
    if (!currentTheme) return;
    
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Our Portfolio Settings" },
          groups: [
            {
              groupName: "Data",
              groupFields: [
                PropertyPaneTextField("listTitle", {
                  label: "CMS List Title",
                  placeholder: "AboutDHREOurPortfolio",
                }),
                PropertyPaneTextField("brandField", {
                  label: "Brand Choice Column (internal name)",
                  placeholder: "ABoutDHRECategory",
                }),
                PropertyPaneTextField("description", {
                  label: "Description (optional)",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
