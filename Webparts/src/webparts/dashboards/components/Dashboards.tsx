import * as React from 'react';
import { Stack, Text, Separator } from '@fluentui/react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { listServices, DashboardCategory, DashboardItem } from '../../services/listServices';
import { ListName } from '../../services/Constants';
import { breadcrumbBeforeBackArrowSVG } from '../../assets/constants';

// global breadcrumbs (single .ts utility component)
import GlobalBreadcrumbs from '../../assets/GlobalBreadcrumbs';


import CategoryRail from './CategoryRail';
import DashboardGrid from './DashboardGrid';
import DashboardDetail from './DashboardDetail';
// import DashboardBanner from './banner/DashboardBanner';

import styles from './Dashboards.module.scss';

export interface IDashboardProps {
  context: WebPartContext;
}

type State = {
  loading: boolean;
  error?: string;

  categories: DashboardCategory[];
  selectedCategory?: DashboardCategory;

  dashboards: DashboardItem[];

  active?: DashboardItem;
  related: DashboardItem[];
  relatedTop: number;
  relatedExpanded: boolean;
  hasMoreRelated: boolean;
};

export default class Dashboards extends React.Component<IDashboardProps, State> {
  private spService: listServices;

  constructor(props: IDashboardProps) {
    super(props);
    this.state = {
      loading: true,
      categories: [],
      dashboards: [],
      related: [],
      relatedTop: 4,
      relatedExpanded: false,
      hasMoreRelated: false
    };
    this.spService = new listServices(this.props.context);
  }

  async componentDidMount(): Promise<void> {
    try {
      const categories = await this.spService.getDashboardCategories(ListName.DASH_CATEGORIES);
      const activeCats = categories.filter(c => c.isActive);
      const selectedCategory = activeCats.length ? activeCats[0] : undefined;
      this.setState({ categories: activeCats, selectedCategory }, this.loadDashboards);
    } catch (err: any) {
      this.setState({ loading: false, error: err?.message || 'Failed to load data.' });
    }
  }

  private loadDashboards = async (): Promise<void> => {
    const { selectedCategory } = this.state;
    if (!selectedCategory) { this.setState({ loading: false, dashboards: [] }); return; }
    this.setState({ loading: true });
    try {
      const dashboards = await this.spService.getDashboards(ListName.DASHBOARDS, selectedCategory.id);
      this.setState({ dashboards, loading: false });
    } catch (err: any) {
      this.setState({ loading: false, error: err?.message || 'Failed to load dashboards.' });
    }
  };

  private onSelectCategory = (category: DashboardCategory): void => {
    this.setState(
      { selectedCategory: category, active: undefined, related: [], relatedTop: 4, relatedExpanded: false, hasMoreRelated: false },
      this.loadDashboards
    );
  };

  private onOpenDashboard = async (item: DashboardItem): Promise<void> => {
    try {
      const take = this.state.relatedTop;
      const probe = await this.spService.getDashboards(ListName.DASHBOARDS, item.categoryId, take + 1, 0, item.id);
      const hasMoreRelated = probe.length > take;
      const visibleRelated = probe.slice(0, take);
      this.setState({ active: item, related: visibleRelated, relatedExpanded: false, hasMoreRelated });
    } catch {
      this.setState({ active: item, related: [], relatedExpanded: false, hasMoreRelated: false });
    }
  };

  private onViewAllRelated = async (): Promise<void> => {
    const { active } = this.state;
    if (!active) return;
    try {
      const all = await this.spService.getDashboards(ListName.DASHBOARDS, active.categoryId, undefined, undefined, active.id);
      this.setState({ related: all, relatedExpanded: true, hasMoreRelated: false });
    } catch { /* noop */ }
  };

  private onBackToMaster = (): void => {
    this.setState({ active: undefined, related: [], relatedTop: 4, relatedExpanded: false, hasMoreRelated: false });
  };

  /** Back | Home › Dashboards (Back only in detail view) */
  private renderTopBar(): React.ReactNode {
    const { active } = this.state;
    if (!active) return null;

    return (
      <div className={styles.topBar}>
        {/* EXISTING BACK BUTTON WITH ICON — kept exactly as-is */}
        {/* <button className={styles.backBtn} onClick={this.onBackToMaster} aria-label="Back" title="Back">
          <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: breadcrumbBeforeBackArrowSVG }} />
          <span>Back</span>
        </button>

        <span className={styles.divider}>|</span> */}

        {/* REPLACED Fluent UI Breadcrumb with GlobalBreadcrumbs */}
        <GlobalBreadcrumbs
          sectionLabel="Home"
          currentLabel="Dashboards"
          onBack={this.onBackToMaster} // (left label also does one-step back)
        />
      </div>
    );
  }

  render(): React.ReactElement<IDashboardProps> {
    const { loading, error, categories, selectedCategory, dashboards, active, related, relatedExpanded, hasMoreRelated } = this.state;

    const showMoreSection = active ? (related.length > 0 || hasMoreRelated) : false;
    const showViewAll = active ? (!relatedExpanded && hasMoreRelated) : false;

    return (
      <section>
        {/* {!active && <DashboardBanner />} */}

        {this.renderTopBar()}

        {/* <Separator /> */}

        <div className={styles.layout}>
          {!active && (
            <>
            <div className={styles.rail}>
              <CategoryRail
                items={categories}
                selectedId={selectedCategory?.id}
                onSelect={this.onSelectCategory}
              />
            </div>
            <div className={styles.verticleDivider}></div>
            </>
          )}


          <Stack grow>
            {loading && <Text>Loading…</Text>}
            {error && !loading && <Text styles={{ root: { color: '#c00' } }}>{error}</Text>}

            {/* Master view */}
            {!loading && !error && !active && (
              <DashboardGrid
                title={selectedCategory?.name || 'Dashboards'}
                items={dashboards}
                onOpen={this.onOpenDashboard}
                showTitle={false}
              />
            )}

            {!loading && !error && active && (
              <DashboardDetail
                item={active}
                related={related}
                onOpen={this.onOpenDashboard}
                onViewAll={this.onViewAllRelated}
                showSection={showMoreSection}
                showViewAll={showViewAll}
              />
            )}
          </Stack>
        </div>
      </section>
    );
  }
}
