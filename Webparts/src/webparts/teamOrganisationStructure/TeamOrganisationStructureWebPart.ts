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

// ✅ Shared shimmer wrapper (Option 1)
import { LoadingBoundary } from "../Components/LoadingShimmer";

export interface ITeamOrganisationStructureWebPartProps {
  listTitle: string;
  deptListTitle: string;
}

export default class TeamOrganisationStructureWebPart
  extends BaseClientSideWebPart<ITeamOrganisationStructureWebPartProps> {
  private _renderTimerId?: number;
  private readonly _renderDelayMs: number = 1200;

  public render(): void {
    // clear any pending render (important when properties change / re-render)
    if (this._renderTimerId) {
      window.clearTimeout(this._renderTimerId);
      this._renderTimerId = undefined;
    }

    // ✅ Shimmer immediately (no spinner/loader)
    const shimmer = React.createElement(LoadingBoundary, {
      loading: true,
      preset: "card" as any,
      count: 10,
      ariaLabel: "Loading Team Organisation Structure",
      // ✅ TS fix: children passed inside props
      children: React.createElement("div", { style: { minHeight: 420 } }),
    });

    ReactDom.render(shimmer, this.domElement);

    // ✅ Delay the actual React render
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
