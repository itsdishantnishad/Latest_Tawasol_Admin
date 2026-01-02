// import { IMeetingProvider, Meeting } from './IMeetingProvider';
// import { MSGraphClientV3 } from '@microsoft/sp-http';

// export class GraphMeetingsProvider implements IMeetingProvider {
//   constructor(private graph: MSGraphClientV3, private groupId?: string) {}

//   async getUpcoming(daysAhead: number, take: number): Promise<Meeting[]> {
//     const now = new Date();
//     const end = new Date(now.getTime());
//     end.setDate(end.getDate() + (daysAhead || 7));
                           
//     const base = this.groupId ? `/groups/${this.groupId}/calendarView`
//                               : `/me/calendarView`;

//     const res = await this.graph.api(base)
//       .query({ startDateTime: now.toISOString(), endDateTime: end.toISOString() })
//       .top(take || 10)
//       .orderby('start/dateTime')
//       .header('Prefer','outlook.timezone="UTC"')
//       .get();

//     return (res.value || [])
//       .filter((e: any) => e.isOnlineMeeting && (e.onlineMeetingProvider === 'teamsForBusiness'))
//       .map((e: any): Meeting => ({
//         id: e.id,
//         subject: e.subject,
//         start: e.start?.dateTime,
//         end: e.end?.dateTime,
//         location: e.location?.displayName || 'Microsoft Teams Meeting',
//         description: e.bodyPreview || '',
//         organizer: e.organizer?.emailAddress?.name,
//         joinUrl: e.onlineMeeting?.joinUrl || e.webLink
//       }));
//   }
// }




import { IMeetingProvider, Meeting } from './IMeetingProvider';
import { MSGraphClientV3 } from '@microsoft/sp-http';

export class GraphMeetingsProvider implements IMeetingProvider {

  constructor(private graph: MSGraphClientV3, private groupId?: string) {}

  async getUpcoming(daysAhead: number, take: number): Promise<Meeting[]> {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + (daysAhead || 7));

    const base = this.groupId
      ? `/groups/${this.groupId}/calendarView`
      : `/me/calendarView`;

    const res = await this.graph
      .api(base)
      .query({
        startDateTime: now.toISOString(),
        endDateTime: end.toISOString()
      })
      .orderby('start/dateTime')
      .top(take || 5)
      .header('Prefer', 'outlook.timezone="Asia/Dubai"')
      .get();

    // Process meetings with photo fetching
    const meetings = await Promise.all(
      (res.value || [])
        .filter((e: any) => e.isOnlineMeeting)
        .map(async (e: any): Promise<Meeting> => {
          const email = e.organizer?.emailAddress?.address;
          const name = e.organizer?.emailAddress?.name;
          let avatarUrl: string | undefined;

          if (email) {
            try {
              const photoResponse = await this.graph
                .api(`/users/${email}/photo/$value`)
                .get();
              let blob: Blob;
              if (photoResponse instanceof ArrayBuffer) {
                blob = new Blob([photoResponse], { type: 'image/jpeg' });
              } else if (photoResponse instanceof Blob) {
                blob = photoResponse;
              } else {
                throw new Error('Unexpected response type');
              }
              
              avatarUrl = await this.blobToDataUrl(blob);
            } catch (error: any) {
              console.log(`No photo for ${email}, using fallback avatar`);
              avatarUrl = this.getDefaultAvatar(name || email);
            }
          } else {
            avatarUrl = this.getDefaultAvatar(name || 'Unknown');
          }

          return {
            id: e.id,
            subject: e.subject,
            start: e.start?.dateTime,
            end: e.end?.dateTime,
            location: e.location?.displayName || 'Microsoft Teams Meeting',
            description: e.bodyPreview,
            organizer: name,
            joinUrl: e.onlineMeeting?.joinUrl || e.webLink,
            avatarUrl
          };
        })
    );

    return meetings;
  }

  /**
   * Converts a Blob to a base64 data URL
   */
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  
  private getDefaultAvatar(name: string): string {
    
    const initials = name
      .split(' ')
      .map(n => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    // Generate a color based on the name
    const colors = ['#0078D4', '#00A4EF', '#50E6FF','#8764B8','#881798','#E43BA6','#E74856', 
      '#F7630C', 
      '#FFB900', 
      '#00CC6A', 
    ];
    
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];
    const svg = `
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" fill="${bgColor}"/>
        <text x="50%" y="50%" 
              text-anchor="middle" 
              dy=".35em" 
              font-family="Segoe UI, Arial, sans-serif" 
              font-size="20" 
              font-weight="600" 
              fill="white">
          ${initials}
        </text>
      </svg>
    `;

    // Convert SVG to data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}