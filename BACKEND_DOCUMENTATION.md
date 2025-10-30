# Wheeliyo Backend Documentation

## Table of Contents

-   [Project Overview](#project-overview)
-   [Technology Stack](#technology-stack)
-   [SDK Versions](#sdk-versions)
-   [Environment Variables](#environment-variables)
-   [Installation & Setup](#installation--setup)
-   [Database Configuration](#database-configuration)
-   [External Services](#external-services)
-   [API Endpoints](#api-endpoints)
-   [Development Guidelines](#development-guidelines)

## Project Overview

Wheeliyo is a Next.js-based application with a comprehensive backend architecture built using Node.js, MongoDB, and various external service integrations.

## Technology Stack

-   **Framework**: Next.js 13.5.11
-   **Runtime**: Node.js 18+
-   **Database**: MongoDB with Mongoose
-   **Authentication**: NextAuth.js
-   **Payment Processing**: PhonePe (Primary), Stripe, Razorpay
-   **Cloud Storage**: AWS S3
-   **Email Service**: Nodemailer
-   **SMS Service**: Twilio
-   **UI Framework**: React 18.3.1, Ant Design, NextUI
-   **Styling**: Tailwind CSS
-   **State Management**: TanStack React Query
-   **Form Handling**: React Hook Form

## SDK Versions

### Core Dependencies

```json
{
    "next": "^13.5.11",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "mongoose": "^6.13.8",
    "next-auth": "^4.24.11"
}
```

### External Service SDKs

```json
{
    "aws-sdk": "^2.1646.0",
    "stripe": "^16.0.0",
    "razorpay": "^2.9.4",
    "twilio": "^5.2.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "axios": "^1.2.1",
    "crypto": "^1.0.1"
}
```

### Development Dependencies

```json
{
    "eslint": "8.29.0",
    "eslint-config-next": "13.0.6",
    "husky": "^8.0.2",
    "tailwindcss": "^3.2.4",
    "prettier": "^2.8.1"
}
```

## Environment Variables

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

#### Database Configuration

```bash
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/wheeliyo
# or for production
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/wheeliyo
```

#### AWS S3 Configuration

```bash
# AWS S3 Settings
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=us-east-1
```

#### Email Configuration

```bash
# Nodemailer Settings
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

#### Payment Gateway Configuration

```bash
# PhonePe Settings (Primary Indian Payment Gateway)
PHONEPAY_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_INDEX=your_phonepe_salt_index
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_STATUS_CHECK_URL=https://apps-uat.phonepe.com/v3/transaction

# Stripe Settings
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Razorpay Settings
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

#### SMS Service Configuration

```bash
# Twilio Settings
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

#### Authentication Configuration

```bash
# NextAuth.js Settings
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

#### Application Configuration

```bash
# App Settings
NODE_ENV=development
PORT=8010
```

### Optional Environment Variables

```bash
# Additional configurations
JWT_SECRET=your_jwt_secret_key
CRYPTO_SECRET=your_crypto_secret
IFSC_API_KEY=your_ifsc_api_key
```

## Installation & Setup

### Prerequisites

-   Node.js 18+
-   Yarn or npm
-   MongoDB (local or cloud)
-   Docker (optional)

### Local Development Setup

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd wheeliyo
    ```

2. **Install dependencies**

    ```bash
    yarn install
    # or
    npm install
    ```

3. **Set up environment variables**

    ```bash
    cp .env.example .env.local
    # Edit .env.local with your configuration
    ```

4. **Configure PhonePe (Required for Indian payments)**

    ```bash
    # PhonePe Configuration
    PHONEPAY_MERCHANT_ID=your_merchant_id_from_phonepe
    PHONEPE_SALT_INDEX=your_salt_index
    PHONEPE_SALT_KEY=your_salt_key
    PHONEPE_STATUS_CHECK_URL=https://apps-uat.phonepe.com/v3/transaction
    ```

5. **Start development server**
    ```bash
    yarn dev
    # or
    npm run dev
    ```

### Docker Setup

1. **Build and run with Docker Compose**

    ```bash
    docker-compose up --build
    ```

2. **Or build manually**
    ```bash
    docker build -t wheeliyo .
    docker run -p 8010:8010 wheeliyo
    ```

## Database Configuration

### MongoDB Connection

The application uses Mongoose for MongoDB connectivity with the following configuration:

```javascript
// core/config/db.config.js
const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
```

### Database Models

Located in `core/models/` directory:

-   User models
-   Business logic models
-   Data relationship models

## External Services

### AWS S3 Integration

-   File upload and storage
-   Image compression and optimization
-   Bucket management

### Payment Processing

#### PhonePe Integration (Primary Indian Payment Gateway)

-   **Payment Creation**: `/api/phonepe/checkout` endpoint
-   **Status Checking**: Real-time payment status verification
-   **Webhook Handling**: Automatic payment confirmation
-   **Subscription Management**: Automatic subscription activation
-   **Invoice Generation**: PhonePe transaction ID integration
-   **Payment Queue**: Prevents duplicate payment processing
-   **Security**: SHA256 checksum verification with salt keys

#### Stripe Integration

-   **International Payments**: Credit card processing
-   **Webhook Support**: Payment confirmation handling

#### Razorpay Integration

-   **Indian Payments**: Alternative payment gateway
-   **Multiple Payment Methods**: UPI, cards, net banking

### Communication Services

-   **Nodemailer**: Email notifications
-   **Twilio**: SMS services
-   OTP generation and verification

## API Endpoints

### Authentication Routes

-   `/api/auth/signin` - User sign in
-   `/api/auth/signup` - User registration
-   `/api/auth/signout` - User sign out

### User Management

-   `/api/users/profile` - User profile management
-   `/api/users/update` - Profile updates

### File Management

-   `/api/upload` - File upload to S3
-   `/api/files` - File management

### Payment Routes

-   `/api/phonepe/checkout` - PhonePe payment checkout
-   `/api/phonepe/status` - PhonePe payment status check
-   `/api/phonepe/webhook` - PhonePe webhook handling
-   `/api/phonepe/create-payment` - PhonePe payment creation
-   `/api/payments/stripe` - Stripe payment processing
-   `/api/payments/razorpay` - Razorpay payment processing

## Development Guidelines

### Code Structure

```
core/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Database models
├── middleware/      # Custom middleware
├── validations/     # Input validation
├── utils/           # Utility functions
├── constants/       # Application constants
├── config/          # Configuration files
└── helpers/         # Helper functions
```

### Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn prettier     # Format code with Prettier
```

### Git Hooks

-   **Husky**: Pre-commit hooks for code quality
-   **Commitlint**: Conventional commit message validation

### Code Quality

-   **ESLint**: JavaScript/TypeScript linting
-   **Prettier**: Code formatting
-   **Husky**: Git hooks for quality assurance

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

    - Verify `MONGODB_URL` in environment variables
    - Check MongoDB service status
    - Ensure network connectivity

2. **AWS S3 Upload Failures**

    - Verify AWS credentials
    - Check bucket permissions
    - Ensure bucket exists in specified region

3. **PhonePe Payment Issues**

    - Verify `PHONEPAY_MERCHANT_ID` is correct
    - Check `PHONEPE_SALT_INDEX` and `PHONEPE_SALT_KEY` values
    - Ensure `PHONEPE_STATUS_CHECK_URL` is accessible
    - Verify checksum generation for status checks
    - Check payment queue for duplicate transactions

4. **Payment Gateway Issues**
    - **PhonePe**: Verify merchant ID, salt keys, and status check URLs
    - **Stripe**: Verify API keys and webhook configurations
    - **Razorpay**: Verify API keys and webhook configurations
    - Ensure proper error handling for all payment gateways

### Logs and Debugging

-   Check console logs for detailed error messages
-   Verify environment variable loading
-   Test individual service connections

## Security Considerations

-   Store sensitive data in environment variables
-   Use HTTPS in production
-   Implement proper authentication and authorization
-   Validate all user inputs
-   Use secure session management
-   Regular security updates for dependencies

## Performance Optimization

-   Database connection pooling
-   Image compression for uploads
-   Caching strategies
-   Lazy loading for components
-   Optimized build process

## Deployment

### Production Environment

-   Set `NODE_ENV=production`
-   Use production MongoDB instance
-   Configure production AWS S3 bucket
-   Set up proper SSL certificates
-   Configure production payment gateway keys (PhonePe, Stripe, Razorpay)

### Monitoring

-   Application performance monitoring
-   Error tracking and logging
-   Database performance metrics
-   API response time monitoring

---

**Last Updated**: December 2024  
**Version**: 0.1.0  
**Maintainer**: Development Team
