
import * as React from 'react';
import MeetingCards from './Meeting';

export interface IMeetingWheelPanelProps {
  latest: any[];
  allMeetings?: any[];
  context: any;
  seeAllURL?: string;
}

export default class MeetingWheelPanel extends React.Component<IMeetingWheelPanelProps>{
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
  const { latest, allMeetings, context, seeAllURL } = this.props;

  const displayItems = allMeetings ?? latest;

  return (
    <section>
      <div style={{ marginTop: 16 }}>
        <MeetingCards
          items={this.toItems(displayItems)}
          context={context}
          seeAllURL={seeAllURL}
        />
      </div>
    </section>
  );
}

}