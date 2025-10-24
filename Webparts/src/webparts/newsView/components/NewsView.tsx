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
  announcements: NewsRow[];
  newsItems: NewsRow[];
  filteredNewsItems: NewsRow[];
  tab: TabKey;
  dept: string;
  queryText: string;
  view: ViewMode;
  deptOpts: { key: string; text: string }[];
};


export default class NewsView extends React.Component<INewsViewProps, INewsViewState> {
  private spService: listServices;
  constructor(props: INewsViewProps) {
    super(props);
    this.state = {
      loading: true,
      allNewsItems: [],
      announcements: [],
      newsItems: [],
      filteredNewsItems: [],
      tab: "All",
      dept: "All",
      queryText: "",
      view: "grid",
      deptOpts: [{ key: "All", text: "Department : All" }],
    };
    this.spService = new listServices(this.props.context);
  }

  async componentDidMount(): Promise<void> {
    try {
      const allNewsArticles: NewsRow[] = await this.spService.getNewsStory(30);
      const depts = Array.from(new Set(allNewsArticles.map((r) => (r.department || "").trim()).filter(Boolean)));
      const deptOpts = [{ key: "All", text: "Department : All" }, ...depts.map((d) => ({ key: d, text: d }))];
      let announcements: NewsRow[] = [];
      let newsItems: NewsRow[] = [];
      allNewsArticles.filter((news) => {
        if ((news.newsType || "").toLowerCase().includes("announce")) {
          announcements.push(news);
        }
        else {
          newsItems.push(news);
        }
      })

      this.setState({
        allNewsItems: allNewsArticles,
        announcements: announcements,
        newsItems: newsItems,
        filteredNewsItems: [],
        deptOpts,
        loading: false
      });
    } catch (e: any) {
      this.setState({ loading: false, error: e?.message || "Failed to load news." });
    }
  }

  filtered(): NewsRow[] {
    const queryText = this.state.queryText.trim().toLowerCase();
    return this.state.allNewsItems.filter((news) => {
      if (queryText) {
        const inTitle = (news.title || "").toLowerCase().includes(queryText);
        if (!inTitle) return false;
      }
      return true;
    });
  }

  private onTab(tab: TabKey) { this.setState({ tab }); }
  private onDept(dept: string) { this.setState({ dept }); }
  private onSearch(queryText: string) { this.setState({ queryText }); }
  private onView(view: ViewMode) { this.setState({ view }); }


  public render(): React.ReactElement<INewsViewProps> {
    const { loading, error, tab, dept, queryText, view, deptOpts } = this.state;
    if (loading) return <div>Loading…</div>;
    if (error) return <div style={{ color: "crimson" }}>{error}</div>;

    const rows = this.filtered();


    return (
      <div className={styles.wrapper}>
        <FiltersBar
          tab={tab}
          dept={dept}
          q={queryText}
          view={view}
          deptOpts={deptOpts}
          onTab={this.onTab}
          onDept={this.onDept}
          onSearch={this.onSearch}
          onView={this.onView}

        />
        <NewsResults items={rows} view={view} />
      </div>

    );
  }
}
