import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
} from "@microsoft/sp-component-base";
import * as strings from "FeatureWheelWebPartStrings";
import FeatureWheel from "./components/FeatureWheel";
import { IFeatureWheelProps } from "./components/IFeatureWheelProps";
import {
  type ICustomFeatureCardSettings,
  parseCustomFeatureCardsJson,
} from "./components/FeatureWheelCardSettings";
import { createCustomCardsPropertyPaneField } from "./components/CustomCardsPropertyPaneField";

export interface IFeatureWheelWebPartProps {
  letsCelebrate: string;
  trainingAndDevelopment: string;
  upcomingEvents: string;
  getOffersAndDiscounts: string;
  imageGallery: string;
  documents: string;
  meeting: string;
  interactiveForms: string;
  dashboard: string;
  taskApprovals: string;
  beverageMenu: string;

  showDashboard: boolean;
  showOffers: boolean;
  showTraining: boolean;
  showGallery: boolean;
  showDocuments: boolean;
  showLetsCelebrate: boolean;
  showAboutDhre: boolean;
  showTaskApprovals: boolean;
  showNewsletters: boolean;
  showMeetings: boolean;
  showServiceLinks: boolean;
  showForms: boolean;
  showEvents: boolean;
  showBeverageMenu: boolean;

  /** New structured custom-card settings. Managed by PropertyFieldCollectionData. */
  customCards: ICustomFeatureCardSettings[];

  /** Old field kept only so existing pages can be migrated automatically. */
  customCardsJson?: string;
}

export default class FeatureWheelWebPart extends BaseClientSideWebPart<IFeatureWheelWebPartProps> {
  private _themeProvider?: ThemeProvider;
  private _themeVariant?: IReadonlyTheme;

  private readonly _handleThemeChanged = (args: ThemeChangedEventArgs): void => {
    this._themeVariant = args.theme;
    this.render();
  };

  public render(): void {
    this._ensurePropertyDefaults();
    this._renderReact();
  }

  /** Keep property-pane changes reactive so cards appear/disappear immediately in Edit mode. */
  protected get disableReactivePropertyChanges(): boolean {
    return false;
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    this._ensurePropertyDefaults();

    // Explicit re-render fixes the Edit-mode canvas not refreshing until Publish.
    this._renderReact();
  }

  private _renderReact(): void {
    const featureWheelElement: React.ReactElement<IFeatureWheelProps> =
      React.createElement(FeatureWheel, {
        letsCelebrate: this.properties.letsCelebrate,
        trainingAndDevelopment: this.properties.trainingAndDevelopment,
        upcomingEvents: this.properties.upcomingEvents,
        getOffersAndDiscounts: this.properties.getOffersAndDiscounts,
        imageGallery: this.properties.imageGallery,
        documents: this.properties.documents,
        meeting: this.properties.meeting,
        interactiveForms: this.properties.interactiveForms,
        dashboard: this.properties.dashboard,
        beverageMenu: this.properties.beverageMenu,
        taskApprovals: this.properties.taskApprovals,
        showDashboard: this.properties.showDashboard,
        showOffers: this.properties.showOffers,
        showTraining: this.properties.showTraining,
        showGallery: this.properties.showGallery,
        showDocuments: this.properties.showDocuments,
        showLetsCelebrate: this.properties.showLetsCelebrate,
        showAboutDhre: this.properties.showAboutDhre,
        showTaskApprovals: this.properties.showTaskApprovals,
        showNewsletters: this.properties.showNewsletters,
        showMeetings: this.properties.showMeetings,
        showServiceLinks: this.properties.showServiceLinks,
        showForms: this.properties.showForms,
        showEvents: this.properties.showEvents,
        showBeverageMenu: this.properties.showBeverageMenu,
        customCards: this.properties.customCards,
        customCardsJson: this.properties.customCardsJson,
        context: this.context,
        themeVariant: this._themeVariant,
      });

    ReactDom.render(featureWheelElement, this.domElement);
  }

  protected onInit(): Promise<void> {
    return super.onInit().then(async () => {
      this._ensurePropertyDefaults();

      this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this._themeVariant = this._themeProvider.tryGetTheme();
      this._themeProvider.themeChangedEvent.add(this, this._handleThemeChanged);

      await this._getEnvironmentMessage();
    });
  }

  private _ensurePropertyDefaults(): void {
    const props = this.properties;

    props.showDashboard = props.showDashboard !== false;
    props.showOffers = props.showOffers !== false;
    props.showTraining = props.showTraining !== false;
    props.showGallery = props.showGallery !== false;
    props.showDocuments = props.showDocuments !== false;
    props.showLetsCelebrate = props.showLetsCelebrate !== false;
    props.showAboutDhre = props.showAboutDhre !== false;
    props.showTaskApprovals = props.showTaskApprovals !== false;
    props.showMeetings = props.showMeetings !== false;
    props.showServiceLinks = props.showServiceLinks !== false;
    props.showForms = props.showForms !== false;
    props.showEvents = props.showEvents !== false;
    props.showBeverageMenu = props.showBeverageMenu !== false;

    // Newsletter was previously commented out, so keep it hidden until enabled in the pane.
    props.showNewsletters = props.showNewsletters === true;

    if (!Array.isArray(props.customCards)) {
      const migratedCards = parseCustomFeatureCardsJson(props.customCardsJson);
      props.customCards = migratedCards.length ? migratedCards : [];
    }
  }

  private _renderImageUrlOrUploadField = (
    field: any,
    value: string,
    onUpdate: (fieldId: string, value: string) => void,
    _item: any,
    itemId: string,
    onError: (fieldId: string, errorMessage: string) => void
  ): React.ReactElement => {
    const currentValue = value || "";

    const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      if (!file) return;

      if (!file.type.match(/^image\//i)) {
        onError(field.id, "Please choose an image file.");
        return;
      }

      // Keep web part properties small. For larger images, upload the file to Site Assets and paste the URL.
      const maxInlineImageBytes = 250 * 1024;
      if (file.size > maxInlineImageBytes) {
        onError(field.id, "Image is too large for inline storage. Upload it to Site Assets and paste the URL instead.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onError(field.id, "");
        onUpdate(field.id, String(reader.result || ""));
      };
      reader.onerror = () => onError(field.id, "Could not read this image file.");
      reader.readAsDataURL(file);
    };

    return React.createElement(
      "div",
      { key: `${itemId}-imageUrl` },
      React.createElement("input", {
        type: "text",
        value: currentValue,
        placeholder: "Paste image URL or upload a small image below",
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          onError(field.id, "");
          onUpdate(field.id, event.currentTarget.value);
        },
        style: { width: "100%", boxSizing: "border-box" },
      }),
      React.createElement("input", {
        type: "file",
        accept: "image/*",
        onChange: onFileSelected,
        style: { marginTop: 8, width: "100%" },
      }),
      currentValue
        ? React.createElement("img", {
            src: currentValue,
            alt: "Preview",
            style: {
              display: "block",
              width: "100%",
              maxHeight: 90,
              objectFit: "cover",
              borderRadius: 6,
              marginTop: 8,
            },
          })
        : null
    );
  };

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams":
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }
          return environmentMessage;
        });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onDispose(): void {
    if (this._themeProvider) {
      this._themeProvider.themeChangedEvent.remove(this, this._handleThemeChanged);
    }

    ReactDom.unmountComponentAtNode(this.domElement);
    this.domElement.innerHTML = "";
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
              groupName: "Card visibility",
              groupFields: [
                PropertyPaneToggle("showDashboard", { label: "Dashboard", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showOffers", { label: "Offers", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showTraining", { label: "Trainings", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showGallery", { label: "Gallery", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showDocuments", { label: "Procedures", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showLetsCelebrate", { label: "Let's Celebrate", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showAboutDhre", { label: "About DHRE", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showTaskApprovals", { label: "Approvals", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showNewsletters", { label: "Newsletters", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showMeetings", { label: "Meetings", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showServiceLinks", { label: "Links", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showForms", { label: "Forms", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showEvents", { label: "Events", onText: "Show", offText: "Hide" }),
                PropertyPaneToggle("showBeverageMenu", { label: "Services", onText: "Show", offText: "Hide" }),
              ],
            },
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("letsCelebrate", {
                  label: "Please enter URL for 'Let's Celebrate' see all",
                }),
                PropertyPaneTextField("trainingAndDevelopment", {
                  label: "Please enter URL for 'Training & Development' see all",
                }),
                PropertyPaneTextField("upcomingEvents", {
                  label: "Please enter URL for 'Upcoming events' see all",
                }),
                PropertyPaneTextField("getOffersAndDiscounts", {
                  label: "Please enter URL for 'Offers & Benefits' view all",
                }),
                PropertyPaneTextField("imageGallery", {
                  label: "Please enter URL for 'Image Gallery' see all",
                }),
                PropertyPaneTextField("documents", {
                  label: "Please enter URL for 'Documents' see all",
                }),
                PropertyPaneTextField("meeting", {
                  label: "Please enter URL for 'Meeting' view all",
                }),
                PropertyPaneTextField("interactiveForms", {
                  label: "Please enter URL for 'Interactive Forms' view all",
                }),
                PropertyPaneTextField("dashboard", {
                  label: "Please enter URL for 'Dashboard' view all",
                }),
                PropertyPaneTextField("beverageMenu", {
                  label: "Please enter URL for 'Beverage Menu' view all",
                }),
                PropertyPaneTextField("taskApprovals", {
                  label: "Please enter URL for 'Task Approvals' view all",
                }),
              ],
            },
            {
              groupName: "Custom cards",
              groupFields: [
                createCustomCardsPropertyPaneField({
                  key: "customCardsEditor",
                  value: this.properties.customCards,
                  onChanged: (cards: ICustomFeatureCardSettings[]): void => {
                    const oldValue = this.properties.customCards;
                    this.properties.customCards = cards;
                    this.onPropertyPaneFieldChanged("customCards", oldValue, cards);
                  },
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
