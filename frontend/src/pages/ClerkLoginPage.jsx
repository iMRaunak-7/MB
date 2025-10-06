import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { SignIn } from '@clerk/clerk-react';
import Meta from '../components/Meta';

const ClerkLoginPage = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const redirect = searchParams.get('redirect') || '/';

  return (
    <Container className="d-flex justify-content-center align-items-center my-4">
      <Card className="p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <Meta title={'Sign In'} />
        <Card.Body>
          <h1 className="text-center mb-4">Sign In</h1>
          <SignIn 
            routing="path"
            path="/login"
            signUpUrl="/register"
            afterSignInUrl={redirect}
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

export default ClerkLoginPage;