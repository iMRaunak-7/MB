import Stripe from 'stripe';
import 'dotenv/config';

// Check for required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY environment variable is not set');
}

if (!process.env.STRIPE_PUBLISHABLE_KEY) {
  console.error('ERROR: STRIPE_PUBLISHABLE_KEY environment variable is not set');
}

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get Stripe configuration (publishable key for frontend)
const config = (req, res) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return res.status(500).json({
      message: 'Stripe publishable key is not configured'
    });
  }
  
  res.status(200).json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
};

// Create Stripe Payment Intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Amount is required and must be greater than 0'
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency,
      metadata: {
        orderId: orderId || 'unknown',
        integration_check: 'accept_a_payment'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe PaymentIntent creation failed:', error);
    res.status(500).json({
      message: 'Payment intent creation failed',
      error: error.message
    });
  }
};

// Confirm payment (webhook handler or manual confirmation)
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        message: 'Payment Intent ID is required'
      });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.status(200).json({
        id: paymentIntent.id,
        status: 'success',
        message: 'Payment confirmed successfully',
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency,
        updateTime: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        message: `Payment not completed. Status: ${paymentIntent.status}`
      });
    }
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    res.status(500).json({
      message: 'Payment confirmation failed',
      error: error.message
    });
  }
};

// Webhook handler for Stripe events (optional but recommended for production)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      // You can update your database here
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!', paymentMethod.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

export { 
  config, 
  createPaymentIntent as order, 
  confirmPayment as validate,
  handleWebhook
};
