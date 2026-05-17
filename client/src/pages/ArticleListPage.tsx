import { useEffect, useState, useCallback } from 'react';
import { Container, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import PaginationControls from '../components/PaginationControls';
import { articleService, getErrorMessage } from '../services/articleService';
import type { Article } from '../types/article';

const ARTICLES_PER_PAGE = 5;

/**
 * Page 2: Lists all articles with pagination, search, refresh, and delete.
 * Articles are fetched on mount and whenever page/search changes.
 */
function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Debounced version
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Fetches articles from the backend with current pagination/search state
   */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await articleService.getAll({
        page: currentPage,
        limit: ARTICLES_PER_PAGE,
        search: searchQuery || undefined,
      });
      setArticles(data.articles);
      setTotalPages(data.pagination.totalPages);
      setTotalArticles(data.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  // Fetch articles whenever page or search query changes
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Debounce the search input — only trigger a search 400ms after typing stops
  // Prevents firing a request on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page when search changes
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /**
   * Refresh button — re-fetches the current page
   */
  const handleRefresh = () => {
    fetchArticles();
  };

  /**
   * Delete handler — called by ArticleCard after confirmation
   */
  const handleDelete = async (id: number) => {
    try {
      await articleService.delete(id);
      setSuccessMessage('Article deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      // If this was the last article on the page, go back a page
      if (articles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchArticles();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">News Articles</h1>
        <Button variant="success" as={Link as any} to="/create">
          + New Article
        </Button>
      </div>

      {/* Search bar */}
      <InputGroup className="mb-3">
        <Form.Control
          type="search"
          placeholder="Search by title or publisher..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <Button variant="outline-secondary" onClick={handleClearSearch}>
            Clear
          </Button>
        )}
        <Button variant="outline-primary" onClick={handleRefresh} disabled={loading}>
          🔄 Refresh
        </Button>
      </InputGroup>

      {/* Articles count */}
      <div className="text-info fw-bold mb-3 text-uppercase">
        {totalArticles.toLocaleString()} {totalArticles === 1 ? 'article' : 'articles'} found
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading articles...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && articles.length === 0 && (
        <Alert variant="info" className="text-center">
          {searchQuery
            ? `No articles found matching "${searchQuery}".`
            : 'No articles yet. Create your first article!'}
        </Alert>
      )}

      {/* Articles list */}
      {!loading && articles.length > 0 && (
        <>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} onDelete={handleDelete} />
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </Container>
  );
}

export default ArticleListPage;