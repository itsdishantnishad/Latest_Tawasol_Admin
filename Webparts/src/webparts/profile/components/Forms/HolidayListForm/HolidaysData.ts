// holidays-uae-2025.ts

export interface HolidayItem {
  name: string;
  date: string; 
}

export interface HolidayList {
  year: string;
  infoMessage: string;
  noteMessage: string;
  holidays: HolidayItem[];
}

export const UAE_HOLIDAYS_2025: HolidayList = {
  year: "2025",
  infoMessage:
    "This list is subject to change according to UAE government and company policy. Please take confirmation from HC team.",
  noteMessage:
    "*Note : Islamic holidays are determined according to moon sighting.",
  holidays: [
    {
      name: "New Year Day",
      date: "1 January",
    },
    {
      name: "Eid Al Fitr",
      date: "From 29 Ramadan to 3 Shawwal 1445 AH (4 days)",
    },
    {
      name: "Arafah day and Eid Al Adha (Feast of Sacrifice)",
      date:
        "From 9 to 12 Dhu al Hijjah 1445 AH (4 days)\n2 February. This is just a placeholder.",
    },
    {
      name: "Hijri New Year (Islamic New Year)",
      date: "1 Muharram 1446 AH\n7 July 7",
    },
    {
      name: "Prophet Mohammed's Birthday",
      date: "12 Rabi' Awwal 1446 AH",
    },
    {
      name: "National Day",
      date: "2 and 3 December (2 days)",
    },
  ],
};

export default UAE_HOLIDAYS_2025;
