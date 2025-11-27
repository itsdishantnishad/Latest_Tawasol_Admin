import { IMeetingProvider, Meeting } from './IMeetingProvider';
import { MSGraphClientV3 } from '@microsoft/sp-http';

export class GraphMeetingsProvider implements IMeetingProvider {
  constructor(private graph: MSGraphClientV3, private groupId?: string) {}

  async getUpcoming(daysAhead: number, take: number): Promise<Meeting[]> {
    const now = new Date();
    const end = new Date(now.getTime());
    end.setDate(end.getDate() + (daysAhead || 7));
                           
    const base = this.groupId ? `/groups/${this.groupId}/calendarView`
                              : `/me/calendarView`;

    const res = await this.graph.api(base)
      .query({ startDateTime: now.toISOString(), endDateTime: end.toISOString() })
      .top(take || 10)
      .orderby('start/dateTime')
      .header('Prefer','outlook.timezone="UTC"')
      .get();

    return (res.value || [])
      .filter((e: any) => e.isOnlineMeeting && (e.onlineMeetingProvider === 'teamsForBusiness'))
      .map((e: any): Meeting => ({
        id: e.id,
        subject: e.subject,
        start: e.start?.dateTime,
        end: e.end?.dateTime,
        location: e.location?.displayName || 'Microsoft Teams Meeting',
        description: e.bodyPreview || '',
        organizer: e.organizer?.emailAddress?.name,
        joinUrl: e.onlineMeeting?.joinUrl || e.webLink
      }));
  }
}
