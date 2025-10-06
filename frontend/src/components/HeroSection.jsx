import React from 'react';
import { Container, Row, Col, Image, Badge } from 'react-bootstrap';
import { FaShippingFast, FaAward, FaHeadset } from 'react-icons/fa';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="hero-content text-md-start text-center">
            <Badge bg="warning" text="dark" className="mb-3 px-3 py-2">Top Rated Store</Badge>
            <h1 className="hero-title">Welcome to Stackmart</h1>
            <p className="hero-subtitle">
              Discover premium products with fast shipping and amazing customer service.
            </p>
            
            <Row className="mt-4 d-none d-md-flex">
              <Col sm={4} className="mb-3">
                <div className="feature-item">
                  <FaShippingFast className="feature-icon" />
                  <div className="feature-text">Fast Delivery</div>
                </div>
              </Col>
              <Col sm={4} className="mb-3">
                <div className="feature-item">
                  <FaAward className="feature-icon" />
                  <div className="feature-text">Quality Products</div>
                </div>
              </Col>
              <Col sm={4} className="mb-3">
                <div className="feature-item">
                  <FaHeadset className="feature-icon" />
                  <div className="feature-text">24/7 Support</div>
                </div>
              </Col>
            </Row>
          </Col>
          <Col md={6} className="d-none d-md-block">
            <div className="hero-image-container">
              <Image 
                src="/images/shopping-hero.jpg" 
                alt="Shopping at Stackmart" 
                className="hero-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/hero-bg.jpg";
                }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroSection;