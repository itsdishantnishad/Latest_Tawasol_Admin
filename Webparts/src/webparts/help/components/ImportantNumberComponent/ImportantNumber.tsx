
import * as React from "react";
import styles from "./ImportantNumber.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
const teamsIcon = require("../../assets/teamMeetingIcon.svg");
const mapIcon = require("../../assets/mapIcon.svg");
const phoneIcon = require("../../assets/callIcon.svg");

export interface IImportantNumberProps {
  context: WebPartContext;
  listTitle?: string;
}

export interface IImportantNumberItem {
  id: number;
  category: string;
  title: string;
  phoneDisplay?: string;
  phoneTel?: string;
  teamsUrl?: string;
  locationUrl?: string;
}

interface IImportantNumberState {
  loading: boolean;
  error?: string;
  groups: { category: string; items: IImportantNumberItem[] }[];
}
const openTeamsChat = (email?: string) => {
  const e = (email || "").trim();
  if (!e) return;
  window.open(
    `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(e)}`,
    "_blank",
    "noopener,noreferrer"
  );
};

export default class ImportantNumber extends React.Component<IImportantNumberProps, IImportantNumberState> {

  public static defaultProps: Partial<IImportantNumberProps> = {
    listTitle: "Help Center"
  };
  public constructor(props: IImportantNumberProps) {
    super(props);
    this.state = {
      loading: true,
      error: undefined,
      groups: []
    };
  }

  public componentDidMount(): void {
    this.loadItems().catch((err) => {
      console.error("ImportantNumber load error", err);
      this.setState({
        loading: false,
        error: "Unable to load important numbers."
      });
    });
  }



  private async loadItems(): Promise<void> {
    const sp = spfi().using(SPFx(this.props.context));
    const listTitle = this.props.listTitle as string;

    const raw: any[] = await sp.web.lists
      .getByTitle(listTitle)
      .items.select("Id", "Title", "TIRPhone", "TIRIsActive", "TIRHelpCenterCategory", "TIRUserEmail", "TIRLocationURL")
      .filter("TIRIsActive eq 1")
      .orderBy("TIRHelpCenterCategory")();

    const normalizeUrl = (field: any): string | undefined => {
      if (!field) return undefined;
      if (typeof field === "string") return field;
      return field.Url || field.url || undefined;
    };

    const normalizePhone = (
      value?: string
    ): { display?: string; tel?: string } => {
      if (!value) return {};
      const display = value.trim();
      const tel = display.replace(/\s+/g, "");
      return { display, tel };
    };

    const items: IImportantNumberItem[] = raw.map((i) => {
      const phone = normalizePhone(i.TIRPhone);
      return {
        id: i.Id,
        category: i.TIRHelpCenterCategory,
        title: i.Title,
        phoneDisplay: phone.display,
        phoneTel: phone.tel,
        teamsUrl: normalizeUrl(i.TIRUserEmail),
        locationUrl: normalizeUrl(i.TIRLocationURL),
      };
    });

    const groupMap: { [cat: string]: IImportantNumberItem[] } = {};
    items.forEach((item) => {
      if (!groupMap[item.category]) {
        groupMap[item.category] = [];
      }
      groupMap[item.category].push(item);
    });

    const categoryOrder = ["Nurse Locations", "Pantry", "Admin Hotline", "Office Locations"];

    const seenCategories: string[] = [];
    const orderedGroups: { category: string; items: IImportantNumberItem[] }[] = [];

    // Add this code to populate orderedGroups:
    categoryOrder.forEach((cat) => {
      if (groupMap[cat]) {
        orderedGroups.push({ category: cat, items: groupMap[cat] });
        seenCategories.push(cat);
      }
    });

    // Add remaining categories not in the predefined order
    Object.keys(groupMap).forEach((cat) => {
      if (!seenCategories.includes(cat)) {
        orderedGroups.push({ category: cat, items: groupMap[cat] });
      }
    });

    this.setState({
      loading: false,
      error: undefined,
      groups: orderedGroups
    });
  }

  public render(): React.ReactElement<IImportantNumberProps> {
    const { loading, error, groups } = this.state;

    if (loading) {
      return <div className={styles.wrapper}>Loading…</div>;
    }

    if (error) {
      return <div className={styles.wrapper}>{error}</div>;
    }

    if (!groups.length) {
      return (
        <div className={styles.wrapper}>
          No important numbers configured.
        </div>
      );
    }

    return (
      <div className={styles.wrapper}>
        {groups.map((g) => (
          <div key={g.category} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{g.category}</span>
            </div>
            <div className={styles.cardBody}>
              {g.items.map((item) => this.renderRow(item))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  private renderRow(item: IImportantNumberItem): JSX.Element {
    return (
      <div key={item.id} className={styles.row}>
        <div className={styles.rowLeft}>
          <div className={styles.rowLabel}>{item.title}</div>
        </div>

        <div className={styles.rowRight}>
          {item.teamsUrl && (
            <button
              type="button"
              className={styles.iconLink}
              aria-label="Teams chat"
              onClick={() => openTeamsChat(item.teamsUrl)}
            >
              <img src={teamsIcon} alt="Teams" className={styles.iconImage} />
            </button>
          )}

          {item.locationUrl && (
            <a href={item.locationUrl} target="_blank" rel="noreferrer" className={styles.iconLink} aria-label="Location" >
              <img src={mapIcon} alt="Location" className={styles.iconImage} />
            </a>
          )}

          {item.phoneDisplay && (
            <a className={styles.phoneLink} href={item.phoneTel ? `tel:${item.phoneTel}` : undefined} >
              <img src={phoneIcon} alt="Phone" className={styles.iconImage} />
              <span className={styles.phoneText}>{item.phoneDisplay}</span>
            </a>
          )}
        </div>
      </div>
    );
  }
}