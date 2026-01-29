export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatarUrl?: string;
  department?: string;
  designation?: string;
  phone?: string;
  bio?: string;
}

export interface JournalPost {
  id: number;
  title: string;
  slug: string;
  priority: boolean; // Pinned
  publishedAt: string;
  category: string;
  excerpt: string;
  content?: string;
  attachmentUrl?: string;
}

export interface Circular {
  id: number;
  title: string;
  slug: string;
  summary: string;
  issueDate: string;
  refNumber: string;
  isArchived: boolean;
  category: string;
  attachmentUrl: string;
}

export interface QuickLink {
  id: number;
  title: string;
  url: string;
  isExternal: boolean;
  categoryId: number;
}

export interface QuickLinkCategory {
  id: number;
  name: string;
  links: QuickLink[];
  orderIndex?: number;
}

export type HolidayType = 'gazetted' | 'restricted' | 'optional' | 'institution';

export interface Holiday {
  id: number;
  name: string;
  date: string; // ISO date
  holidayType: HolidayType;
  isTentative: boolean;
  notes?: string;
  colourHex: string;
}

export interface OrgEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'conference' | 'meeting' | 'workshop';
}

export interface GalleryAlbum {
  id: number;
  title: string;
  coverImage: string;
  photoCount: number;
  date: string;
}

export interface MenuItem {
  id: number;
  label: string;
  route: string; // Internal route or external URL
  type: 'internal' | 'external' | 'page';
  order: number;
}

export interface SearchResult {
  id: number;
  type: 'journal' | 'circular' | 'event';
  title: string;
  snippet: string;
  date: string;
  url: string;
}

export interface ArchiveStat {
  year: number;
  count: number;
}