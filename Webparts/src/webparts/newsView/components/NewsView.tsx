import * as React from 'react';
import styles from './NewsView.module.scss';
import type { INewsViewProps } from './INewsViewProps';
import { listServices } from '../../services/listServices';
import NewsResults from './NewsResults';
import FiltersBar from './FiltersBar';

export type TabKey = "All" | "Announcements";
export type ViewMode = "grid" | "list";

export type NewsRow = {
  title: string;
  readTime?: number;
  department?: string;
  tags?: string | string[];
  pageView?: number;
  newsImage?: string;
  newsType?: string;
  author?: string;
  authorEmail?: string;
  path: string;
  created: string;
  listItemId?: number;
  lastModified: string;
};

export interface INewsViewState {
  loading: boolean;
  error?: string;

  allNewsItems: NewsRow[];
  announcementItems: NewsRow[];

  activeTab: TabKey;
  selectedDepartment: string; // "All" or dept name
  searchQuery: string;
  viewMode: ViewMode;

  departmentOptions: { key: string; text: string }[];
}

export default class NewsView extends React.Component<INewsViewProps, INewsViewState> {
  private newsDataService: listServices;

  constructor(props: INewsViewProps) {
    super(props);
    this.state = {
      loading: true,
      allNewsItems: [],
      announcementItems: [],

      activeTab: "All",
      selectedDepartment: "All",
      searchQuery: "",
      viewMode: "grid",

      departmentOptions: [{ key: "All", text: "Department : All" }],
    };

    this.newsDataService = new listServices(this.props.context);

    // Bind handlers (class-based, explicit)
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleDepartmentChange = this.handleDepartmentChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleViewModeChange = this.handleViewModeChange.bind(this);
  }

  async componentDidMount(): Promise<void> {
    try {
      const allNewsArticles: NewsRow[] = await this.newsDataService.getNewsStory(30);

      // Compute announcements once; reuse in filter pipeline
      const announcementItems: NewsRow[] = allNewsArticles.filter(this.isAnnouncement);

      // Build department dropdown options (unique, non-empty)
      const uniqueDepartments = Array.from(
        new Set(
          allNewsArticles
            .map(a => (a.department || "").trim())
            .filter(Boolean)
        )
      );

      const departmentOptions = [
        { key: "All", text: "Department : All" },
        ...uniqueDepartments.map(name => ({ key: name, text: name })),
      ];

      this.setState({
        allNewsItems: allNewsArticles,
        announcementItems,
        departmentOptions,
        loading: false
      });
    } catch (e: any) {
      this.setState({ loading: false, error: e?.message || "Failed to load news." });
    }
  }

  // ======== Reusable predicates / helpers (enterprise-friendly, testable) ========

  private normalize(value?: string): string {
    return (value || "").trim().toLowerCase();
  }

  private isAnnouncement = (item: NewsRow): boolean => {
    const t = this.normalize(item.newsType);
    return t.includes("announce"); // covers "Announcement", "Announcements"
  };

  private matchesTab = (item: NewsRow, tab: TabKey): boolean => {
    if (tab === "All") return true;
    // Only announcements for the Announcements tab
    return this.isAnnouncement(item);
  };

  private matchesDepartment = (item: NewsRow, selectedDepartment: string): boolean => {
    if (selectedDepartment === "All") return true;
    return this.normalize(item.department) === this.normalize(selectedDepartment);
  };

  private matchesQuery = (item: NewsRow, normalizedQuery: string): boolean => {
    if (!normalizedQuery) return true;

    const inTitle = this.normalize(item.title).includes(normalizedQuery);
    const inDept = this.normalize(item.department).includes(normalizedQuery);
    const inAuthor = this.normalize(item.author).includes(normalizedQuery);

    // tags can be string or string[]
    let inTags = false;
    if (Array.isArray(item.tags)) {
      inTags = item.tags.some(tag => this.normalize(tag).includes(normalizedQuery));
    } else if (typeof item.tags === "string") {
      inTags = this.normalize(item.tags).includes(normalizedQuery);
    }

    return inTitle || inDept || inAuthor || inTags;
  };

  private getFilteredNews(): NewsRow[] {
    const { allNewsItems, activeTab, selectedDepartment, searchQuery } = this.state;
    const normalizedQuery = this.normalize(searchQuery);

    // Start from All items; we use predicates so this is linear and easy to extend
    return allNewsItems
      .filter(item => this.matchesTab(item, activeTab))
      .filter(item => this.matchesDepartment(item, selectedDepartment))
      .filter(item => this.matchesQuery(item, normalizedQuery));
  }

  // ======== Event handlers ========
  private handleTabChange(tab: TabKey) { this.setState({ activeTab: tab }); }
  private handleDepartmentChange(dept: string) { this.setState({ selectedDepartment: dept }); }
  private handleSearchChange(queryText: string) { this.setState({ searchQuery: queryText }); }
  private handleViewModeChange(view: ViewMode) { this.setState({ viewMode: view }); }

  // ======== Render ========
  public render(): React.ReactElement<INewsViewProps> {
    const {
      loading, error,
      activeTab, selectedDepartment, searchQuery, viewMode, departmentOptions
    } = this.state;

    if (loading) return <div>Loading…</div>;
    if (error) return <div style={{ color: "crimson" }}>{error}</div>;

    const filteredRows = this.getFilteredNews();

    return (
      <div className={styles.wrapper}>
        <FiltersBar
          tab={activeTab}
          dept={selectedDepartment}
          q={searchQuery}
          view={viewMode}
          deptOpts={departmentOptions}
          onTab={this.handleTabChange}
          onDept={this.handleDepartmentChange}
          onSearch={this.handleSearchChange}
          onView={this.handleViewModeChange}
        />
        <NewsResults items={filteredRows} view={viewMode} />
      </div>
    );
  }
}
