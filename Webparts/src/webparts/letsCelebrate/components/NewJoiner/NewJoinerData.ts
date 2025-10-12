export interface INewJoiner {
  id: string;
  firstNameDecor?: string;
  lastName: string;
  designation: string;
  department?: string;
  profileImageUrl: string;
  sayHelloUrl?: string;
  effectiveDate?: string;
  reportingTo?: string;
  intro: string[];
}

export const NewJoinersData: INewJoiner[] = [
  {
    id: "1",
    firstNameDecor: "Vidya",
    lastName: "Venkatramanan",
    designation: "Manager – PMO and IT Governance",
    department: "PMO & IT Governance",
    profileImageUrl: "SiteAssets/People/vidya.jpg",   // ✅ use web-relative; resolver will fix
    sayHelloUrl: "mailto:vidya@contoso.com?subject=Welcome%20to%20the%20team!",
    effectiveDate: "2024-07-16",
    reportingTo: "Nauman Khawaja, Director – IT Strategic Planning & Governance",
    intro: [
      "We are pleased to announce that Vidya Venkatramanan has been appointed as Manager – PMO and IT Governance, effective 16th July, 2024. She will report to Nauman Khawaja, Director – IT Strategic Planning & Governance.",
      "Vidya is a seasoned professional with over 18 years of experience in leading complex organizational projects across diverse industries. Her expertise spans strategic direction, governance, and establishing PMO structures.",
      "She holds a master’s degree in business administration from the USA. She is a certified Scrum Master and has completed the COBIT 2019 Foundation. In her leisure time, Vidya enjoys listening to music, is a passionate dancer, and loves to travel and explore new places and activities."
    ]
  },
  {
    id: "2",
    firstNameDecor: "Ribu",
    lastName: "Roy",
    designation: "Executive – Master Planning Revision",
    profileImageUrl: "SiteAssets/People/ribu.jpg",     // ✅ FIXED (removed Windows path)
    sayHelloUrl: "mailto:ribu@contoso.com?subject=Welcome%20aboard!",
    effectiveDate: "2024-07-10",
    reportingTo: "Burhan Bin Salleh, Assistant Director – Investor Relations",
    intro: [
      "We are pleased to announce that Ribu Roy has been appointed as Administrator – Investor Contract Management, effective 10th July, 2024.",
      "Ribu comes with over 6 years of experience in customer care, healthcare operations management, and business development.",
      "He holds a master’s degree in healthcare management from Manipal Institute of Management, India. In his leisure time, Ribu loves to travel and explore new places and cuisines."
    ]
  },
  {
    id: "3",
    firstNameDecor: "Mohammed",
    lastName: "Junaid",
    designation: "Manager – PMO and IT Governance",
    profileImageUrl: "/SiteAssets/People/junaid.jpg",  // server-relative also ok
    sayHelloUrl: "mailto:junaid@contoso.com?subject=Welcome%20aboard!",
    effectiveDate: "2024-07-09",
    reportingTo: "Moenes Hegazi, Executive Director – BTS and Land Technical",
    intro: [
      "We are pleased to announce that Mohammed Junaid has been appointed as Executive – Master Planning Revision, effective 9th July 2024.",
      "Mohammed comes with over 10 years of experience in various developer and construction companies in the UAE.",
      "He holds a bachelor's degree in civil engineering from VTU, Karnataka. In his leisure time, Mohammed enjoys football, cricket, cycling, trekking, and hiking."
    ]
  },
  {
    id: "4",
    firstNameDecor: "Sheikh",
    lastName: "Muhammed Sajjad",
    designation: "Manager – PMO and IT Governance",
    profileImageUrl: "/SiteAssets/People/sajjad.jpg",
    sayHelloUrl: "mailto:sajjad@contoso.com?subject=Congrats%20and%20Welcome!",
    effectiveDate: "2024-05-16",
    reportingTo: "Yajant Kafatialya, Director – Commercial Planning & Customer Experience",
    intro: [
      "We are pleased to announce that Sheikh Muhammad Sajjad has been appointed as Manager – Channel Management, effective 16th May, 2024.",
      "Sajjad has 16+ years across customer service & CRM operations, analytics, sales funnel management, and outsource management.",
      "He holds a bachelor's in business administration from University of Karachi, Pakistan. He loves photography, travelling, and snooker."
    ]
  },
  {
    id: "4",
    firstNameDecor: "Sheikh",
    lastName: "Muhammed Sajjad",
    designation: "Manager – PMO and IT Governance",
    profileImageUrl: "/SiteAssets/People/sajjad.jpg",
    sayHelloUrl: "mailto:sajjad@contoso.com?subject=Congrats%20and%20Welcome!",
    effectiveDate: "2024-05-16",
    reportingTo: "Yajant Kafatialya, Director – Commercial Planning & Customer Experience",
    intro: [
      "We are pleased to announce that Sheikh Muhammad Sajjad has been appointed as Manager – Channel Management, effective 16th May, 2024.",
      "Sajjad has 16+ years across customer service & CRM operations, analytics, sales funnel management, and outsource management.",
      "He holds a bachelor's in business administration from University of Karachi, Pakistan. He loves photography, travelling, and snooker."
    ]
  },
  {
    id: "5",
    firstNameDecor: "Rami",
    lastName: "Muhammed Mustafa Samour",
    designation: "Senior Manager – Customer Service",
    profileImageUrl: "/SiteAssets/People/rami.jpg",
    sayHelloUrl: "mailto:rami@contoso.com?subject=Welcome%20to%20the%20team!",
    effectiveDate: "2024-05-01",
    reportingTo: "Alya Mahdy, Executive Director – Customer Service",
    intro: [
      "We are pleased to announce that Rami Muhammed Mustafa Samour has been appointed as Assistant Director – BTS Customer Care, effective 1st May, 2024.",
      "Rami has 17+ years in real estate customer care and sales operations with a strong delivery track record.",
      "He holds an Executive MBA and Bachelor's in management (University of Dubai) and a Bachelor's in finance (University of Wales, UK). He enjoys CrossFit, scuba diving, and football."
    ]
  }
];
