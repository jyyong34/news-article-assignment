import axios from 'axios';
import type { Article, ArticleInput, PaginatedArticles } from '../types/article';

// Axios instance with base URL pointing to our API
// Vite's dev server proxies /api to http://localhost:3001
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Centralized API service for all article-related HTTP calls.
 * Keeping this in one file makes it easy to swap implementations
 * and gives us a single place for error handling.
 */
export const articleService = {
  /**
   * Fetch a paginated list of articles, optionally filtered by search term
   */
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedArticles> {
    const response = await api.get<PaginatedArticles>('/articles', { params });
    return response.data;
  },

  /**
   * Fetch a single article by ID (used when pre-filling the edit form)
   */
  async getById(id: number): Promise<Article> {
    const response = await api.get<Article>(`/articles/${id}`);
    return response.data;
  },

  /**
   * Create a new article
   */
  async create(article: ArticleInput): Promise<Article> {
    const response = await api.post<Article>('/articles', article);
    return response.data;
  },

  /**
   * Update an existing article
   */
  async update(id: number, article: ArticleInput): Promise<Article> {
    const response = await api.put<Article>(`/articles/${id}`, article);
    return response.data;
  },

  /**
   * Delete an article
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/articles/${id}`);
  },
};

/**
 * Helper: extracts a readable error message from any Axios error.
 * Used by components to show meaningful error messages to users.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}