

// +++++++++++++++++++++++ CODE TO FETCH DYNAMICALLY MEETING ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// import * as React from 'react';
// import * as ReactDom from 'react-dom';
// import {
//   BaseClientSideWebPart,
//   IPropertyPaneConfiguration,
//   PropertyPaneDropdown,
//   PropertyPaneTextField,
//   PropertyPaneSlider,
// } from '@microsoft/sp-webpart-base';
// import { MSGraphClientV3 } from '@microsoft/sp-http';

// import MeetingWheelPanel from './components/MeetingWheelPanel';
// import { GraphMeetingsProvider } from '../services/meetingServices/GraphMeetingsProvider';
// import { pickFeatured } from '../services/meetingServices/pickFeatured';

// export interface IMeetingProps {
//   source: 'my' | 'team';
//   teamId?: string;
//   daysAhead: number;
//   take: number;
//   refreshMins: number;
// }

// export default class MeetingWebPart extends BaseClientSideWebPart<IMeetingProps> {

//   public async onInit(): Promise<void> {
//     this.properties.source = this.properties.source || 'my';
//     this.properties.daysAhead = this.properties.daysAhead || 7;
//     this.properties.take = this.properties.take || 10;
//     this.properties.refreshMins = this.properties.refreshMins || 5;
//   }

//   public async render(): Promise<void> {
//     this._renderLoading();

//     const ttl = Math.max(1, this.properties.refreshMins) * 60 * 1000;
//     const cacheKey = `mtg2:${this.properties.source}:${this.properties.teamId || 'me'}:${this.properties.daysAhead}:${this.properties.take}`;

//     try {
//       if (this.properties.source === 'team' && !this.properties.teamId) {
//         this._renderMessage('Set a valid Team/Group Id in web part properties.');
//         return;
//       }

//       // cache
//       let rows: any[] | null = null;
//       const cached = sessionStorage.getItem(cacheKey);
//       if (cached) {
//         const { t, v } = JSON.parse(cached);
//         if (Date.now() - t < ttl) rows = v;
//       }

//       if (!rows) {
//         const graph = await this.context.msGraphClientFactory.getClient('3') as MSGraphClientV3;
//         const provider = new GraphMeetingsProvider(
//           graph,
//           this.properties.source === 'team' ? this.properties.teamId : undefined
//         );
//         rows = await provider.getUpcoming(this.properties.daysAhead, this.properties.take);
//         sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), v: rows }));
//       }

//       if (!rows || rows.length === 0) {
//         this._renderMessage('No upcoming meetings found in the selected range.');
//         return;
//       }

//       // Normal render
//       this._renderRows(rows, ttl, cacheKey);

//     } catch (err) {
//       const msg = (err && (err.message || err.toString())) || 'Unknown error';
//       this._renderMessage(`Could not load meetings. ${msg}`);
//     }
//   }

//   private _showingAll: boolean = false;

//   private _renderRows(rows: any[], ttl: number, cacheKey: string) {
//     const { latest5 } = pickFeatured(rows);

//     const element = React.createElement(MeetingWheelPanel, {
//       latest: latest5,
//       allMeetings: rows,
//       showingAll: this._showingAll,
//       onViewAll: () => {
//         this._showingAll = !this._showingAll;
//         this._renderRows(rows, ttl, cacheKey);
//       }
//     });

//     ReactDom.render(element, this.domElement);

//     if (!this._showingAll) {
//       setTimeout(() => {
//         sessionStorage.removeItem(cacheKey);
//         this.render();
//       }, ttl);
//     }
//   }

//   private _renderLoading() {
//     this.domElement.innerHTML = `<div style="padding:8px;color:#605e5c;font:14px Segoe UI,Arial">Loading meetings…</div>`;
//   }

//   private _renderMessage(message: string) {
//     this.domElement.innerHTML = `
//       <div style="padding:12px;border:1px solid #e1dfdd;border-radius:4px;background:#faf9f8">
//         <div style="color:#323130;font:14px Segoe UI,Arial;white-space:pre-line">${message}</div>
//       </div>`;
//   }


//   protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
//     return {
//       pages: [{
//         header: { description: 'Meetings (Graph only)' },
//         groups: [{
//           groupFields: [
//             PropertyPaneDropdown('source', {
//               label: 'Source', options: [
//                 { key: 'my', text: 'My Outlook/Teams calendar (/me)' },
//                 { key: 'team', text: 'Team/Group calendar (/groups/{id})' }
//               ]
//             }),
//             PropertyPaneTextField('teamId', { label: 'Team/Group Id (when Source = Team)' }),
//             PropertyPaneSlider('daysAhead', { label: 'Look ahead (days)', min: 1, max: 30 }),
//             PropertyPaneSlider('take', { label: 'Fetch count', min: 5, max: 25 }),
//             PropertyPaneSlider('refreshMins', { label: 'Refresh every (mins)', min: 1, max: 30 })
//           ]
//         }]
//       }]
//     };
//   }
// } 



//+++++++++++++++++++++++++++++++++++++++ DUMMY CODE FOR TESTING THE UI++++++++++++++++++++++++++++++++++++++++++

import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle
} from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import MeetingWheelPanel from './components/MeetingWheelPanel';
import { GraphMeetingsProvider } from '../services/meetingServices/GraphMeetingsProvider';
import { pickFeatured } from '../services/meetingServices/pickFeatured';

export interface IMeetingProps {
  source: 'my' | 'team';
  teamId?: string;
  daysAhead: number;
  take: number;
  refreshMins: number;
  demoMode?: boolean;
  seeAllURL?: string;
}

export default class MeetingWebPart extends BaseClientSideWebPart<IMeetingProps> {
  public async onInit(): Promise<void> {
    this.properties.source = this.properties.source || 'my';
    this.properties.daysAhead = this.properties.daysAhead || 7;
    this.properties.take = this.properties.take || 10;
    this.properties.refreshMins = this.properties.refreshMins || 5;
    if (this.properties.demoMode === undefined) this.properties.demoMode = true;
  }

  public async render(): Promise<void> {
    this._renderLoading();

    const ttl = Math.max(1, this.properties.refreshMins) * 60 * 1000;
    const cacheKey = `mtg2:${this.properties.source}:${this.properties.teamId || 'me'}:${this.properties.daysAhead}:${this.properties.take}`;

    try {
      if (this.properties.demoMode === true && this._isDesignOrDemoForced()) {
        const demo = this._makeDemoRows();
        this._renderRows(demo, ttl, cacheKey);
        return;
      }

      if (this.properties.source === 'team' && !this.properties.teamId) {
        if (this.properties.demoMode) {
          const demo = this._makeDemoRows();
          this._renderRows(demo, ttl, cacheKey);
          return;
        }
        this._renderMessage('Set a valid Team/Group Id in web part properties.');
        return;
      }

      // cache
      let rows: any[] | null = null;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { t, v } = JSON.parse(cached);
        if (Date.now() - t < ttl) rows = v;
      }

      if (!rows) {
        const graph = (await this.context.msGraphClientFactory.getClient('3')) as MSGraphClientV3;
        const provider = new GraphMeetingsProvider(
          graph,
          this.properties.source === 'team' ? this.properties.teamId : undefined
        );
        rows = await provider.getUpcoming(this.properties.daysAhead, this.properties.take);
        sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), v: rows }));
      }
      if ((!rows || rows.length === 0) && this.properties.demoMode) {
        const demo = this._makeDemoRows();
        this._renderRows(demo, ttl, cacheKey);
        return;
      }
      this._renderRows(rows || [], ttl, cacheKey);
    } catch (err) {
      if (this.properties.demoMode) {
        const demo = this._makeDemoRows();
        this._renderRows(demo, ttl, cacheKey);
        return;
      }
      const msg = (err && (err.message || err.toString())) || 'Unknown error';
      this._renderMessage(`Could not load meetings. ${msg}`);
    }
  }

  // ========= helpers =========
  private _showingAll: boolean = false;

  private _renderRows(rows: any[], ttl: number, cacheKey: string) {
    const { latest4 } = pickFeatured(rows);

    const element = React.createElement(MeetingWheelPanel, {
      latest: latest4,
      allMeetings: rows,
      context: this.context,
      seeAllURL: this.properties.seeAllURL,
    });


    ReactDom.render(element, this.domElement);
    if (!this._showingAll) {
      setTimeout(() => {
        sessionStorage.removeItem(cacheKey);
        this.render();
      }, ttl);
    }
  }

  private _renderLoading() {
    this.domElement.innerHTML = `
      <div style="padding:8px;color:#605e5c;font:14px 'Segoe UI',Arial">
        Loading meetings…
      </div>`;
  }

  private _renderMessage(message: string) {
    this.domElement.innerHTML = `
      <div style="padding:12px;border:1px solid #e1dfdd;border-radius:4px;background:#faf9f8">
        <div style="color:#323130;font:14px 'Segoe UI',Arial;white-space:pre-line">
          ${message}
        </div>
      </div>`;
  }
  private _isDesignOrDemoForced(): boolean {
    return false;
  }
  private _makeDemoRows() {
    const now = new Date();
    const add = (mins: number) => new Date(now.getTime() + mins * 60 * 1000).toISOString();

    return [
      {
        id: 'd1',
        subject: 'Weekly Status Review - Project Revamp',
        start: add(30),
        end: add(60),
        location: 'Microsoft Teams Meeting',
        description: 'Sprint update & blockers',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo1',
        organizer: 'Mohammed Ali'
      },
      {
        id: 'd2',
        subject: 'Design Handoff: Policies & Procedures',
        start: add(120),
        end: add(180),
        location: 'Microsoft Teams Meeting',
        description: 'Figma to SPFx handoff',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo2',
        organizer: 'Aisha Khan'
      },
      {
        id: 'd3',
        subject: 'Stakeholder Sync - Tawasol Intranet',
        start: add(240),
        end: add(300),
        location: 'Microsoft Teams Meeting',
        description: 'Scope & timelines',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo3',
        organizer: 'Rahul Sharma'
      },
      {
        id: 'd4',
        subject: 'Content Governance Workshop',
        start: add(360),
        end: add(420),
        location: 'Microsoft Teams Meeting',
        description: 'Taxonomy & CTs',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo4',
        organizer: 'Maryam Noor'
      },
      {
        id: 'd5',
        subject: 'Power BI Embed Check-in',
        start: add(480),
        end: add(540),
        location: 'Microsoft Teams Meeting',
        description: 'Dashboards status',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo5',
        organizer: 'Vikram Singh'
      },
      {
        id: 'd6',
        subject: 'Release Readiness - Sprint 18',
        start: add(600),
        end: add(660),
        location: 'Microsoft Teams Meeting',
        description: 'QA & deployment',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo6',
        organizer: 'Sara Patel'
      },
      {
        id: 'd7',
        subject: 'Release Readiness - Sprint 19',
        start: add(720),
        end: add(780),
        location: 'Microsoft Teams Meeting',
        description: 'QA & deployment',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/demo7',
        organizer: 'Sikha Sureka'
      }
    ];
  }

  // ========= property pane =========
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Meetings (Graph only)' },
          groups: [
            {
              groupFields: [
                PropertyPaneDropdown('source', {
                  label: 'Source',
                  options: [
                    { key: 'my', text: 'My Outlook/Teams calendar (/me)' },
                    { key: 'team', text: 'Team/Group calendar (/groups/{id})' }
                  ]
                }),
                PropertyPaneTextField('seeAllURL', {
                  label: 'View All URL',
                  placeholder: 'SitePages/Events-And-Trainings.aspx'
                }),

                PropertyPaneTextField('teamId', {
                  label: 'Team/Group Id (when Source = Team)'
                }),
                PropertyPaneSlider('daysAhead', {
                  label: 'Look ahead (days)',
                  min: 1,
                  max: 30
                }),
                PropertyPaneSlider('take', {
                  label: 'Fetch count',
                  min: 4,
                  max: 25
                }),
                PropertyPaneSlider('refreshMins', {
                  label: 'Refresh every (mins)',
                  min: 3,
                  max: 30
                }),
                PropertyPaneToggle('demoMode', {
                  label: 'Show sample data if empty/error',
                  onText: 'Demo On',
                  offText: 'Demo Off'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}