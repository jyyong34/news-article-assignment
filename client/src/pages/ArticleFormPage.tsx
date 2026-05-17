import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { articleSchema, type ArticleFormData } from '../schemas/articleSchema';
import { articleService, getErrorMessage } from '../services/articleService';

/**
 * Page 1: Form to create or update an article.
 * Detects edit mode via the :id URL param.
 * Uses React Hook Form + Zod for validation.
 */
function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fetchingArticle, setFetchingArticle] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      summary: '',
      date: '',
      publisher: '',
    },
  });

  // In edit mode, fetch the existing article and pre-fill the form
  useEffect(() => {
    if (!isEditMode || !id) return;

    const loadArticle = async () => {
      try {
        const article = await articleService.getById(parseInt(id));
        reset({
          title: article.title,
          summary: article.summary,
          date: article.date,
          publisher: article.publisher,
        });
      } catch (err) {
        setSubmitError(getErrorMessage(err));
      } finally {
        setFetchingArticle(false);
      }
    };

    loadArticle();
  }, [id, isEditMode, reset]);

  /**
   * Submit handler — creates or updates depending on mode
   */
  const onSubmit = async (data: ArticleFormData) => {
    setSubmitError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isEditMode && id) {
        await articleService.update(parseInt(id), data);
        setSuccessMessage('Article updated successfully!');
        // After updating, navigate back to the list after a short delay
        setTimeout(() => navigate('/'), 1200);
      } else {
        await articleService.create(data);
        setSuccessMessage('Article created successfully!');
        // Clear form so user can immediately enter another article
        reset();
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingArticle) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading article...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">{isEditMode ? 'Update Article' : 'Create New Article'}</h1>
            <Link to="/" className="btn btn-outline-secondary">
              ← Back to List
            </Link>
          </div>

          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>
                Article Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter article title"
                isInvalid={!!errors.title}
                {...register('title')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="summary">
              <Form.Label>
                Article Summary <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter a brief summary of the article"
                isInvalid={!!errors.summary}
                {...register('summary')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.summary?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="date">
              <Form.Label>
                Article Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                isInvalid={!!errors.date}
                {...register('date')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.date?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                The publication date (cannot be in the future).
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="publisher">
              <Form.Label>
                Publisher <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Saigon Times"
                isInvalid={!!errors.publisher}
                {...register('publisher')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.publisher?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={loading || isSubmitting}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Update Article'
                ) : (
                  'Create Article'
                )}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => reset()}
                disabled={loading}
              >
                Reset Form
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ArticleFormPage;