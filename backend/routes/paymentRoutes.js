import express from 'express';

import { protect } from '../middleware/authMiddleware.js';
import { config, order, validate, handleWebhook } from '../controllers/paymentController.js';
import validateRequest from '../middleware/validator.js';
import {body} from 'express-validator';

const router = express.Router();

const validator = {
    createPaymentIntent: [
        body('amount')
            .isNumeric()
            .withMessage('Amount must be a number')
            .custom(value => {
                if (value <= 0) {
                    throw new Error('Amount must be greater than 0');
                }
                return true;
            }),
        body('currency')
            .optional()
            .isLength({ min: 3, max: 3 })
            .withMessage('Currency must be a 3-letter code'),
        body('orderId')
            .optional()
            .isString()
            .withMessage('Order ID must be a string')
    ],
    confirmPayment: [
        body('paymentIntentId')
            .notEmpty()
            .withMessage('Payment Intent ID is required')
            .trim()
    ]
}

// Get Stripe configuration (publishable key)
router.get('/stripe/config', config);

// Create Stripe Payment Intent
router.post('/stripe/create-payment-intent', validator.createPaymentIntent, validateRequest, protect, order);

// Confirm Stripe payment
router.post('/stripe/confirm-payment', validator.confirmPayment, validateRequest, protect, validate);

// Stripe webhook handler (should be before any middleware that parses JSON)
router.post('/stripe/webhook', express.raw({type: 'application/json'}), handleWebhook);

export default router;
