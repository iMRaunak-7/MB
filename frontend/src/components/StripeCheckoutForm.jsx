import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { PAYMENT_URL } from '../constants';
import { apiSlice } from '../slices/apiSlice';

// Create an RTK Query endpoint for payment operations
const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (data) => ({
        url: `${PAYMENT_URL}/stripe/create-payment-intent`,
        method: 'POST',
        body: data,
      }),
    }),
    confirmPayment: builder.mutation({
      query: (data) => ({
        url: `${PAYMENT_URL}/stripe/confirm-payment`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks for using the payment endpoints
export const { 
  useCreatePaymentIntentMutation, 
  useConfirmPaymentMutation 
} = paymentApiSlice;

const StripeCheckoutForm = ({ 
  amount, 
  orderId, 
  onPaymentSuccess, 
  onPaymentError,
  currency = 'usd' 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  
  // Get authentication state from Redux
  const { userInfo } = useSelector((state) => state.auth);
  
  // Use the generated RTK Query hooks
  const [createPaymentIntent, { isLoading: isCreatingIntent }] = useCreatePaymentIntentMutation();

  // Create payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      if (!amount || amount <= 0) return;
      
      try {
        setError(null);
        const result = await createPaymentIntent({
          amount,
          currency,
          orderId,
        }).unwrap();
        
        setClientSecret(result.clientSecret);
      } catch (err) {
        setError(err?.data?.message || err.error || 'Failed to initialize payment');
        console.error('Payment initialization failed:', err);
        toast.error('Could not initialize payment. Please try again.');
      }
    };

    if (amount > 0) {
      initializePayment();
    }
  }, [amount, orderId, currency, createPaymentIntent]);

  // Use confirmation hook
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmPaymentMutation();
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setError(error.message);
        if (onPaymentError) {
          onPaymentError(error);
        }
        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm on backend
        try {
          await confirmPayment({
            paymentIntentId: paymentIntent.id,
            orderId
          }).unwrap();
        } catch (confirmError) {
          console.warn('Backend payment confirmation failed:', confirmError);
          // Continue with success flow even if backend confirmation fails
        }
        
        toast.success('Payment successful!');
        if (onPaymentSuccess) {
          onPaymentSuccess({
            id: paymentIntent.id,
            status: 'success',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            updateTime: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError(error?.data?.message || error.message || 'Payment processing failed');
      toast.error(`Payment error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Loading state when creating payment intent
  if (isCreatingIntent || (!clientSecret && amount > 0)) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading payment...</span>
        </Spinner>
        <p className="mt-2">Preparing payment...</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <div className="mb-3">
        <Form.Label>Card Details</Form.Label>
        <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="mb-3">
        <small className="text-muted">
          Total Amount: {currency.toUpperCase()} {amount.toFixed(2)}
        </small>
      </div>

      <Button 
        variant="warning" 
        type="submit" 
        disabled={!stripe || isProcessing || isConfirming}
        className="w-100"
      >
        {isProcessing || isConfirming ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Processing Payment...
          </>
        ) : (
          `Pay ${currency.toUpperCase()} ${amount.toFixed(2)}`
        )}
      </Button>

      <div className="mt-3">
        <small className="text-muted">
          <i className="fas fa-lock me-1"></i>
          Your payment information is secure and encrypted.
        </small>
      </div>
    </Form>
  );
};

export default StripeCheckoutForm;