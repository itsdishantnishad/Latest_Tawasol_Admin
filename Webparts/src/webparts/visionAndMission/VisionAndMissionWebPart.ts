
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import * as React from "react";
import * as ReactDom from "react-dom";
import VisionMission from "./components/VisionAndMission";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { IVisionAndMissionProps } from "./components/IVisionAndMissionProps";

export interface IVisionAndMissionWebPartProps {
  visionText: string;
  missionPoint1: string;
  missionPoint2: string;
  missionPoint3: string;
}

export default class VisionAndMissionWebPart
  extends BaseClientSideWebPart<IVisionAndMissionWebPartProps> {

  public onInit(): Promise<void> {
    // fonts once per page
    SPComponentLoader.loadCss(
      "https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Instrument+Serif:ital@0;1&display=swap"
    );
    return super.onInit();
  }

  public render(): void {
    const props: IVisionAndMissionProps = {
      visionText:
        this.properties.visionText ||
        "Pioneering the vibrant, ever-evolving communities of tomorrow—through boundary-pushing design and unforgettable, immersive experiences. We don’t just imagine the future—we shape it. Every concept we craft is a bold statement, every experience a lasting impression, all driven by a relentless passion to transform the ordinary into the extraordinary.",

      missionPoint1:
        this.properties.missionPoint1 ||
        "Placing all life at the core of our values by being environmentally conscious and shaping sustainable communities.",

      missionPoint2:
        this.properties.missionPoint2 ||
        "Deliver effortless, delightful, and innovative experience to our customers.",

      missionPoint3:
        this.properties.missionPoint3 ||
        "Continuously redefining the future of living.",
    };

    const element = React.createElement(VisionMission, props);
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version { return Version.parse("1.0"); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: "Vision / Mission content" },
        groups: [
          {
            groupName: "Vision",
            groupFields: [
              PropertyPaneTextField("visionText", {
                label: "Vision description",
                multiline: true,
                rows: 5,
              }),
            ],
          },
          {
            groupName: "Mission",
            groupFields: [
              PropertyPaneTextField("missionPoint1", { label: "Mission point 01", multiline: true }),
              PropertyPaneTextField("missionPoint2", { label: "Mission point 02", multiline: true }),
              PropertyPaneTextField("missionPoint3", { label: "Mission point 03", multiline: true }),
            ],
          },
        ],
      }],
    };
  }
}
