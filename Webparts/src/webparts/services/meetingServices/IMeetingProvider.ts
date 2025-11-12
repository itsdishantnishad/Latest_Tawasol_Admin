export interface Meeting {
  id: string;
  subject: string;
  start: string;   
  end: string;     
  location?: string;
  description?: string;
  organizer?: string;
  joinUrl?: string;
  avatarUrl?: string;
}

export interface IMeetingProvider {
  getUpcoming(daysAhead: number, take: number): Promise<Meeting[]>;
}
