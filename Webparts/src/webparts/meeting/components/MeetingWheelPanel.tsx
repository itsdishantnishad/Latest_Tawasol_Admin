
import * as React from 'react';
import MeetingCards from './Meeting';

export default class MeetingWheelPanel extends React.Component<{
  latest: any[];
  allMeetings?: any[];
  showingAll?: boolean;
  onViewAll?: () => void;
}> {
  
  private toItems = (x: any[]) => x.map(m => ({
    id: m.id, 
    title: m.subject, 
    start: m.start, 
    end: m.end,
    location: m.location, 
    organizerName: m.organizer,
    description: m.description, 
    joinUrl: m.joinUrl, 
    avatarUrl: m.avatarUrl
  }));

  render() {
    const { latest, allMeetings, onViewAll, showingAll } = this.props;
    const displayItems = showingAll && allMeetings ? allMeetings : latest;
    return (
      <section>
        <div style={{ marginTop: showingAll ? 0 : 16 }}>
          <MeetingCards 
            items={this.toItems(displayItems)} 
            onViewAll={onViewAll}
            showingAll={showingAll}
          />
        </div>
      </section>
    );
  }
}