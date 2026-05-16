// Shared TypeScript type for an article
// Used across routes and database layer for type safety

export interface Article {
  id: number;
  title: string;
  summary: string;
  date: string; // ISO date string (YYYY-MM-DD)
  publisher: string;
  created_at: string;
}

// Type for creating a new article (no id or created_at yet)
export interface ArticleInput {
  title: string;
  summary: string;
  date: string;
  publisher: string;
}