import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/custom.css';
import './assets/styles/hero-styles.css'; // Dedicated hero styling
// Removed global hero background handler as we now use component-specific approach
import Header from './components/Header';
import Footer from './components/Footer';
import ClerkAuthProvider from './components/ClerkAuthProvider';

const App = () => {
  return (
    <ClerkAuthProvider>
      <div className='position-relative'>
        <Header />
        <main className="py-4">
          <Container className="fade-in">
            <Outlet />
          </Container>
        </main>
        <Footer />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </ClerkAuthProvider>
  );
};

export default App;
