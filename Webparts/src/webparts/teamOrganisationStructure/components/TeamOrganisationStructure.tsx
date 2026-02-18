import * as React from "react";
import styles from "./TeamOrganisationStructure.module.scss";
import { ITeamOrganisationStructureProps } from "./ITeamOrganisationStructureProps";
import {
  listServices,
  OrgMember,
  OrgDepartment,
} from "../../services/listServices";
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

  public async componentDidUpdate(
    prevProps: ITeamOrganisationStructureProps
  ): Promise<void> {
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
        loadingDepts: false,
      });

      const sourceList =
        this.props.listTitle?.trim() || ListName.ORGANISATION_STRUCTURE;

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
          const deptList = (
            this.props.deptListTitle || ListName.TEAM_ORG_DEPARTMENTS
          ).trim();

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

  private normalizeMultiline(raw?: string): string {
    if (!raw) return "";
    const s = String(raw);

    const looksHtml = /<\/?[a-z][\s\S]*>/i.test(s) || s.indexOf("ExternalClass") > -1;
    if (looksHtml && typeof document !== "undefined") {
      const tmp = document.createElement("div");
      tmp.innerHTML = s;
      const text = (tmp.innerText || tmp.textContent || "").replace(/\u00A0/g, " ");
      return text;
    }
    return s.replace(/\u00A0/g, " ");
  }

  private parseBullets(raw?: string): string[] {
    const text = this.normalizeMultiline(raw)
      .replace(/\u2022/g, "\n")
      .replace(/\u00B7/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();

    return text
      .split("\n")
      .map((x) => x.replace(/^[\u2022•\-\*]\s*/g, "").trim())
      .filter(Boolean);
  }

  // ✅ Card-by-card shimmer (clean UI)
  private renderCardsShimmer(): JSX.Element {
    const ShimmerCard = ({ large }: { large?: boolean }) => (
      <div
        className={`${styles.shimmerCard} ${large ? styles.shimmerCardLg : ""}`}
        aria-hidden="true"
      >
        <div className={styles.shimmerAvatar} />
        <div className={`${styles.shimmerLine} ${styles.shimmerLineName}`} />
        <div className={`${styles.shimmerLine} ${styles.shimmerLineRole}`} />
      </div>
    );

    return (
      <div className={styles.shimmerContainer} aria-label="Loading organisation structure">
        <div className={styles.shimmerRow}>
          <ShimmerCard large />
        </div>

        <div className={styles.shimmerRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerCard key={`row1_${i}`} />
          ))}
        </div>

        <div className={styles.shimmerRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerCard key={`row2_${i}`} />
          ))}
        </div>
      </div>
    );
  }

  private renderDepartmentsShimmer(): JSX.Element {
    return (
      <div className={styles.deptBand} aria-label="Loading departments">
        <div className={styles.deptTitle}>DEPARTMENTS</div>
        <div className={styles.deptShimmerGrid} aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.deptShimmerBox} />
          ))}
        </div>
      </div>
    );
  }

  public render(): React.ReactElement<ITeamOrganisationStructureProps> {
    const { items, loading, error, selectedLevel, selectedId, loadingDepts } = this.state;

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

        {loading && this.renderCardsShimmer()}

        {!loading && error && (
          <div className={styles.error}>
            {error}
            <button className={styles.retryBtn} onClick={() => this.loadMembers()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {rootMember && (
              <div className={styles.topCardWrap}>
                {this.renderCard(rootMember, true)}
              </div>
            )}

            {orderedLevels.map((level) => (
              <React.Fragment key={level}>
                <div className={styles.row}>
                  {membersByLevel[level].map((person) => (
                    <React.Fragment key={person.id}>
                      {this.renderCard(person, false)}
                    </React.Fragment>
                  ))}
                </div>

                {selectedLevel === level && selectedId && loadingDepts
                  ? this.renderDepartmentsShimmer()
                  : selectedLevel === level
                  ? this.renderDepartmentsBand()
                  : null}
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
        className={[
          styles.card,
          isRoot ? styles.cardLg : "",
          isSelected ? styles.cardSelected : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[styles.photoWrap, isRoot ? styles.photoWrapLg : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {member.photoUrl ? (
            <img
              className={styles.photo}
              src={member.photoUrl}
              alt={member.name}
              loading="lazy"
            />
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

    return (
      <div className={styles.deptBand}>
        <div className={styles.deptTitle}>DEPARTMENTS</div>

        <div className={styles.deptRail} aria-hidden="true">
          <div className={styles.stubRow}>
            {Array.from({ length: Math.max(departments.length, 1) }).map((_, i) => (
              <span key={i} className={styles.stubGrid} />
            ))}
          </div>
        </div>

        {!loadingDepts && (
          <div className={styles.deptGrid}>
            {departments.length === 0 && (
              <div className={styles.state}>No departments mapped for this person.</div>
            )}

            {departments.map((d, i) => {
              const bullets = this.parseBullets((d.itemsText as string) || "");

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
