import { Link, useLocation } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container } from 'react-bootstrap';

/**
 * Top navigation bar shown on every page.
 * Highlights the active route so users know where they are.
 */
function Navbar() {
  const location = useLocation();

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          📰 News Article Manager
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              View Articles
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/create"
              active={location.pathname === '/create' || location.pathname.startsWith('/edit')}
            >
              Create Article
            </Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

export default Navbar;