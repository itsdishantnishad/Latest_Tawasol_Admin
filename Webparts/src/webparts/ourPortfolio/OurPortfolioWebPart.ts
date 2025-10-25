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
import { ListName } from "../services/Constants";

export interface IOurPortfolioWebPartProps {
  description: string;
  listTitle?: string;
  brandField?: string;
}

export default class OurPortfolioWebPart
  extends BaseClientSideWebPart<IOurPortfolioWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IOurPortfolioProps> = React.createElement(
      OurPortfolio,
      {
        context: this.context,
        listTitle: (this.properties.listTitle && this.properties.listTitle.trim()) || ListName.OUR_PORTFOLIO,
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
                  label: "Please enter list name",
                  placeholder: "Our Portfolio", // ⬅️ updated placeholder
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}