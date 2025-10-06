import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { SignUp } from '@clerk/clerk-react';
import Meta from '../components/Meta';

const ClerkRegisterPage = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const redirect = searchParams.get('redirect') || '/';

  return (
    <Container className="d-flex justify-content-center align-items-center my-4">
      <Card className="p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <Meta title={'Register'} />
        <Card.Body>
          <h1 className="text-center mb-4">Register</h1>
          <SignUp 
            routing="path"
            path="/register"
            signInUrl="/login"
            afterSignUpUrl={redirect}
            appearance={{
              elements: {
                formButtonPrimary: "btn btn-warning w-100 mb-3",
                card: "shadow-none"
              }
            }}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClerkRegisterPage;