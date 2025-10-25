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

export interface ITeamOrganisationStructureWebPartProps {
  listTitle: string;
  deptListTitle: string;
}

export default class TeamOrganisationStructureWebPart
  extends BaseClientSideWebPart<ITeamOrganisationStructureWebPartProps> {

  public render(): void {
    const element = React.createElement<ITeamOrganisationStructureProps>(
      TeamOrganisationStructure,
      {
        context: this.context,
        listTitle: this.properties.listTitle || ListName.ORGANISATION_STRUCTURE,
        deptListTitle: this.properties.deptListTitle || ListName.TEAM_ORG_DEPARTMENTS
      }
    );

    ReactDom.render(element, this.domElement);
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
          header: { description: "Configure data source" },
          groups: [
            {
              groupName: "Lists",
              groupFields: [
                PropertyPaneTextField("listTitle", {
                  label: "People List (Team Org Structure)"
                }),
                PropertyPaneTextField("deptListTitle", {
                  label: "Departments Mapping List"
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
