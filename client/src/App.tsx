import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ArticleListPage from './pages/ArticleListPage';
import ArticleFormPage from './pages/ArticleFormPage';
import './App.css';

/**
 * Root application component.
 * Defines the route structure:
 *   /           → Article list page (Page 2)
 *   /create     → New article form (Page 1)
 *   /edit/:id   → Edit article form (Page 1 with pre-filled data)
 *   /*          → Redirect to home
 */
function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="pb-5">
        <Routes>
          <Route path="/" element={<ArticleListPage />} />
          <Route path="/create" element={<ArticleFormPage />} />
          <Route path="/edit/:id" element={<ArticleFormPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;