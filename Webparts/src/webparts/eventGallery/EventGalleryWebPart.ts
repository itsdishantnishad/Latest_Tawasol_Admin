import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "EventGalleryWebPartStrings";
import EventGallery from "./components/EventGallery";
import type { IEventGalleryProps } from "./components/IEventGalleryProps";
import { listServices } from "../services/listServices";

export interface IEventGalleryWebPartProps {
  description: string;
  sitePagesListTitle: string;
  contentTypeName: string;
  maxItems: number;
  letsMeetDescription: string;
}

export default class EventGalleryWebPart extends BaseClientSideWebPart<IEventGalleryWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  private EventItem: any[] = []; 
  private spService: listServices;

  public render(): void {
    const element: React.ReactElement<IEventGalleryProps> = React.createElement(
      EventGallery,
      {
        context: this.context,
        EventItem: this.EventItem,
        sitePagesListTitle: this.properties.sitePagesListTitle || "Site Pages",
        contentTypeName: this.properties.contentTypeName || "TIRLetsConnect",
        maxItems: this.properties.maxItems ?? 12,
        letsMeetDescription: this.properties.letsMeetDescription || "",
      }
    );

    ReactDom.render(element, this.domElement);
  }
  protected async onInit(): Promise<void> {
    
    if (!this.properties.sitePagesListTitle) this.properties.sitePagesListTitle = "Site Pages";
    if (!this.properties.contentTypeName) this.properties.contentTypeName = "TIRLetsConnect";
    if (this.properties.maxItems === undefined) this.properties.maxItems = 12;
    if (this.properties.letsMeetDescription === undefined) {
      this.properties.letsMeetDescription =
        "Let’s Meet is our ongoing spotlight series dedicated to the people who shape our company every day...";
    }

    this.spService = new listServices(this.context);
    this.EventItem = await this.spService.getAllEvents();
    this.render();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty("--bodyText", semanticColors.bodyText || null);
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty("--linkHovered", semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),

                //  Lets Meet props
                PropertyPaneTextField("letsMeetDescription", {
                  label: "Let's Meet Description",
                  multiline: true,
                  resizable: true,
                  rows: 4,
                }),
                PropertyPaneTextField("sitePagesListTitle", {
                  label: "Site Pages Library Title",
                }),
                PropertyPaneTextField("contentTypeName", {
                  label: "Lets Connect Content Type Name",
                }),
                PropertyPaneSlider("maxItems", {
                  label: "Lets Connect Max Items",
                  min: 1,
                  max: 2000,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
