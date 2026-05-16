import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import articlesRouter from './routes/articles';
import { initDb } from './db/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from the React frontend (different port)
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint — useful for verifying the server is running
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount article routes under /api/articles
app.use('/api/articles', articlesRouter);

// Global error handler — catches any unhandled errors from routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize the database, then start the server
// We must wait for the async DB init before accepting requests
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API available at http://localhost:${PORT}/api/articles`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();