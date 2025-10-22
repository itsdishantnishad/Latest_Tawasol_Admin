import * as React from "react";
import styles from "./TeamOrganisationStructure.module.scss";
import { ITeamOrganisationStructureProps } from "./ITeamOrganisationStructureProps";
import { listServices, OrgMember, ListName } from "../../services/listServices";

export interface ITeamOrganisationStructureState {
  items: OrgMember[];
  loading: boolean;
  error?: string | null;
}

export default class TeamOrganisationStructure
  extends React.Component<ITeamOrganisationStructureProps, ITeamOrganisationStructureState> {

  private spService: listServices;

  public constructor(props: ITeamOrganisationStructureProps) {
    super(props);
    this.state = { items: [], loading: true, error: null };
    this.spService = new listServices(this.props.context);
  }

  public async componentDidMount(): Promise<void> {
    await this.load();
  }

  public async componentDidUpdate(prevProps: ITeamOrganisationStructureProps): Promise<void> {
    if ((prevProps.listTitle || "").trim() !== (this.props.listTitle || "").trim()) {
      await this.load();
    }
  }

  private async load(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });
      const listTitle = (this.props.listTitle && this.props.listTitle.trim().length > 0)
        ? this.props.listTitle!.trim()
        : ListName.ORGANISATION_STRUCTURE;
      const data = await this.spService.getOrganisationMembers(listTitle);
      this.setState({ items: data, loading: false });
    } catch (e: any) {
      this.setState({ error: e?.message || "Failed to load.", loading: false });
    }
  }

  public render(): React.ReactElement<ITeamOrganisationStructureProps> {
    const { items, loading, error } = this.state;

    const top = items.find(m => m.level === 0);
    const rest = items.filter(m => m.level !== 0);

    // group others by level
    const levels: Array<{ level: number; people: OrgMember[] }> = [];
    rest.forEach(p => {
      const hit = levels.find(g => g.level === p.level);
      if (hit) hit.people.push(p);
      else levels.push({ level: p.level, people: [p] });
    });
    levels.sort((a, b) => a.level - b.level);

    return (
      <section className={styles.wrapper} aria-labelledby="teamOrgHeading">
        <h2 id="teamOrgHeading" className={styles.title}>
          <span className={styles.teamWord}>Team</span>{" "}
          <span className={styles.orgWord}>Organisation Structure</span>
        </h2>

        {loading && <div className={styles.state}>Loading…</div>}
        {!loading && error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <>
            {top && (
              <div className={styles.topCardWrap}>
                {this.renderCard(top, "lg")}
              </div>
            )}

            {levels.map(g => (
              <div key={g.level} className={styles.row}>
                {g.people.map(p => (
                  <React.Fragment key={p.id}>
                    {this.renderCard(p, "md")}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </>
        )}
      </section>
    );
  }

  private renderCard(member: OrgMember, size: "lg" | "md"): JSX.Element {
    return (
      <div className={`${styles.card} ${size === "lg" ? styles.cardLg : (styles as any).cardMd}`}>
        <div className={styles.photoWrap}>
          {member.photoUrl
            ? <img className={styles.photo} src={member.photoUrl} alt={member.name} />
            : <div className={styles.photoFallback} aria-label="No image" />}
        </div>
        <div className={styles.accent} aria-hidden />
        <div className={styles.name}>{member.name}</div>
        <div className={styles.role}>{member.role}</div>
      </div>
    );
  }
}
