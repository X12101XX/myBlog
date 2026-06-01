export interface Post {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  pageCount: number;
  fileSize: string;
  pdfUrl: string;
  thumbnailUrl: string;
  date: string;
  readingTime: string;
  language: string;
  format: string;
  content?: string;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface SearchResult {
  item: Post;
  score: number;
  matches?: FuseMatch[];
}

export interface PDFMatch {
  pageNumber: number;
  snippet: string;
  matchText: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'pages' | 'az';
export type ZoomMode = 'fit-width' | 'fit-page' | number;
export type SpreadMode = 'single' | 'double';
export type ScrollDirection = 'vertical' | 'horizontal';

interface FuseMatch {
  indices: [number, number][];
  key: string;
  value: string;
}
