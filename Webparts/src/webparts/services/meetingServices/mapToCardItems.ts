import { Meeting } from './IMeetingProvider';

export const mapToCardItems = (rows: Meeting[]) => rows.map(m => ({
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
