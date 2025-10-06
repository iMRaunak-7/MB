import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import Meta from '../components/Meta';
const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('Stripe');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { shippingAddress } = useSelector(state => state.cart);

  useEffect(() => {
    if (!shippingAddress) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = e => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/place-order');
  };
  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <Meta title={'Payment Method'} />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as='legend'>Select Method</Form.Label>
          <Col>
            <div 
              className="payment-method-option p-3 mb-4" 
              style={{ 
                border: paymentMethod === 'Stripe' ? '2px solid #ff8800' : '1px solid #ddd', 
                borderRadius: '12px', 
                backgroundColor: paymentMethod === 'Stripe' ? 'rgba(255, 136, 0, 0.05)' : 'white',
                cursor: 'pointer',
                boxShadow: paymentMethod === 'Stripe' ? '0 4px 8px rgba(255, 136, 0, 0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setPaymentMethod('Stripe')}
            >
              <Row className="align-items-center">
                <Col xs="auto">
                  <div style={{ 
                    backgroundColor: paymentMethod === 'Stripe' ? '#ff8800' : '#f8f9fa',
                    color: paymentMethod === 'Stripe' ? 'white' : '#6c757d',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaCreditCard size={24} />
                  </div>
                </Col>
                <Col>
                  <Form.Check
                    className='mb-1'
                    type='radio'
                    id='Stripe'
                    label={<strong>Stripe (Credit/Debit Card)</strong>}
                    name='paymentMethod'
                    value='Stripe'
                    checked={paymentMethod === 'Stripe'}
                    onChange={() => setPaymentMethod('Stripe')}
                  />
                  <p className="text-muted">Pay securely online with your credit or debit card.</p>
                </Col>
              </Row>
            </div>
            
            <div 
              className="payment-method-option p-3 mb-4" 
              style={{ 
                border: paymentMethod === 'COD' ? '2px solid #ff8800' : '1px solid #ddd', 
                borderRadius: '12px', 
                backgroundColor: paymentMethod === 'COD' ? 'rgba(255, 136, 0, 0.05)' : 'white',
                cursor: 'pointer',
                boxShadow: paymentMethod === 'COD' ? '0 4px 8px rgba(255, 136, 0, 0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setPaymentMethod('COD')}
            >
              <Row className="align-items-center">
                <Col xs="auto">
                  <div style={{ 
                    backgroundColor: paymentMethod === 'COD' ? '#ff8800' : '#f8f9fa',
                    color: paymentMethod === 'COD' ? 'white' : '#6c757d',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaMoneyBillWave size={24} />
                  </div>
                </Col>
                <Col>
                  <Form.Check
                    className='mb-1'
                    type='radio'
                    id='COD'
                    label={<strong>Cash on Delivery (COD)</strong>}
                    name='paymentMethod'
                    value='COD'
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <p className="text-muted">Pay with cash when your order is delivered to your doorstep.</p>
                </Col>
              </Row>
            </div>
          </Col>
        </Form.Group>
        <Button className='mb-3 w-100' variant='warning' type='submit'>
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default Payment;
