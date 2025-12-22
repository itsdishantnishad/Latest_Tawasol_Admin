import * as React from 'react';
import stylesNav from '../../Components/NavTabs/NavTabs.module.scss';
import type { ILetsCelebrateProps } from './ILetsCelebrateProps';
import NewJoiner from './NewJoiner/NewJoiner';
import Birthday from './Birthday/Birthday';
import { listServices } from '../../services/listServices';
import NavTabs, { NavTabsOption } from '../../Components/NavTabs/NavTabs';
import Achievements from './Achievements/Achievement';
import { TahweelService, TahweelActiveEmployee } from '../../services/Integration/TahweelService';
import type { IPersonBase } from './Birthday/PeopleSimpleFeed';

const DefaultAvatar: string = require('../../assets/profileCircleImg.svg');

export interface ILetsCelebrateState {
  selectedTab: 'birthdays' | 'anniversaries' | 'newJoiners' | 'achievements';
  newJoinersData: any[];
  birthdayItems: IPersonBase[];
  anniversaryItems: IPersonBase[];
}

export default class LetsCelebrate extends React.Component<ILetsCelebrateProps, ILetsCelebrateState> {
  private spService: listServices;
  private tahweelService: TahweelService;

  constructor(props: ILetsCelebrateProps) {
    super(props);
    this.state = {
      selectedTab: 'birthdays',
      newJoinersData: [],
      birthdayItems: [],
      anniversaryItems: []
    };

    this.spService = new listServices(this.props.context);
    this.tahweelService = new TahweelService({ httpClient: this.props.context.httpClient });
  }

  public async componentDidMount(): Promise<void> {
    const [newJoinerData, dobRows, dojRows] = await Promise.all([
      this.spService.getNewJoiners('New Joiner'),
      this.tahweelService.fetchActiveEmployees({ DOB: '1', DOJ: '0' }),
      this.tahweelService.fetchActiveEmployees({ DOB: '0', DOJ: '1' })
    ]);

    this.setState({
      newJoinersData: newJoinerData || [],
      birthdayItems: (dobRows || []).map((x) => this.mapEmployeeToPersonBase(x, 'DOB')),
      anniversaryItems: (dojRows || []).map((x) => this.mapEmployeeToPersonBase(x, 'DOJ'))
    });
  }

  private handleTabChange = (tab: ILetsCelebrateState['selectedTab']) => {
    this.setState({ selectedTab: tab });
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

  private mapEmployeeToPersonBase(emp: TahweelActiveEmployee, mode: 'DOB' | 'DOJ'): IPersonBase {
    const { firstName, lastName } = this.splitName(emp.fullName);

    const rawDate = mode === 'DOB' ? emp.dateOfBirth : emp.doj;
    const isoDate = this.toIsoThisOrNextYear(rawDate);

    const email = (emp.email || '').trim();
    const msg = mode === 'DOB' ? 'Happy Birthday!' : 'Happy Work Anniversary!';
    const wishLink = email
      ? ('https://teams.microsoft.com/l/chat/0/0?users=' + encodeURIComponent(email) + '&message=' + encodeURIComponent(msg))
      : '';

    const designation = (emp.designation || '').trim() || (emp.division || '').trim();
    const department = (emp.department || '').trim();

    const extraRightText = mode === 'DOJ' ? this.getAnniversaryText(emp.doj, isoDate) : '';

    // use API image (supports http / server-relative / data:image)
    const imageUrl = (emp.imageDataUrl || emp.imageUrl || DefaultAvatar).toString().trim() || DefaultAvatar;

    return {
      id: (emp.personNumber || emp.fullName || '').trim(),
      firstName,
      lastName,
      designation,
      department,
      imageUrl,
      date: isoDate,
      wishLink: wishLink,
      extraRightText
    };
  }

  public render(): React.ReactElement<ILetsCelebrateProps> {
    const { selectedTab, newJoinersData, birthdayItems, anniversaryItems } = this.state;

    const tabs: NavTabsOption<ILetsCelebrateState['selectedTab']>[] = [
      { key: 'birthdays', label: 'Birthdays' },
      { key: 'anniversaries', label: 'Anniversaries' },
      { key: 'newJoiners', label: 'New Joiners' },
      { key: 'achievements', label: 'Achievements' }
    ];

    return (
      <div>
        <NavTabs
          tabs={tabs}
          value={selectedTab}
          onChange={this.handleTabChange}
          className={stylesNav.navTabs}
          tabClassName={stylesNav.tab}
        />

        <div>
          {selectedTab === "birthdays" && (
            <Birthday
              items={birthdayItems}
              todayTitle="Today's Celebration"
              upcomingTitle="Upcoming Birthdays"
              emptyTodayText="No birthdays today."
              emptyUpcomingText="No upcoming birthdays."
            />
          )}

          {selectedTab === "anniversaries" && (
            <Birthday
              items={anniversaryItems}
              todayTitle="Today's Celebration"
              upcomingTitle="Upcoming Anniversaries"
              emptyTodayText="No anniversaries today."
              emptyUpcomingText="No upcoming anniversaries."
            />
          )}

          {selectedTab === 'newJoiners' && (
            <NewJoiner items={newJoinersData} />
          )}

          {selectedTab === 'achievements' && (
            <Achievements context={this.props.context} />
          )}
        </div>
      </div>
    );
  }
}
