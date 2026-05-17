import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Article } from '../types/article';

interface ArticleCardProps {
  article: Article;
  onDelete: (id: number) => void;
}

/**
 * Displays a single article in a card format, matching the sample design.
 * Includes Edit (navigates to form) and Delete buttons.
 */
function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const navigate = useNavigate();

  // Format the date as "May 15, 2026" instead of "2026-05-15"
  const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleEdit = () => {
    navigate(`/edit/${article.id}`);
  };

  const handleDelete = () => {
    // Confirmation dialog prevents accidental deletes
    if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
      onDelete(article.id);
    }
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Badge bg="info" className="text-uppercase me-2">
              {article.publisher}
            </Badge>
            <small className="text-muted">{formattedDate}</small>
          </div>
          <div>
            <Button variant="outline-primary" size="sm" onClick={handleEdit} className="me-2">
              Edit
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
        <Card.Title as="h4">{article.title}</Card.Title>
        <Card.Text className="text-secondary">{article.summary}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ArticleCard;