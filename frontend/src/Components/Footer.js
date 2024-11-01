import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


export default class Footer extends Component {
  render() {
    return (
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col md={4}>
              <h5>Про нас</h5>
              <p>
                Ми намагаємось підібрати найкращі книги для вас. Дякуємо, що обрали нас!
              </p>
            </Col>
            <Col md={4}>
              <h5>Корисні посилання</h5>
              <ul className="list-unstyled">
                <li><a href="/about" className="text-white">Про нас</a></li>
                <li><a href="/contact" className="text-white">Контакти</a></li>
                <li><a href="/privacy" className="text-white">Політика конфіденційності</a></li>
              </ul>
            </Col>
            <Col md={4}>
              <h5>Наші соцмережі</h5>
              <a href="https://facebook.com" className="text-white me-3">
                <i className="bi bi-facebook"></i> Facebook
              </a>
              <a href="https://twitter.com" className="text-white me-3">
                <i className="bi bi-twitter"></i> Twitter
              </a>
              <a href="https://instagram.com" className="text-white">
                <i className="bi bi-instagram"></i> Instagram
              </a>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col className="text-center">
              <p className="mb-0">&copy; {new Date().getFullYear()} Всі права захищені.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
}
