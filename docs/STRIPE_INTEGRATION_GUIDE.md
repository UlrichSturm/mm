# Stripe Integration Guide - Third Party Payment Setup

This guide explains how to integrate Stripe as a third-party payment provider for Memento Mori platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Stripe Account](#step-1-create-stripe-account)
4. [Step 2: Get API Keys](#step-2-get-api-keys)
5. [Step 3: Configure Backend](#step-3-configure-backend)
6. [Step 4: Configure Frontend](#step-4-configure-frontend)
7. [Step 5: Set Up Webhooks](#step-5-set-up-webhooks)
8. [Step 6: Test Integration](#step-6-test-integration)
9. [Step 7: Production Setup](#step-7-production-setup)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Stripe is used for:

- **Payment processing** - Accepting payments from clients
- **Payment intents** - Secure payment handling with Stripe Elements
- **Webhooks** - Real-time payment status updates
- **Stripe Connect** - Vendor payouts (future feature)

### Architecture

```
Client App (Frontend)
    ↓
    Uses Stripe Elements (Stripe.js)
    ↓
Backend API
    ↓
    Creates Payment Intent
    ↓
Stripe API
    ↓
    Processes Payment
    ↓
Webhook → Backend
    ↓
    Updates Order Status
```

---

## Prerequisites

- Stripe account (test or live)
- Backend server running (NestJS)
- Frontend app running (Next.js)
- Stripe CLI (for local webhook testing)

---

## Step 1: Create Stripe Account

### 1.1 Sign Up

1. Go to https://stripe.com
2. Click "Sign up"
3. Fill in your business information
4. Verify your email

### 1.2 Complete Business Profile

1. Go to **Settings** → **Business settings**
2. Fill in:
   - Business type
   - Business name
   - Tax ID (if applicable)
   - Business address
   - Bank account (for payouts)

### 1.3 Activate Account

- For **test mode**: Account is active immediately
- For **live mode**: Complete verification process

---

## Step 2: Get API Keys

### 2.1 Access API Keys

1. Go to https://dashboard.stripe.com/test/apikeys (test mode)
2. Or https://dashboard.stripe.com/apikeys (live mode)

### 2.2 Get Keys

You'll need:

- **Publishable key** (`pk_test_...` or `pk_live_...`)
  - Used in frontend (safe to expose)
  - Starts with `pk_`

- **Secret key** (`sk_test_...` or `sk_live_...`)
  - Used in backend (keep secret!)
  - Starts with `sk_`

### 2.3 Copy Keys

**⚠️ Important:** Never commit secret keys to Git!

Copy both keys - you'll need them in the next steps.

---

## Step 3: Configure Backend

### 3.1 Install Dependencies

Backend already has Stripe installed. Verify:

```bash
cd apps/server
npm list stripe
```

If not installed:

```bash
npm install stripe
```

### 3.2 Set Environment Variables

Create or update `apps/server/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

**Note:** `STRIPE_WEBHOOK_SECRET` will be obtained in Step 5.

### 3.3 Verify Backend Configuration

Check `apps/server/src/stripe/stripe.service.ts`:

```typescript
// Should read from environment:
this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY'));
```

### 3.4 Test Backend Connection

```bash
# Start backend
cd apps/server
npm run start:dev

# Check logs - should not show Stripe errors
```

---

## Step 4: Configure Frontend

### 4.1 Install Dependencies

Frontend already has Stripe installed. Verify:

```bash
cd apps/client
npm list @stripe/stripe-js @stripe/react-stripe-js
```

If not installed:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 4.2 Set Environment Variables

Create or update `apps/client/.env.local`:

```env
# Stripe Publishable Key (safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4.3 Verify Frontend Configuration

Check `apps/client/src/app/checkout/payment/page.tsx`:

```typescript
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
```

### 4.4 Restart Frontend

```bash
cd apps/client
npm run dev
```

---

## Step 5: Set Up Webhooks

Webhooks allow Stripe to notify your backend about payment events.

### 5.1 Local Development (Stripe CLI)

#### Install Stripe CLI

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**

```bash
# Download from https://github.com/stripe/stripe-cli/releases
```

**Windows:**

```bash
# Download from https://github.com/stripe/stripe-cli/releases
```

#### Login to Stripe

```bash
stripe login
```

This will open a browser to authenticate.

#### Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3001/api/payments/webhook
```

**Output:**

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy the webhook secret** and add to `apps/server/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### Test Webhook Events

In another terminal, trigger a test event:

```bash
stripe trigger payment_intent.succeeded
```

Check your backend logs - you should see webhook processing.

### 5.2 Production (Stripe Dashboard)

#### Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://api.mementomori.de/api/payments/webhook
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Click **"Add endpoint"**

#### Get Webhook Secret

1. Click on the created endpoint
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to production environment variables

---

## Step 6: Test Integration

### 6.1 Test Payment Flow

1. **Start services:**

   ```bash
   # Terminal 1: Backend
   cd apps/server && npm run start:dev

   # Terminal 2: Frontend
   cd apps/client && npm run dev

   # Terminal 3: Stripe CLI (for webhooks)
   stripe listen --forward-to localhost:3001/api/payments/webhook
   ```

2. **Create a test order:**
   - Navigate to http://localhost:3000
   - Add services to cart
   - Create order
   - Go to checkout

3. **Test payment:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

4. **Verify:**
   - Payment should succeed
   - Order status should update
   - Webhook should be received

### 6.2 Test Cards

| Card Type        | Number                | Use Case                |
| ---------------- | --------------------- | ----------------------- |
| ✅ Success       | `4242 4242 4242 4242` | Successful payment      |
| ❌ Decline       | `4000 0000 0000 0002` | Card declined           |
| 🔐 3D Secure     | `4000 0025 0000 3155` | Requires authentication |
| 💰 Insufficient  | `4000 0000 0000 9995` | Insufficient funds      |
| 🔒 Requires Auth | `4000 0027 6000 3184` | Requires authentication |

### 6.3 Verify Backend Logs

Check backend console for:

- ✅ Payment intent created
- ✅ Webhook received
- ✅ Payment status updated

### 6.4 Verify Frontend

Check browser console for:

- ✅ Stripe Elements loaded
- ✅ Payment form rendered
- ✅ Payment successful redirect

---

## Step 7: Production Setup

### 7.1 Switch to Live Mode

1. Go to https://dashboard.stripe.com
2. Toggle **"Test mode"** to **OFF**

### 7.2 Get Live Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Live publishable key** (`pk_live_...`)
3. Copy **Live secret key** (`sk_live_...`)

### 7.3 Update Environment Variables

**Backend (Production):**

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

**Frontend (Production):**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
```

### 7.4 Set Up Production Webhook

Follow Step 5.2 with your production URL.

### 7.5 Test Production

1. Use real card (small amount)
2. Verify payment processes
3. Check webhook delivery
4. Verify order status updates

---

## Troubleshooting

### Issue: "Stripe is not initialized"

**Cause:** Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Solution:**

1. Check `.env.local` file exists
2. Verify key starts with `pk_test_` or `pk_live_`
3. Restart Next.js dev server

### Issue: "Payment intent creation failed"

**Cause:** Invalid `STRIPE_SECRET_KEY` or network issue

**Solution:**

1. Verify secret key in backend `.env`
2. Check backend logs for Stripe errors
3. Verify Stripe account is active

### Issue: "Webhook not received"

**Cause:** Webhook endpoint not configured or secret mismatch

**Solution:**

1. Verify webhook URL is correct
2. Check `STRIPE_WEBHOOK_SECRET` matches
3. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3001/api/payments/webhook
   ```

### Issue: "Payment succeeded but order not updated"

**Cause:** Webhook handler not processing correctly

**Solution:**

1. Check backend logs for webhook processing
2. Verify webhook handler in `payments.controller.ts`
3. Test webhook manually:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### Issue: "CORS errors"

**Cause:** Frontend URL not in CORS whitelist

**Solution:**

1. Update backend CORS configuration
2. Add frontend URL to allowed origins

---

## Security Best Practices

### ✅ Do:

- ✅ Use environment variables for all keys
- ✅ Never commit keys to Git
- ✅ Use test keys for development
- ✅ Verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Log payment events (without sensitive data)

### ❌ Don't:

- ❌ Hardcode API keys
- ❌ Commit `.env` files
- ❌ Expose secret keys in frontend
- ❌ Skip webhook signature verification
- ❌ Use live keys in development
- ❌ Log full card numbers

---

## API Endpoints

### Backend Endpoints

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/api/payments/intent`  | Create payment intent  |
| POST   | `/api/payments/webhook` | Stripe webhook handler |
| GET    | `/api/payments/my`      | Get user's payments    |
| GET    | `/api/payments/:id`     | Get payment details    |

### Frontend Pages

| Route                           | Description                       |
| ------------------------------- | --------------------------------- |
| `/checkout/payment?orderId=...` | Payment page with Stripe Elements |
| `/payments/success?orderId=...` | Payment success page              |

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Elements Guide](https://stripe.com/docs/stripe-js)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Test Cards](https://stripe.com/docs/testing)

---

## Support

If you encounter issues:

1. Check Stripe Dashboard → **Logs** for errors
2. Review backend logs for exceptions
3. Check webhook delivery in Stripe Dashboard
4. Verify environment variables are set correctly
5. Test with Stripe CLI for local debugging

---

**Last Updated:** 2025-12-04
