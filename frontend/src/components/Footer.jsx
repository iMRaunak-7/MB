import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-5">
      <Container>
        <Row className="py-4">
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="footer-logo mb-4">Stackmart</h5>
            <p className="mb-3">We provide premium products at competitive prices. Shop with confidence and enjoy our fast shipping and excellent customer service.</p>
            <div className="social-icons">
              <a href="#!" className="social-icon"><FaFacebookF /></a>
              <a href="#!" className="social-icon"><FaTwitter /></a>
              <a href="#!" className="social-icon"><FaInstagram /></a>
              <a href="#!" className="social-icon"><FaLinkedinIn /></a>
            </div>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-4">Quick Links</h5>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/cart" className="footer-link">Cart</Link></li>
              <li><Link to="/profile" className="footer-link">My Account</Link></li>
              <li><Link to="/products" className="footer-link">All Products</Link></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-4">Categories</h5>
            <ul className="footer-links">
              <li><Link to="/category/electronics" className="footer-link">Electronics</Link></li>
              <li><Link to="/category/clothing" className="footer-link">Clothing</Link></li>
              <li><Link to="/category/home" className="footer-link">Home & Garden</Link></li>
              <li><Link to="/category/sports" className="footer-link">Sports & Outdoors</Link></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-4">Contact Us</h5>
            <ul className="footer-links">
              <li className="d-flex align-items-center mb-3">
                <FaMapMarkerAlt className="me-2" />
                <span>123 Commerce St, Business City, 12345</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <FaPhone className="me-2" />
                <span>(123) 456-7890</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <FaEnvelope className="me-2" />
                <span>support@stackmart.com</span>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {currentYear} Stackmart. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
