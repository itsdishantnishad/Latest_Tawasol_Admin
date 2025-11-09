// Type used by the component (exported so both sides agree)
export type StoryItem = {
  id: string;
  created: string;          // ISO string (maps to SharePoint item.Created later)
  name: string;
  titleAndDept: string;
  content: string;
  imageUrl?: string;
  avatar?: "me" | string;   // "me" -> current user, or absolute URL
};

// Mock stories (6+)
export const STORIES: StoryItem[] = [
  {
    id: "1",
    created: "2025-10-22T08:30:00Z",
    name: "Muhammed Ali",
    titleAndDept: "Senior Product Manager · Information Technology",
    content:
      "We are pleased to announce the introduction of the face recognition feature in our Time and Attendance system at Dubai Holding Real Estate (DHRE).\n\nThe assigned team members from the Human Capital and Information more..., will contact the employees to facilitate this implementation starting Monday, 29th July 20...",
    imageUrl: "https://images.unsplash.com/photo-1523395241325-2a5608a6dc36?q=80&w=400&h=400&fit=crop",
    avatar: "me",
  },
  {
    id: "2",
    created: "2025-10-24T02:10:00Z",
    name: "Muhammed Ali",
    titleAndDept: "Senior Product Manager · Information Technology",
    content:
      'I just want to take a moment to thank everyone who took the time to wish me a Happy Birthday. 🥳💫 Your messages, calls, and warm wishes made me feel so loved and appreciated. It’s truly a blessing to have such wonderful people in my life. Grateful for all the kindness and positivity you shared—it made my day brighter and my heart fuller. 💖 Cheers to creating more memories together!"',
    avatar: "me",
  },
  {
    id: "3",
    created: "2025-10-23T12:00:00Z",
    name: "Internal News Bot",
    titleAndDept: "Corporate Communications · DH",
    content:
      "Kudos to the Facilities team for completing the lobby refresh ahead of schedule. The new wayfinding system goes live next week. See the rollout notes in the portal.",
    imageUrl: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?q=80&w=400&h=400&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: "4",
    created: "2025-10-23T09:00:00Z",
    name: "Muhammed Ali",
    titleAndDept: "Senior Product Manager · Information Technology",
    content:
      "Reminder: Design critique this Thursday 2–3pm. Please add your Figma links by EOD Wednesday. We’ll prioritize flows flagged as ‘Blocked’.",
    avatar: "me",
  },
  {
    id: "5",
    created: "2025-10-20T10:15:00Z",
    name: "People Operations",
    titleAndDept: "Human Capital · DH",
    content:
      "Open enrollment closes Friday. If you need assistance choosing a plan, join the live Q&A at 1pm or check the benefits FAQ.",
    imageUrl: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=400&h=400&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?q=80&w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: "6",
    created: "2025-10-18T14:45:00Z",
    name: "Muhammed Ali",
    titleAndDept: "Senior Product Manager · Information Technology",
    content:
      "Sprint 24 recap: 11/12 stories completed, 2 carried over. Shoutout to the QA team for clearing the regression backlog!",
    avatar: "me",
  },
];
