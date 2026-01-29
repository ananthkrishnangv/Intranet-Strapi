import { JournalPost, Circular, QuickLinkCategory, Holiday, GalleryAlbum } from '../types';

export const MOCK_JOURNAL: JournalPost[] = [
  {
    id: 1,
    title: "Director's Address on Foundation Day",
    slug: "directors-address",
    priority: true,
    publishedAt: "2024-06-10",
    category: "Events",
    excerpt: "Highlights from the annual address regarding the new strategic roadmap for 2025."
  },
  {
    id: 2,
    title: "New Campus Cafeteria Opening Hours",
    slug: "cafeteria-hours",
    priority: false,
    publishedAt: "2024-06-08",
    category: "Campus Life",
    excerpt: "The cafeteria will now remain open until 8:00 PM on weekdays starting next Monday."
  },
  {
    id: 3,
    title: "IT Maintenance Scheduled for Weekend",
    slug: "it-maintenance",
    priority: false,
    publishedAt: "2024-06-05",
    category: "Notices",
    excerpt: "Server downtime expected between 10 AM and 2 PM this Saturday."
  },
  {
    id: 4,
    title: "Research Paper Submission Deadline Extended",
    slug: "paper-deadline",
    priority: false,
    publishedAt: "2024-06-01",
    category: "Research",
    excerpt: "The deadline for the internal technical journal has been pushed to July 15th."
  }
];

export const MOCK_CIRCULARS: Circular[] = [
  {
    id: 101,
    title: "Revision of DA Rates effective Jan 2024",
    slug: "da-rates-jan-2024",
    summary: "Office Memorandum regarding the enhancement of Dearness Allowance.",
    issueDate: "2024-05-20",
    refNumber: "FIN/2024/05/20",
    isArchived: false,
    category: "Finance",
    attachmentUrl: "#"
  },
  {
    id: 102,
    title: "Guidelines for LTC Claims",
    slug: "ltc-guidelines",
    summary: "Updated checklist for submission of Leave Travel Concession bills.",
    issueDate: "2024-05-15",
    refNumber: "ADM/LTC/24-25",
    isArchived: false,
    category: "Administration",
    attachmentUrl: "#"
  },
  {
    id: 103,
    title: "Safety Protocols for Structural Engineering Lab",
    slug: "safety-lab-protocols",
    summary: "Mandatory safety gear requirements for all personnel entering Lab B.",
    issueDate: "2024-05-10",
    refNumber: "SAF/LAB/03",
    isArchived: false,
    category: "Safety",
    attachmentUrl: "#"
  },
  {
    id: 104,
    title: "Holiday List Amendment",
    slug: "holiday-list-amendment",
    summary: "Change in date for Id-ul-Zuha subject to moon sighting.",
    issueDate: "2024-04-28",
    refNumber: "ADM/HOL/2024",
    isArchived: false,
    category: "HR",
    attachmentUrl: "#"
  }
];

export const MOCK_LINKS: QuickLinkCategory[] = [
  {
    id: 1,
    name: "Employee Self Service",
    links: [
      { id: 1, title: "Leave Portal (ERP)", url: "#", isExternal: true, categoryId: 1 },
      { id: 2, title: "Payslip Download", url: "#", isExternal: false, categoryId: 1 },
      { id: 3, title: "Medical Reimbursement", url: "#", isExternal: false, categoryId: 1 }
    ]
  },
  {
    id: 2,
    name: "Key Resources",
    links: [
      { id: 4, title: "CSIR Website", url: "https://www.csir.res.in", isExternal: true, categoryId: 2 },
      { id: 5, title: "Telephone Directory", url: "#", isExternal: false, categoryId: 2 },
      { id: 6, title: "IT Helpdesk", url: "#", isExternal: false, categoryId: 2 },
      { id: 7, title: "Holiday Calendar", url: "#", isExternal: false, categoryId: 2 }
    ]
  }
];

export const MOCK_HOLIDAYS: Holiday[] = [
  { id: 1, name: "Republic Day", date: "2024-01-26", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 2, name: "Holi", date: "2024-03-25", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 3, name: "Good Friday", date: "2024-03-29", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 4, name: "Id-ul-Fitr", date: "2024-04-11", holidayType: "gazetted", isTentative: true, notes: "Subject to moon sighting", colourHex: "#ef4444" },
  { id: 5, name: "Ram Navami", date: "2024-04-17", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 6, name: "Mahavir Jayanti", date: "2024-04-21", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 7, name: "Budha Purnima", date: "2024-05-23", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 8, name: "Id-ul-Zuha (Bakrid)", date: "2024-06-17", holidayType: "gazetted", isTentative: true, colourHex: "#ef4444" },
  { id: 9, name: "Muharram", date: "2024-07-17", holidayType: "gazetted", isTentative: true, colourHex: "#ef4444" },
  { id: 10, name: "Independence Day", date: "2024-08-15", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 11, name: "Raksha Bandhan", date: "2024-08-19", holidayType: "restricted", isTentative: false, colourHex: "#eab308" },
  { id: 12, name: "Ganesh Chaturthi", date: "2024-09-07", holidayType: "restricted", isTentative: false, colourHex: "#eab308" },
  { id: 13, name: "Mahatma Gandhi's Birthday", date: "2024-10-02", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 14, name: "Dussehra", date: "2024-10-12", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 15, name: "Diwali", date: "2024-10-31", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 16, name: "Guru Nanak's Birthday", date: "2024-11-15", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
  { id: 17, name: "Christmas Day", date: "2024-12-25", holidayType: "gazetted", isTentative: false, colourHex: "#ef4444" },
];

export const MOCK_ALBUMS: GalleryAlbum[] = [
  { id: 1, title: "Foundation Day 2024", coverImage: "https://picsum.photos/400/300?random=1", photoCount: 24, date: "2024-06-10" },
  { id: 2, title: "Science Day Exhibition", coverImage: "https://picsum.photos/400/300?random=2", photoCount: 45, date: "2024-02-28" },
  { id: 3, title: "Campus Cleanliness Drive", coverImage: "https://picsum.photos/400/300?random=3", photoCount: 12, date: "2024-03-15" },
  { id: 4, title: "Structural Safety Workshop", coverImage: "https://picsum.photos/400/300?random=4", photoCount: 30, date: "2024-04-05" },
];