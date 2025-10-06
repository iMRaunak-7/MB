import React from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { UserProfile } from '@clerk/clerk-react';
import { LinkContainer } from 'react-router-bootstrap';
import { FaHistory } from 'react-icons/fa';
import Meta from '../components/Meta';

const ClerkProfilePage = () => {
  return (
    <Container className="my-4">
      <Meta title="My Profile" />
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">My Profile</h1>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <LinkContainer to="/order-history">
            <Button variant="outline-primary" className="d-flex align-items-center">
              <FaHistory className="me-2" /> View Order History
            </Button>
          </LinkContainer>
        </Col>
      </Row>
      <Card className="p-3">
        <UserProfile 
          appearance={{
            elements: {
              card: "shadow-none",
              navbar: "mb-4",
              navbarButton: "btn btn-outline-secondary",
              navbarButtonActive: "btn btn-warning",
              formButtonPrimary: "btn btn-warning"
            }
          }}
        />
      </Card>
    </Container>
  );
};

export default ClerkProfilePage;