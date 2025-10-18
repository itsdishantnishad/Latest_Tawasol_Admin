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
    id: "b1",
    firstName: "Mairam",
    lastName: "Fathima",
    designation: "Executive Director",
    department: "Administration & Procurement",
    imageUrl: "SiteAssets/People/mairam.jpg",
    date: "2025-10-09",
    wishLink: "https://teams.microsoft.com/l/chat/0/0?users=mairam.fathima@contoso.com&message=Happy%20Birthday%20🎉"
  },
  {
    id: "b2",
    firstName: "Bianca",
    lastName: "Satyapal Batra",
    designation: "Senior Manager – Digital Data",
    department: "Operations Management",
    imageUrl: "SiteAssets/People/bianca.jpg",
    date: "2025-10-11",
    wishLink: "mailto:bianca@contoso.com?subject=Happy%20Birthday!&body=Have%20a%20wonderful%20year%20ahead%20🎂"
  },
  {
    id: "b3",
    firstName: "Ribu",
    lastName: "Roy",
    designation: "UI/UX Designer",
    department: "Information Technology",
    imageUrl: "SiteAssets/People/ribu.jpg",
    date: "2025-10-12",
    wishLink: "https://teams.microsoft.com/l/chat/0/0?users=ribu.roy@contoso.com&message=Happy%20Birthday%20🎉"
  }
];
