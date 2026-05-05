// TeamOrganisationStructure.tsx

import * as React from "react";
import styles from "./TeamOrganisationStructure.module.scss";
import { ITeamOrganisationStructureProps } from "./ITeamOrganisationStructureProps";
import { listServices, OrgMember } from "../../services/listServices";
import { ListName } from "../../services/Constants";
import TeamDepartmentStructure from "./TeamDepartmentStructure";

export interface ITeamOrganisationStructureState {
  items: OrgMember[];
  loading: boolean;
  error?: string | null;
  selectedId?: number | null;
  cardsPerRow: number;
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
      cardsPerRow: this.getCardsPerRow(),
    };
    this.spService = new listServices(this.props.context);
  }

  public async componentDidMount(): Promise<void> {
    window.addEventListener("resize", this.handleResize);
    await this.loadMembers();
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.handleResize);
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

  private handleResize = (): void => {
    const nextCardsPerRow = this.getCardsPerRow();
    if (nextCardsPerRow !== this.state.cardsPerRow) {
      this.setState({ cardsPerRow: nextCardsPerRow });
    }
  };

  private getCardsPerRow(): number {
    if (typeof window === "undefined") return 5;

    const width = window.innerWidth;
    if (width <= 820) return 2;
    if (width <= 1050) return 3;
    if (width <= 1300) return 4;
    return 5;
  }

  private async loadMembers(): Promise<void> {
    try {
      this.setState({
        loading: true,
        error: null,
        selectedId: null,
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

  private onCardClick = (member: OrgMember, isRoot: boolean): void => {
    if (isRoot) return;

    this.setState((prev) => ({
      selectedId: prev.selectedId === member.id ? null : member.id,
    }));
  };

  private chunkMembers(members: OrgMember[], size: number): OrgMember[][] {
    const safeSize = Math.max(size, 1);
    const chunks: OrgMember[][] = [];

    for (let i = 0; i < members.length; i += safeSize) {
      chunks.push(members.slice(i, i + safeSize));
    }

    return chunks;
  }

  // Card-by-card shimmer (clean UI)
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

  private renderDepartmentFor(member: OrgMember): JSX.Element {
    return (
      <TeamDepartmentStructure
        key={`departments_${member.id}`}
        member={member}
        spService={this.spService}
        deptListTitle={this.props.deptListTitle}
      />
    );
  }

  private renderMemberRow(
    rowMembers: OrgMember[],
    rowKey: string,
    selectedMember?: OrgMember
  ): JSX.Element {
    const rowHasSelectedMember =
      !!selectedMember && rowMembers.some((person) => person.id === selectedMember.id);

    return (
      <React.Fragment key={rowKey}>
        <div className={styles.row}>
          {rowMembers.map((person) => this.renderCard(person, false))}
        </div>

        {rowHasSelectedMember && selectedMember
          ? this.renderDepartmentFor(selectedMember)
          : null}
      </React.Fragment>
    );
  }

  private renderMobileRows(
    orderedMembers: OrgMember[],
    selectedMember?: OrgMember
  ): JSX.Element[] {
    return this.chunkMembers(orderedMembers, 2).map((rowMembers, rowIndex) =>
      this.renderMemberRow(rowMembers, `mobile_${rowIndex}`, selectedMember)
    );
  }

  private renderDesktopRows(
    membersByLevel: Record<number, OrgMember[]>,
    orderedLevels: number[],
    selectedMember?: OrgMember
  ): JSX.Element[] {
    const rows: JSX.Element[] = [];
    const { cardsPerRow } = this.state;

    orderedLevels.forEach((level) => {
      const levelRows = this.chunkMembers(membersByLevel[level], cardsPerRow);

      levelRows.forEach((rowMembers, rowIndex) => {
        rows.push(
          this.renderMemberRow(
            rowMembers,
            `level_${level}_row_${rowIndex}`,
            selectedMember
          )
        );
      });
    });

    return rows;
  }

  public render(): React.ReactElement<ITeamOrganisationStructureProps> {
    const { items, loading, error, selectedId, cardsPerRow } = this.state;

    const rootMember = items.find((m) => m.level === 0);
    const nonRoot = items.filter((m) => m.level !== 0);

    const membersByLevel: Record<number, OrgMember[]> = {};
    nonRoot.forEach((m) => (membersByLevel[m.level] ||= []).push(m));

    const orderedLevels = Object.keys(membersByLevel)
      .map(Number)
      .sort((l, r) => l - r);

    const orderedNonRootMembers = orderedLevels.reduce<OrgMember[]>(
      (acc, level) => acc.concat(membersByLevel[level]),
      []
    );

    const selectedMember = selectedId
      ? orderedNonRootMembers.find((member) => member.id === selectedId)
      : undefined;

    const shouldFlattenRows = cardsPerRow <= 2;

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

            {shouldFlattenRows
              ? this.renderMobileRows(orderedNonRootMembers, selectedMember)
              : this.renderDesktopRows(membersByLevel, orderedLevels, selectedMember)}
          </>
        )}
      </section>
    );
  }

  private renderCard(member: OrgMember, isRoot: boolean): JSX.Element {
    const isSelected = !isRoot && this.state.selectedId === member.id;
    const isInteractive = !isRoot;

    const className = [
      styles.card,
      isRoot ? styles.cardLg : "",
      isRoot ? styles.cardStatic : styles.cardInteractive,
      isSelected ? styles.cardSelected : "",
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
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
      </>
    );

    if (!isInteractive) {
      return <div className={className}>{content}</div>;
    }

    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={`Select ${member.name}`}
        onClick={() => this.onCardClick(member, isRoot)}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && this.onCardClick(member, isRoot)
        }
        className={className}
      >
        {content}
      </div>
    );
  }
}
