import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import * as React from "react";
import * as ReactDom from "react-dom";

import TeamOrganisationStructure from "./components/TeamOrganisationStructure";
import { ITeamOrganisationStructureProps } from "./components/ITeamOrganisationStructureProps";
import { ListName } from "../services/Constants";

// ✅ Import same SCSS so the placeholder shimmer matches the real component shimmer
import styles from "./components/TeamOrganisationStructure.module.scss";

export interface ITeamOrganisationStructureWebPartProps {
  listTitle: string;
  deptListTitle: string;
}

export default class TeamOrganisationStructureWebPart
  extends BaseClientSideWebPart<ITeamOrganisationStructureWebPartProps> {
  private _renderTimerId?: number;
  private readonly _renderDelayMs: number = 1200;

  private _renderShimmerPlaceholder(): React.ReactElement {
    const ShimmerCard = (large?: boolean) =>
      React.createElement(
        "div",
        {
          className: `${styles.shimmerCard} ${large ? styles.shimmerCardLg : ""}`,
          "aria-hidden": true,
        },
        React.createElement("div", { className: styles.shimmerAvatar }),
        React.createElement("div", {
          className: `${styles.shimmerLine} ${styles.shimmerLineName}`,
        }),
        React.createElement("div", {
          className: `${styles.shimmerLine} ${styles.shimmerLineRole}`,
        })
      );

    return React.createElement(
      "section",
      { className: styles.wrapper, "aria-label": "Loading Team Organisation Structure" },
      React.createElement(
        "div",
        { className: styles.shimmerContainer },
        React.createElement("div", { className: styles.shimmerRow }, ShimmerCard(true)),
        React.createElement(
          "div",
          { className: styles.shimmerRow },
          ...Array.from({ length: 5 }).map((_, i) => ShimmerCard(false))
        ),
        React.createElement(
          "div",
          { className: styles.shimmerRow },
          ...Array.from({ length: 5 }).map((_, i) => ShimmerCard(false))
        )
      )
    );
  }

  public render(): void {
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    // ✅ Render SAME shimmer placeholder immediately (no spinner/loader)
    ReactDom.render(this._renderShimmerPlaceholder(), this.domElement);

    // ✅ Delay ONLY here
    this._renderTimerId = window.setTimeout(() => {
      const element = React.createElement<ITeamOrganisationStructureProps>(
        TeamOrganisationStructure,
        {
          context: this.context,
          listTitle: this.properties.listTitle || ListName.ORGANISATION_STRUCTURE,
          deptListTitle:
            this.properties.deptListTitle || ListName.TEAM_ORG_DEPARTMENTS,
        }
      );

      ReactDom.render(element, this.domElement);
      this._renderTimerId = undefined;
    }, this._renderDelayMs);
  }

  protected onDispose(): void {
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Configure data source" },
          groups: [
            {
              groupName: "Lists",
              groupFields: [
                PropertyPaneTextField("listTitle", {
                  label: "People List (Team Org Structure)",
                }),
                PropertyPaneTextField("deptListTitle", {
                  label: "Departments Mapping List",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
