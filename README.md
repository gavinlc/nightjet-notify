# NightJet Notify

A web application that helps users find available NightJet train tickets and set up alerts when tickets become available.

## Features

- Search for NightJet train connections
- View available ticket offers
- Set up email alerts for when tickets become available
- View and manage your active alerts

## Architecture

The application consists of two main parts:

1. **Frontend**: A React application built with Vite, Material-UI, and TypeScript
2. **Backend**: Serverless functions deployed on AWS Lambda

### Backend Components

- **API Endpoints**: Lambda functions for creating, listing, and deleting alerts
- **Scheduled Job**: A Lambda function that runs daily to check for available tickets
- **Database**: DynamoDB table to store alerts
- **Email Notifications**: Sent via Amazon SES when tickets become available

## Local Development

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- AWS CLI (for deployment)
- AWS SES configured with verified email addresses

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.dev` file with your configuration (see `.env.dev.example`)
4. Start the frontend development server:
   ```
   npm run dev
   ```
5. Start the serverless functions locally:
   ```
   npm run serverless:dev
   ```

## Deployment

### Backend Deployment

1. Configure AWS credentials:
   ```
   aws configure
   ```
2. Set up Amazon SES:
   - Verify your domain or email addresses in SES
   - If in sandbox mode, verify recipient email addresses
   - Request production access if needed
3. Deploy the serverless functions:
   ```
   npm run serverless:deploy
   ```

### Frontend Deployment

1. Build the frontend:
   ```
   npm run build
   ```
2. Deploy the built files to your hosting provider

## Environment Variables

### Local Development

Create a `.env.dev` file with the following variables:

```
# DynamoDB
ALERTS_TABLE=nightjet-notify-alerts-dev

# Email Configuration
SMTP_FROM=alerts@nightjet-notify.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Production

For production, use AWS Systems Manager Parameter Store to store sensitive information:

```
/nightjet/smtp/from
/nightjet/frontend/url
```

## Amazon SES Setup

1. **Verify Email Addresses**:
   - Go to AWS SES Console
   - Click "Verified Identities"
   - Click "Create Identity"
   - Choose "Email Address" and enter your sender email
   - Follow the verification steps in the email

2. **Domain Verification** (Recommended for Production):
   - Go to AWS SES Console
   - Click "Verified Identities"
   - Click "Create Identity"
   - Choose "Domain" and enter your domain
   - Follow the DNS configuration steps

3. **Request Production Access**:
   - If you need to send emails to unverified addresses
   - Go to AWS SES Console
   - Click "Account Dashboard"
   - Click "Request Production Access"
   - Fill out the form with your use case

## License

MIT
