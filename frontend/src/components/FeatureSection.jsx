import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaShippingFast, FaMoneyBillWave, FaHeadset, FaShieldAlt } from 'react-icons/fa';

const FeatureSection = () => {
  return (
    <Container className="my-5">
      <Row className="g-4">
        <Col md={3} sm={6}>
          <div className="text-center p-3 h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div className="mb-3">
              <FaShippingFast style={{ fontSize: '2.5rem', color: '#ff8800' }} />
            </div>
            <h5>Free Shipping</h5>
            <p className="text-muted small">On all orders over $99</p>
          </div>
        </Col>
        
        <Col md={3} sm={6}>
          <div className="text-center p-3 h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div className="mb-3">
              <FaMoneyBillWave style={{ fontSize: '2.5rem', color: '#ff8800' }} />
            </div>
            <h5>Money Back</h5>
            <p className="text-muted small">30 days guarantee</p>
          </div>
        </Col>
        
        <Col md={3} sm={6}>
          <div className="text-center p-3 h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div className="mb-3">
              <FaHeadset style={{ fontSize: '2.5rem', color: '#ff8800' }} />
            </div>
            <h5>24/7 Support</h5>
            <p className="text-muted small">Customer support</p>
          </div>
        </Col>
        
        <Col md={3} sm={6}>
          <div className="text-center p-3 h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div className="mb-3">
              <FaShieldAlt style={{ fontSize: '2.5rem', color: '#ff8800' }} />
            </div>
            <h5>Secure Payment</h5>
            <p className="text-muted small">Protected by Stripe</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FeatureSection;