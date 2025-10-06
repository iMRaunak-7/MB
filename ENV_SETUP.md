# Environment Setup

This project uses environment variables to store sensitive information like database credentials and API keys. Follow these steps to set up your environment:

## Setting Up Environment Variables

1. Create a `.env` file in the root directory of the project (it's already in `.gitignore`)
2. Copy the content from `.env.example` into your `.env` file
3. Replace the placeholder values with your actual credentials

## Required Environment Variables

- `MONGO_URI`: Your MongoDB connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Application environment (development, production)
- `JWT_SECRET`: Secret key for JWT token generation
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret (for production)
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: Email account username
- `EMAIL_PASS`: Email account password

## Security Notes

- Never commit your `.env` file to version control
- MongoDB test files have been added to `.gitignore` to prevent accidental credential leaks
- Use environment variables for all sensitive information
- For production deployment, use secure environment variable management

## Testing MongoDB Connection

Run the test script with your environment variables:

```bash
# Make sure to run this after setting up your .env file
node test-mongo.js
```