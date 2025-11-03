export interface IBirthdayPerson {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  imageUrl: string;  // absolute, server-relative (/sites/..), or web-relative (SiteAssets/..)
  date?: string;     // ISO or display text
  wishLink?: string; // Teams/Viva/mailto link
}

export const BirthdayData: IBirthdayPerson[] = [
  {
    id: "b4",
    firstName: "Mohit",
    lastName: "Khandelwal",
    designation: "Lead developer",
    department: "Information Technology",
    imageUrl: "SiteAssets/People/mohit.jpg",
    date: "2025-10-31",
    wishLink: "https://teams.microsoft.com/l/chat/0/0?users=mohit.khandelwal@contoso.com&message=Happy%20Birthday%20🎉"
  },
  {
    id: "b1",
    firstName: "Mairam",
    lastName: "Fathima",
    designation: "Executive Director",
    department: "Administration & Procurement",
    imageUrl: "SiteAssets/People/mairam.jpg",
    date: "2025-10-27",
    wishLink: "https://teams.microsoft.com/l/chat/0/0?users=mairam.fathima@contoso.com&message=Happy%20Birthday%20🎉"
  },
  {
    id: "b2",
    firstName: "Bianca",
    lastName: "Satyapal Batra",
    designation: "Senior Manager – Digital Data",
    department: "Operations Management",
    imageUrl: "SiteAssets/People/bianca.jpg",
    date: "2025-10-27",
    wishLink: "mailto:bianca@contoso.com?subject=Happy%20Birthday!&body=Have%20a%20wonderful%20year%20ahead%20🎂"
  },
  {
    id: "b3",
    firstName: "Ribu",
    lastName: "Roy",
    designation: "UI/UX Designer",
    department: "Information Technology",
    imageUrl: "SiteAssets/People/ribu.jpg",
    date: "2025-10-29",
    wishLink: "https://teams.microsoft.com/l/chat/0/0?users=ribu.roy@contoso.com&message=Happy%20Birthday%20🎉"
  }
];
