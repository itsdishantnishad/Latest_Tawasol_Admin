// TeamDepartmentStructure.tsx

import * as React from "react";
import styles from "./TeamOrganisationStructure.module.scss";
import {
  listServices,
  OrgDepartment,
  OrgMember,
} from "../../services/listServices";
import { ListName } from "../../services/Constants";

export interface ITeamDepartmentStructureProps {
  member: OrgMember;
  spService: listServices;
  deptListTitle?: string;
}

export interface ITeamDepartmentStructureState {
  departments: OrgDepartment[];
  loading: boolean;
  activeDepartmentIndex: number;
}

export default class TeamDepartmentStructure extends React.Component<
  ITeamDepartmentStructureProps,
  ITeamDepartmentStructureState
> {
  private isComponentMounted = false;
  private requestId = 0;

  constructor(props: ITeamDepartmentStructureProps) {
    super(props);
    this.state = {
      departments: [],
      loading: true,
      activeDepartmentIndex: 0,
    };
  }

  public componentDidMount(): void {
    this.isComponentMounted = true;
    this.loadDepartments().catch(() => undefined);
  }

  public componentDidUpdate(prevProps: ITeamDepartmentStructureProps): void {
    const prevDeptList = (prevProps.deptListTitle || "").trim();
    const nextDeptList = (this.props.deptListTitle || "").trim();

    if (
      prevProps.member.id !== this.props.member.id ||
      prevProps.member.user !== this.props.member.user ||
      prevDeptList !== nextDeptList
    ) {
      this.loadDepartments().catch(() => undefined);
    }
  }

  public componentWillUnmount(): void {
    this.isComponentMounted = false;
    this.requestId += 1;
  }

  private async loadDepartments(): Promise<void> {
    const currentRequestId = ++this.requestId;
    const key = (this.props.member.user || "").trim();

    this.setState({ departments: [], loading: true, activeDepartmentIndex: 0 });

    if (!key) {
      this.safeSetState(currentRequestId, {
        departments: [],
        loading: false,
        activeDepartmentIndex: -1,
      });
      return;
    }

    try {
      const deptList = (
        this.props.deptListTitle || ListName.TEAM_ORG_DEPARTMENTS
      ).trim();

      const departments = await this.props.spService.getDepartmentsByMember(
        deptList,
        key
      );

      this.safeSetState(currentRequestId, {
        departments,
        loading: false,
        activeDepartmentIndex: departments.length > 0 ? 0 : -1,
      });
    } catch {
      this.safeSetState(currentRequestId, {
        departments: [],
        loading: false,
        activeDepartmentIndex: -1,
      });
    }
  }

  private safeSetState(
    requestId: number,
    nextState: Partial<ITeamDepartmentStructureState>
  ): void {
    if (!this.isComponentMounted || requestId !== this.requestId) return;
    this.setState(nextState as ITeamDepartmentStructureState);
  }

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

  private toggleDepartment = (index: number): void => {
    this.setState((prev) => ({
      activeDepartmentIndex:
        prev.activeDepartmentIndex === index ? -1 : index,
    }));
  };

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

  private renderDepartmentBullets(department: OrgDepartment): JSX.Element | null {
    const bullets = this.parseBullets((department.itemsText as string) || "");

    if (bullets.length === 0) return null;

    return (
      <ul className={styles.deptList}>
        {bullets.map((bullet, index) => (
          <li key={index}>{bullet}</li>
        ))}
      </ul>
    );
  }

  private renderDesktopDepartments(): JSX.Element {
    const { departments } = this.state;

    return (
      <div className={styles.deptGrid}>
        {departments.length === 0 && (
          <div className={styles.state}>No departments mapped for this person.</div>
        )}

        {departments.map((department, index) => {
          const box = (
            <div className={styles.deptBox} role="group" aria-label={department.name}>
              {department.name}
            </div>
          );

          return (
            <div key={`${department.name}_${index}`} className={styles.deptCol}>
              {department.url ? (
                <a
                  className={styles.deptLink}
                  href={department.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={department.name}
                >
                  {box}
                </a>
              ) : (
                <div title={department.name}>{box}</div>
              )}

              {this.renderDepartmentBullets(department)}
            </div>
          );
        })}
      </div>
    );
  }

  private renderMobileDepartments(): JSX.Element {
    const { departments, activeDepartmentIndex } = this.state;

    return (
      <div className={styles.deptAccordion}>
        {departments.length === 0 && (
          <div className={styles.state}>No departments mapped for this person.</div>
        )}

        {departments.map((department, index) => {
          const isOpen = activeDepartmentIndex === index;
          const panelId = `department_panel_${this.props.member.id}_${index}`;
          const buttonId = `department_button_${this.props.member.id}_${index}`;

          return (
            <div key={`${department.name}_${index}`} className={styles.deptAccordionItem}>
              <button
                id={buttonId}
                type="button"
                className={styles.deptAccordionHeader}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => this.toggleDepartment(index)}
              >
                <span>{department.name}</span>
                <span
                  className={[
                    styles.deptChevron,
                    isOpen ? styles.deptChevronOpen : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={styles.deptAccordionPanel}
                >
                  {this.renderDepartmentBullets(department)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  private renderDepartmentsBand(): JSX.Element {
    const { departments } = this.state;

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

        {this.renderDesktopDepartments()}
        {this.renderMobileDepartments()}
      </div>
    );
  }

  public render(): React.ReactElement<ITeamDepartmentStructureProps> {
    return this.state.loading
      ? this.renderDepartmentsShimmer()
      : this.renderDepartmentsBand();
  }
}
