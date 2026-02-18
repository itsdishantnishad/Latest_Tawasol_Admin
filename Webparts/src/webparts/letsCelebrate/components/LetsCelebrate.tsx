// src/webparts/LetsCelebrate/LetsCelebrate.tsx

import * as React from 'react';
import stylesNav from '../../Components/NavTabs/NavTabs.module.scss';
import styles from './LetsCelebrate.module.scss';
import type { ILetsCelebrateProps } from './ILetsCelebrateProps';
import NewJoiner from './NewJoiner/NewJoiner';
import Birthday from './Birthday/Birthday';
import { listServices } from '../../services/listServices';
import NavTabs, { NavTabsOption } from '../../Components/NavTabs/NavTabs';
import Achievements from './Achievements/Achievement';
import { TahweelService, TahweelActiveEmployee } from '../../services/Integration/TahweelService';
import type { IPersonBase } from './Birthday/PeopleSimpleFeed';
import { LoadingBoundary } from '../../Components/LoadingShimmer/LoadingBoundary';

const DefaultAvatar: string = require('../../assets/profileCircleImg.svg');

export interface ILetsCelebrateState {
  selectedTab: 'birthdays' | 'anniversaries' | 'newJoiners' | 'achievements';

  newJoinersData: any[];
  birthdayItems: IPersonBase[];
  anniversaryItems: IPersonBase[];

  loadingBirthdays: boolean;
  loadingAnniversaries: boolean;
  loadingNewJoiners: boolean;
  errorBirthdays: string | null;
  errorAnniversaries: string | null;
  errorNewJoiners: string | null;
}

type LetsCelebrateTabKey = ILetsCelebrateState['selectedTab'];

/** ✅ Read initial tab from URL like your toggle.tsx */
const getInitialTab = (): LetsCelebrateTabKey => {
  if (typeof window === "undefined") return "birthdays";

  const raw = new URLSearchParams(window.location.search).get("tab") || "";
  const norm = raw.trim().toLowerCase().replace(/[\s_-]/g, "");

  switch (norm) {
    case "birthdays":
    case "birthday":
      return "birthdays";

    case "anniversaries":
    case "anniversary":
      return "anniversaries";

    case "newjoiners":
    case "newjoiner":
      return "newJoiners";

    case "achievements":
    case "achievement":
      return "achievements";

    default:
      return "birthdays";
  }
};

/* Write tab to URL (replaceState like your toggle.tsx) */
const tabToUrlValue = (tab: LetsCelebrateTabKey) => {
  switch (tab) {
    case "newJoiners": return "newjoiners";
    default: return tab; // birthdays, anniversaries, achievements
  }
};

const setUrlTab = (tab: LetsCelebrateTabKey) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tabToUrlValue(tab));
  window.history.replaceState({}, "", url.toString());
};

export default class LetsCelebrate extends React.Component<ILetsCelebrateProps, ILetsCelebrateState> {
  private spService: listServices;
  private tahweelService: TahweelService;

  private _onPopState = () => {
    const t = getInitialTab();
    if (t !== this.state.selectedTab) {
      this.setState({ selectedTab: t });
    }
  };

  constructor(props: ILetsCelebrateProps) {
    super(props);

    this.state = {
      selectedTab: getInitialTab(), // ✅ from URL
      newJoinersData: [],
      birthdayItems: [],
      anniversaryItems: [],

      loadingBirthdays: true,
      loadingAnniversaries: true,
      loadingNewJoiners: true,
      errorBirthdays: null,
      errorAnniversaries: null,
      errorNewJoiners: null
    };

    this.spService = new listServices(this.props.context);
    this.tahweelService = new TahweelService({ httpClient: this.props.context.httpClient });
  }

  public componentDidMount(): void {
    // keep in sync when user back/forward
    window.addEventListener("popstate", this._onPopState);
    void this.loadAll();
  }

  public componentWillUnmount(): void {
    window.removeEventListener("popstate", this._onPopState);
  }

  private loadAll = async (): Promise<void> => {
    this.setState({
      loadingBirthdays: true,
      loadingAnniversaries: true,
      loadingNewJoiners: true,
      errorBirthdays: null,
      errorAnniversaries: null,
      errorNewJoiners: null
    });

    const newJoinerP = this.spService
      .getNewJoiners('New Joiner')
      .then((data) => ({ data: data || [], error: null as string | null }))
      .catch((e) => ({ data: [], error: (e?.message || 'Failed to load new joiners.') as string }));

    const dobP = this.tahweelService
      .fetchActiveEmployees({ DOB: '1', DOJ: '0' })
      .then((rows) => ({ rows: rows || [], error: null as string | null }))
      .catch((e) => ({ rows: [] as TahweelActiveEmployee[], error: (e?.message || 'Failed to load birthdays.') as string }));

    const dojP = this.tahweelService
      .fetchActiveEmployees({ DOB: '0', DOJ: '1' })
      .then((rows) => ({ rows: rows || [], error: null as string | null }))
      .catch((e) => ({ rows: [] as TahweelActiveEmployee[], error: (e?.message || 'Failed to load anniversaries.') as string }));

    const [newJoinerRes, dobRes, dojRes] = await Promise.all([newJoinerP, dobP, dojP]);

    this.setState({
      newJoinersData: newJoinerRes.data,
      birthdayItems: (dobRes.rows || []).map((x) => this.mapEmployeeToPersonBase(x, 'DOB')),
      anniversaryItems: (dojRes.rows || []).map((x) => this.mapEmployeeToPersonBase(x, 'DOJ')),

      loadingBirthdays: false,
      loadingAnniversaries: false,
      loadingNewJoiners: false,

      errorBirthdays: dobRes.error,
      errorAnniversaries: dojRes.error,
      errorNewJoiners: newJoinerRes.error
    });
  };

  private handleTabChange = (tab: LetsCelebrateTabKey) => {
    this.setState({ selectedTab: tab });
    setUrlTab(tab); // ✅ write to URL so internal page matches
  };

  private splitName(fullName: string): { firstName: string; lastName: string } {
    const cleaned = (fullName || '').replace(/,/g, ' ').trim().replace(/\s+/g, ' ');
    const parts = cleaned.split(' ').filter(Boolean);
    return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
  }

  private monthIndex(mon: string): number {
    const m = (mon || '').toUpperCase();
    const map: any = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };
    return map[m];
  }

  private toIsoThisOrNextYear(raw: string): string {
    const v = (raw || '').trim();
    if (!v) return '';

    const parts = v.split('-');
    if (parts.length !== 3) return '';

    const d = parseInt(parts[0], 10);
    const m = this.monthIndex(parts[1]);
    if (m === undefined || isNaN(d)) return '';

    const now = new Date();
    const y = now.getFullYear();
    const today = new Date(y, now.getMonth(), now.getDate());

    let year = y;
    const candidate = new Date(y, m, d);
    if (candidate.getTime() < today.getTime()) year = y + 1;

    const mm = (m + 1) < 10 ? ('0' + (m + 1)) : ('' + (m + 1));
    const dd = d < 10 ? ('0' + d) : ('' + d);

    return year + '-' + mm + '-' + dd;
  }

  private ordinal(n: number): string {
    const v = n % 100;
    if (v >= 11 && v <= 13) return n + 'th';
    const r = n % 10;
    if (r === 1) return n + 'st';
    if (r === 2) return n + 'nd';
    if (r === 3) return n + 'rd';
    return n + 'th';
  }

  private getAnniversaryText(dojRaw: string, isoCandidate: string): string {
    const v = (dojRaw || '').trim();
    if (!v || !isoCandidate) return '';

    const parts = v.split('-');
    if (parts.length !== 3) return '';

    const joinYear = parseInt(parts[2], 10);
    if (isNaN(joinYear)) return '';

    const candYear = parseInt(isoCandidate.slice(0, 4), 10);
    const years = candYear - joinYear;
    if (years <= 0) return '';

    return this.ordinal(years) + ' Anniversary';
  }

  private buildTeamsChatLink(email: string, message: string): string {
    const e = (email || '').trim();
    if (!e) return '';

    const users = encodeURIComponent(e).replace(/%40/gi, '@');
    const msg = encodeURIComponent(message || '');

    return `https://teams.microsoft.com/l/chat/0/0?users=${users}&message=${msg}`;
  }

  private mapEmployeeToPersonBase(emp: TahweelActiveEmployee, mode: 'DOB' | 'DOJ'): IPersonBase {
    const { firstName, lastName } = this.splitName(emp.fullName);
    const name = (firstName + ' ' + lastName).trim();

    const rawDate = mode === 'DOB' ? emp.dateOfBirth : emp.doj;
    const isoDate = this.toIsoThisOrNextYear(rawDate);

    const email = (emp.email || '').trim();

    const typedMessage =
      mode === 'DOB'
        ? (`Happy Birthday ${name}! 🎉`)
        : (`Happy Work Anniversary ${name}! 🎉`);

    const wishLink = email ? this.buildTeamsChatLink(email, typedMessage) : '';

    const designation = (emp.designation || '').trim() || (emp.division || '').trim();
    const department = (emp.department || '').trim();

    const extraRightText = mode === 'DOJ' ? this.getAnniversaryText(emp.doj, isoDate) : '';

    const imageUrl = (emp.imageDataUrl || emp.imageUrl || DefaultAvatar).toString().trim() || DefaultAvatar;

    return {
      id: (emp.personNumber || emp.fullName || '').trim(),
      firstName,
      lastName,
      designation,
      department,
      imageUrl,
      date: isoDate,
      wishLink,
      extraRightText
    };
  }

  public render(): React.ReactElement<ILetsCelebrateProps> {
    const {
      selectedTab,
      newJoinersData,
      birthdayItems,
      anniversaryItems,
      loadingBirthdays,
      loadingAnniversaries,
      loadingNewJoiners,
      errorBirthdays,
      errorAnniversaries,
      errorNewJoiners
    } = this.state;

    const tabs: NavTabsOption<LetsCelebrateTabKey>[] = [
      { key: 'birthdays', label: 'Birthdays' },
      { key: 'anniversaries', label: 'Anniversaries' },
      { key: 'newJoiners', label: 'New Joiners' },
      { key: 'achievements', label: 'Achievements' }
    ];

    const birthdayEmptyToday = loadingBirthdays
      ? 'Loading Birthday...'
      : (errorBirthdays ? 'Failed to load birthdays.' : 'No birthdays today.');

    const birthdayEmptyUpcoming = loadingBirthdays
      ? 'Loading Birthday...'
      : (errorBirthdays ? 'Failed to load birthdays.' : 'No upcoming birthdays.');

    const anniversaryEmptyToday = loadingAnniversaries
      ? 'Loading Anniversary...'
      : (errorAnniversaries ? 'Failed to load anniversaries.' : 'No anniversaries today.');

    const anniversaryEmptyUpcoming = loadingAnniversaries
      ? 'Loading Anniversary...'
      : (errorAnniversaries ? 'Failed to load anniversaries.' : 'No upcoming anniversaries.');

    const tabLoading =
      (selectedTab === "birthdays" && loadingBirthdays) ||
      (selectedTab === "anniversaries" && loadingAnniversaries) ||
      (selectedTab === "newJoiners" && loadingNewJoiners);

    return (
      <>
        <div className={styles.topWrapper}>
          <NavTabs
            tabs={tabs}
            value={selectedTab}
            onChange={this.handleTabChange}
            className={`${stylesNav.navTabs} ${tabLoading ? styles.loadingTabs : ""}`}
            tabClassName={stylesNav.tab}
          />
        </div>

        <div className={styles.wrapOuter}>
          {selectedTab === "birthdays" && (
            <Birthday
              items={birthdayItems}
              todayTitle="Today's Celebration"
              upcomingTitle="Upcoming Birthdays"
              emptyTodayText={birthdayEmptyToday}
              emptyUpcomingText={birthdayEmptyUpcoming}
              loading={loadingBirthdays}
              error={errorBirthdays}
              // ✅ onRetry removed (no Retry button)
            />
          )}

          {selectedTab === "anniversaries" && (
            <Birthday
              items={anniversaryItems}
              todayTitle="Today's Celebration"
              upcomingTitle="Upcoming Anniversaries"
              emptyTodayText={anniversaryEmptyToday}
              emptyUpcomingText={anniversaryEmptyUpcoming}
              loading={loadingAnniversaries}
              error={errorAnniversaries}
              // ✅ onRetry removed (no Retry button)
            />
          )}

          {selectedTab === 'newJoiners' && (
            loadingNewJoiners ? (
              <div className={styles.standardShimmerCard}>
                <LoadingBoundary
                  loading={true}
                  preset="details"
                  count={2}
                  gap={16}
                  ariaLabel="Loading new joiners"
                >
                  <div />
                </LoadingBoundary>
              </div>
            ) : (
              <LoadingBoundary
                loading={false}
                error={errorNewJoiners}
                errorMessage={errorNewJoiners || undefined}
                preset="details"
                count={0}
                gap={0}
              >
                <NewJoiner items={newJoinersData} />
              </LoadingBoundary>
            )
          )}

          {selectedTab === 'achievements' && (
            <Achievements context={this.props.context} />
          )}
        </div>
      </>
    );
  }
}