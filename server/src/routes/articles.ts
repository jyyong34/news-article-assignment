import { Router, Request, Response } from 'express';
import { getDb, saveToDisk } from '../db/database';
import { Article, ArticleInput } from '../types/article';

const router = Router();

// Helper: validates that required article fields are present and non-empty
// Server-side validation as defense-in-depth (frontend also validates with Zod)
function validateArticleInput(body: any): { valid: boolean; error?: string } {
  const { title, summary, date, publisher } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return { valid: false, error: 'Title is required' };
  }
  if (!summary || typeof summary !== 'string' || summary.trim() === '') {
    return { valid: false, error: 'Summary is required' };
  }
  if (!date || typeof date !== 'string' || date.trim() === '') {
    return { valid: false, error: 'Date is required' };
  }
  if (!publisher || typeof publisher !== 'string' || publisher.trim() === '') {
    return { valid: false, error: 'Publisher is required' };
  }

  return { valid: true };
}

/**
 * Helper: converts sql.js query results (array-of-arrays format)
 * into an array of typed Article objects.
 */
function rowsToArticles(result: any[]): Article[] {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map((row: any[]) => {
    const article: any = {};
    columns.forEach((col: string, i: number) => {
      article[col] = row[i];
    });
    return article as Article;
  });
}

/**
 * GET /api/articles
 * Fetches articles with pagination and optional search filtering.
 * Query params: page, limit, search
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 5);
    const search = ((req.query.search as string) || '').trim();
    const offset = (page - 1) * limit;

    let articles: Article[];
    let total: number;

    if (search) {
      // Parameterized query prevents SQL injection
      // LIKE with % wildcards for partial matching, LOWER() for case-insensitivity
      const pattern = `%${search.toLowerCase()}%`;

      const articleResult = db.exec(
        `SELECT * FROM articles
         WHERE LOWER(title) LIKE ? OR LOWER(publisher) LIKE ?
         ORDER BY date DESC, id DESC
         LIMIT ? OFFSET ?`,
        [pattern, pattern, limit, offset]
      );
      articles = rowsToArticles(articleResult);

      const countResult = db.exec(
        `SELECT COUNT(*) as count FROM articles
         WHERE LOWER(title) LIKE ? OR LOWER(publisher) LIKE ?`,
        [pattern, pattern]
      );
      total = (countResult[0]?.values[0]?.[0] as number) || 0;
    } else {
      const articleResult = db.exec(
        `SELECT * FROM articles
         ORDER BY date DESC, id DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      articles = rowsToArticles(articleResult);

      const countResult = db.exec('SELECT COUNT(*) as count FROM articles');
      total = (countResult[0]?.values[0]?.[0] as number) || 0;
    }

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

/**
 * GET /api/articles/:id
 * Fetches a single article (used when pre-filling the edit form)
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const result = db.exec('SELECT * FROM articles WHERE id = ?', [id]);
    const articles = rowsToArticles(result);

    if (articles.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(articles[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

/**
 * POST /api/articles
 * Creates a new article
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const validation = validateArticleInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { title, summary, date, publisher } = req.body as ArticleInput;

    const stmt = db.prepare(
      'INSERT INTO articles (title, summary, date, publisher) VALUES (?, ?, ?, ?)'
    );
    stmt.run([title.trim(), summary.trim(), date.trim(), publisher.trim()]);
    stmt.free();

    // Get the newly inserted article using last_insert_rowid()
    const result = db.exec('SELECT * FROM articles WHERE id = last_insert_rowid()');
    const newArticle = rowsToArticles(result)[0];

    saveToDisk();
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

/**
 * PUT /api/articles/:id
 * Updates an existing article
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const validation = validateArticleInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const existing = db.exec('SELECT id FROM articles WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const { title, summary, date, publisher } = req.body as ArticleInput;

    const stmt = db.prepare(
      'UPDATE articles SET title = ?, summary = ?, date = ?, publisher = ? WHERE id = ?'
    );
    stmt.run([title.trim(), summary.trim(), date.trim(), publisher.trim(), id]);
    stmt.free();

    const result = db.exec('SELECT * FROM articles WHERE id = ?', [id]);
    const updatedArticle = rowsToArticles(result)[0];

    saveToDisk();
    res.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

/**
 * DELETE /api/articles/:id
 * Deletes an article by ID
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const existing = db.exec('SELECT id FROM articles WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    db.run('DELETE FROM articles WHERE id = ?', [id]);
    saveToDisk();

    res.json({ message: 'Article deleted successfully', id });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;