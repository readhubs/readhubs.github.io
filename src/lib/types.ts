export interface Book {
  slug: string;
  title: string;
  author: string;
  category: string;
  description: string;
  keywords: string[];
  cover?: string;
  language: string;
  featured: boolean;
  readTime: number;
  dateAdded: string;
  articleCount?: number;
  series?: string;
  seriesSlug?: string;
  seriesOrder?: number;
  seriesTotal?: number;
}

export interface BookMeta extends Book {
  articles?: { id: string; title: string; slug: string }[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  content?: string;
  bookSlug?: string;
  bookTitle?: string;
  category?: string;
  schema?: Record<string, unknown>;
}

export interface SeriesMeta {
  slug: string;
  name: string;
  bookSlugs: string[];
  totalBooks: number;
  category: string;
  language: string;
  dateAdded: string;
}
