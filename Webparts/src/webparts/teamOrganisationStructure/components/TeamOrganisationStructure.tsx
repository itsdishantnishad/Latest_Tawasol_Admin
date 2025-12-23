import * as React from "react";
import styles from "./TeamOrganisationStructure.module.scss";
import { ITeamOrganisationStructureProps } from "./ITeamOrganisationStructureProps";
import { listServices, OrgMember, OrgDepartment } from "../../services/listServices";
import { ListName } from "../../services/Constants";

export interface ITeamOrganisationStructureState {
  items: OrgMember[];
  loading: boolean;
  error?: string | null;
  selectedId?: number | null;
  selectedLevel?: number | null;
  departments: OrgDepartment[];
  loadingDepts: boolean;
}

export default class TeamOrganisationStructure extends React.Component<
  ITeamOrganisationStructureProps,
  ITeamOrganisationStructureState
> {
  private spService: listServices;

  constructor(props: ITeamOrganisationStructureProps) {
    super(props);
    this.state = {
      items: [],
      loading: true,
      error: null,
      selectedId: null,
      selectedLevel: null,
      departments: [],
      loadingDepts: false,
    };
    this.spService = new listServices(this.props.context);
  }

  public async componentDidMount(): Promise<void> {
    await this.loadMembers();
  }

  public async componentDidUpdate(prevProps: ITeamOrganisationStructureProps): Promise<void> {
    const prevTitle = (prevProps.listTitle || "").trim();
    const nextTitle = (this.props.listTitle || "").trim();
    if (prevTitle !== nextTitle) {
      await this.loadMembers();
    }
  }

  private async loadMembers(): Promise<void> {
    try {
      this.setState({
        loading: true,
        error: null,
        selectedId: null,
        selectedLevel: null,
        departments: [],
      });

      const sourceList = this.props.listTitle?.trim() || ListName.ORGANISATION_STRUCTURE;
      const members = await this.spService.getOrganisationMembers(sourceList);

      this.setState({ items: members, loading: false });
    } catch (err: any) {
      this.setState({
        error: err?.message || "Failed to load.",
        loading: false,
      });
    }
  }

  private onCardClick = (member: OrgMember): void => {
    this.setState(
      (prev) => {
        const isSamePerson = prev.selectedId === member.id;

        if (isSamePerson) {
          return {
            ...prev,
            selectedId: null,
            selectedLevel: null,
            departments: [],
            loadingDepts: false,
          };
        }

        return {
          ...prev,
          selectedId: member.id,
          selectedLevel: member.level,
          departments: [],
          loadingDepts: true,
        };
      },
      async () => {
        const { selectedId } = this.state;
        if (selectedId !== member.id) return;

        const key = (member.user || "").trim();
        if (!key) {
          this.setState((current) =>
            current.selectedId === member.id
              ? { ...current, departments: [], loadingDepts: false }
              : current
          );
          return;
        }

        try {
          const deptList = (this.props.deptListTitle || ListName.TEAM_ORG_DEPARTMENTS).trim();
          const depts = await this.spService.getDepartmentsByMember(deptList, key);

          this.setState((current) =>
            current.selectedId === member.id
              ? { ...current, departments: depts, loadingDepts: false }
              : current
          );
        } catch {
          this.setState((current) =>
            current.selectedId === member.id
              ? { ...current, departments: [], loadingDepts: false }
              : current
          );
        }
      }
    );
  };

  /**
   * ✅ IMPORTANT:
   * SharePoint multiline (rich text) often comes as HTML (<div><p>..</p></div>)
   * We convert HTML -> real text WITH line breaks using innerText, then split into bullets.
   */
  private normalizeMultiline(raw?: string): string {
    if (!raw) return "";

    const s = String(raw);

    // if it looks like HTML, decode + keep line breaks
    const looksHtml = /<\/?[a-z][\s\S]*>/i.test(s);

    if (looksHtml && typeof document !== "undefined") {
      const tmp = document.createElement("div");
      tmp.innerHTML = s;

      // innerText preserves line breaks between <p>, <div>, <br>, <li>, etc.
      const text = (tmp.innerText || tmp.textContent || "").replace(/\u00A0/g, " ");
      return text;
    }

    // plain text case
    return s.replace(/\u00A0/g, " ");
  }

  private parseBullets(raw?: string): string[] {
    const text = this.normalizeMultiline(raw);

    return text
      .split(/\r?\n/)
      .map((x) => x.replace(/^[\u2022•\-\*]\s*/g, "").trim()) // remove leading bullet chars if pasted
      .filter(Boolean);
  }

  public render(): React.ReactElement<ITeamOrganisationStructureProps> {
    const { items, loading, error, selectedLevel } = this.state;

    const rootMember = items.find((m) => m.level === 0);
    const nonRoot = items.filter((m) => m.level !== 0);

    const membersByLevel: Record<number, OrgMember[]> = {};
    nonRoot.forEach((m) => (membersByLevel[m.level] ||= []).push(m));
    const orderedLevels = Object.keys(membersByLevel)
      .map(Number)
      .sort((l, r) => l - r);

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
            {rootMember && <div className={styles.topCardWrap}>{this.renderCard(rootMember, true)}</div>}

            {orderedLevels.map((level) => (
              <React.Fragment key={level}>
                <div className={styles.row}>
                  {membersByLevel[level].map((person) => (
                    <React.Fragment key={person.id}>{this.renderCard(person, false)}</React.Fragment>
                  ))}
                </div>

                {selectedLevel === level && this.renderDepartmentsBand()}
              </React.Fragment>
            ))}
          </>
        )}
      </section>
    );
  }

  private renderCard(member: OrgMember, isRoot: boolean): JSX.Element {
    const isSelected = this.state.selectedId === member.id;

    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={`Select ${member.name}`}
        onClick={() => this.onCardClick(member)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && this.onCardClick(member)}
        className={[styles.card, isRoot ? styles.cardLg : "", isSelected ? styles.cardSelected : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.photoWrap}>
          {member.photoUrl ? (
            <img className={styles.photo} src={member.photoUrl} alt={member.name} />
          ) : (
            <div className={styles.photoFallback} aria-label="No image" />
          )}
        </div>

        <div className={`${styles.accent} ${isRoot ? styles.accentCenter : ""}`} aria-hidden />
        <div className={styles.name}>{member.name}</div>
        <div className={styles.role}>{member.role}</div>
      </div>
    );
  }

  private renderDepartmentsBand(): JSX.Element {
    const { departments, loadingDepts } = this.state;

    const count = Math.max(departments.length, 1);
    const stubs = new Array(count).fill(0).map((_, i) => {
      const pct = (i + 0.5) * (100 / count);
      return <span key={i} className={styles.stub} style={{ left: `${pct}%` }} aria-hidden />;
    });

    return (
      <div className={styles.deptBand}>
        <div className={styles.deptTitle}>DEPARTMENTS</div>

        <div className={styles.deptRail} aria-hidden>
          {stubs}
        </div>

        {loadingDepts && <div className={styles.state}>Loading departments…</div>}

        {!loadingDepts && (
          <div className={styles.deptGrid}>
            {departments.length === 0 && (
              <div className={styles.state}>No departments mapped for this person.</div>
            )}

            {departments.map((d, i) => {
              const rawPointers = (d.itemsText as string) || "";

              const bullets = this.parseBullets(rawPointers);

              const box = (
                <div className={styles.deptBox} role="group" aria-label={d.name}>
                  {d.name}
                </div>
              );

              return (
                <div key={i} className={styles.deptCol}>
                  {d.url ? (
                    <a
                      className={styles.deptLink}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={d.name}
                    >
                      {box}
                    </a>
                  ) : (
                    <div title={d.name}>{box}</div>
                  )}

                  {/* ✅ Bullet list (same like Figma) */}
                  {bullets.length > 0 && (
                    <ul className={styles.deptList}>
                      {bullets.map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
