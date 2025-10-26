import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import * as React from "react";
import * as ReactDom from "react-dom";
import Dashboards from "./components/Dashboards";

// Local types – simple & self-contained
type DashboardItem = { title: string; image?: string; url?: string; desc?: string; };
type DashProps = {
  heading: string;
  subtitle?: string;
  items: DashboardItem[];
};

export interface IDashboardsWebPartProps {
  heading: string;
  subtitle?: string;

  // 6 tiles (title + image + url + desc)
  title1: string; image1: string; url1: string; desc1: string;
  title2: string; image2: string; url2: string; desc2: string;
  title3: string; image3: string; url3: string; desc3: string;
  title4: string; image4: string; url4: string; desc4: string;
  title5: string; image5: string; url5: string; desc5: string;
  title6: string; image6: string; url6: string; desc6: string;
}

export default class DashboardsWebPart
  extends BaseClientSideWebPart<IDashboardsWebPartProps> {

  public render(): void {
    const items: DashboardItem[] = [
      { title: this.properties.title1, image: this.properties.image1, url: this.properties.url1, desc: this.properties.desc1 },
      { title: this.properties.title2, image: this.properties.image2, url: this.properties.url2, desc: this.properties.desc2 },
      { title: this.properties.title3, image: this.properties.image3, url: this.properties.url3, desc: this.properties.desc3 },
      { title: this.properties.title4, image: this.properties.image4, url: this.properties.url4, desc: this.properties.desc4 },
      { title: this.properties.title5, image: this.properties.image5, url: this.properties.url5, desc: this.properties.desc5 },
      { title: this.properties.title6, image: this.properties.image6, url: this.properties.url6, desc: this.properties.desc6 },
    ].filter(x => x && (x.title || x.image || x.url));

    const props: DashProps = {
      heading: this.properties.heading ?? "Data Work Bench – Dashboards",
      subtitle:
        this.properties.subtitle ??
        "Enjoy exclusive perks, rewards, and benefits designed to support you at work and beyond.",
      items
    };

    const el = React.createElement(Dashboards as any, props);
    ReactDom.render(el, this.domElement);
  }

  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse("1.0"); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Banner + 6 dashboard tiles" },
          groups: [
            {
              groupName: "Banner",
              groupFields: [
                PropertyPaneTextField("heading", { label: "Heading" }),
                PropertyPaneTextField("subtitle", { label: "Subheading", multiline: true }),
              ],
            },
            {
              groupName: "Tiles – Top Row (1–3)",
              groupFields: [
                PropertyPaneTextField("title1", { label: "Tile 1 Title" }),
                PropertyPaneTextField("image1", { label: "Tile 1 Image URL" }),
                PropertyPaneTextField("url1",   { label: "Tile 1 Power BI URL", multiline: true }),
                PropertyPaneTextField("desc1",  { label: "Tile 1 Description" }),

                PropertyPaneTextField("title2", { label: "Tile 2 Title" }),
                PropertyPaneTextField("image2", { label: "Tile 2 Image URL" }),
                PropertyPaneTextField("url2",   { label: "Tile 2 Power BI URL", multiline: true }),
                PropertyPaneTextField("desc2",  { label: "Tile 2 Description" }),

                PropertyPaneTextField("title3", { label: "Tile 3 Title" }),
                PropertyPaneTextField("image3", { label: "Tile 3 Image URL" }),
                PropertyPaneTextField("url3",   { label: "Tile 3 Power BI URL", multiline: true }),
                PropertyPaneTextField("desc3",  { label: "Tile 3 Description" }),
              ],
            },
            {
              groupName: "Tiles – Bottom Row (4–6)",
              groupFields: [
                PropertyPaneTextField("title4", { label: "Tile 4 Title" }),
                PropertyPaneTextField("image4", { label: "Tile 4 Image URL" }),
                PropertyPaneTextField("url4",   { label: "Tile 4 Power BI URL", multiline: true }),
                PropertyPaneTextField("desc4",  { label: "Tile 4 Description" }),

                PropertyPaneTextField("title5", { label: "Tile 5 Title" }),
                PropertyPaneTextField("image5", { label: "Tile 5 Image URL" }),
                PropertyPaneTextField("url5",   { label: "Tile 5 Power BI URL", multiline: true }),
                PropertyPaneTextField("desc5",  { label: "Tile 5 Description" }),

                PropertyPaneTextField("title6", { label: "Tile 6 Title" }),
                PropertyPaneTextField("image6", { label: "Tile 6 Image URL" }),
                PropertyPaneTextField("url6",   { label: "Tile 6 Power BI URL", multiline: true }),
                PropertyPaneTextField("desc6",  { label: "Tile 6 Description" }),
              ],
            },
          ],
        },
      ],
    };
  }
}
