import authorData from './author.json';

export interface AuthorSection {
  heading: string;
  paragraphs: string[];
}

export interface AuthorMilestone {
  year: string;
  title: string;
  text: string;
}

export interface AuthorStat {
  label: string;
  value: string;
}

export interface AuthorData {
  penName: string;
  alias: string;
  realName: string;
  birthYear: number;
  hometown: string;
  handle: string;
  profileUrl: string;
  telegramUrl: string;
  role: string;
  tagline: string;
  lead: string;
  sections: AuthorSection[];
  milestones: AuthorMilestone[];
  quote: string;
  quoteSource: string;
  stats: AuthorStat[];
}

export const AUTHOR: AuthorData = authorData as AuthorData;
