// Shared TypeScript types for articles, matching the backend's structure

export interface Article {
  id: number;
  title: string;
  summary: string;
  date: string;
  publisher: string;
  created_at: string;
}

// Type for form input (no id or created_at — those are server-generated)
export interface ArticleInput {
  title: string;
  summary: string;
  date: string;
  publisher: string;
}

// Response shape for the paginated articles endpoint
export interface PaginatedArticles {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}