# Epic 8: Mailgun Configuration

**Date:** 2025-12-03
**Status:** ✅ Configured

## Configuration Changes

### 1. Email Module Configuration

Updated `apps/server/src/email/email.module.ts` to use Mailgun SMTP settings:

```typescript
const transport = {
  host: smtpHost, // smtp.mailgun.org
  port: smtpPort, // 587
  secure: false, // Mailgun uses STARTTLS on port 587
  auth:
    smtpUser && smtpPass
      ? {
          user: smtpUser,
          pass: smtpPass,
        }
      : undefined,
};
```

### 2. Docker Compose Configuration

Updated `docker-compose.yml` default SMTP settings:

```yaml
SMTP_HOST: ${SMTP_HOST:-smtp.mailgun.org}
SMTP_PORT: ${SMTP_PORT:-587}
SMTP_SECURE: ${SMTP_SECURE:-false}
SMTP_USER: ${SMTP_USER}
SMTP_PASS: ${SMTP_PASS}
EMAIL_FROM: ${EMAIL_FROM:-Memento Mori <noreply@mementomori.de>}
```

## Mailgun Setup Instructions

### For Development (Sandbox Domain)

1. **Create Mailgun Account**
   - Go to https://mailgun.com
   - Sign up for free account
   - Verify email address

2. **Get Sandbox Domain Credentials**
   - Navigate to **Sending** → **Domain Settings**
   - Use the sandbox domain (e.g., `sandbox1234567890.mailgun.org`)
   - Go to **SMTP credentials** section
   - Copy SMTP username and password

3. **Configure Environment Variables**

Add to your `.env` file:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@sandbox1234567890.mailgun.org
SMTP_PASS=your-actual-smtp-password-here
EMAIL_FROM=Memento Mori <noreply@mementomori.de>
```

**Note:** Sandbox domain can only send to authorized recipients. Add test email addresses in Mailgun dashboard under **Sending** → **Authorized Recipients**.

### For Production (Custom Domain)

1. **Add Custom Domain**
   - In Mailgun dashboard, go to **Sending** → **Domains**
   - Click **Add New Domain**
   - Enter your domain (e.g., `mail.mementomori.de`)

2. **Configure DNS Records**
   - Add DNS records as provided by Mailgun:
     - TXT record for domain verification
     - TXT record for SPF
     - CNAME record for DKIM
     - MX records (optional)

3. **Verify Domain**
   - Wait for DNS propagation
   - Click **Verify DNS Settings** in Mailgun dashboard

4. **Get SMTP Credentials**
   - Go to **Sending** → **Domain Settings** → **SMTP credentials**
   - Copy SMTP username and password

5. **Update Environment Variables**

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mail.mementomori.de
SMTP_PASS=your-production-smtp-password
EMAIL_FROM=Memento Mori <noreply@mementomori.de>
```

## Testing

### Test Email Sending

1. **Set Environment Variables**

   ```bash
   export SMTP_USER=postmaster@sandbox1234567890.mailgun.org
   export SMTP_PASS=your-smtp-password
   ```

2. **Restart Server**

   ```bash
   docker-compose restart server
   ```

3. **Test Registration**

   ```bash
   curl -X POST "http://localhost:3001/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email":"test@example.com",
       "password":"password123",
       "firstName":"Test",
       "lastName":"User"
     }'
   ```

4. **Check Mailgun Dashboard**
   - Go to **Sending** → **Logs**
   - Verify email was sent successfully

## Email Templates

All email templates are located in `apps/server/src/email/templates/`:

- `welcome.hbs` - Welcome email for new users
- `order-confirmation.hbs` - Order confirmation
- `order-status.hbs` - Order status updates
- `vendor-approval.hbs` - Vendor approval notification
- `vendor-rejection.hbs` - Vendor rejection notification
- `password-reset.hbs` - Password reset link
- `appointment-reminder.hbs` - Appointment reminder

## Email Types Integrated

✅ **AuthModule**

- Welcome email (user registration)

✅ **OrdersModule**

- Order confirmation (order creation)
- Order status update (status changes)

✅ **PaymentsModule**

- Payment confirmation (successful payment)
- Payment failed notification
- Refund notification

✅ **VendorsModule**

- Vendor approval email
- Vendor rejection email

✅ **ServicesModule**

- Service status update (moderation)

## Next Steps

1. **Get Mailgun Credentials**
   - Sign up for Mailgun account
   - Get sandbox domain SMTP credentials
   - Add to `.env` file

2. **Test Email Sending**
   - Register a new user
   - Verify welcome email is received
   - Test other email types

3. **Production Setup** (when ready)
   - Add custom domain
   - Configure DNS records
   - Update production environment variables

## Notes

- Mailgun sandbox domain has sending limits (100 emails/day for free tier)
- Sandbox domain can only send to authorized recipients
- For production, use custom domain with proper DNS configuration
- All email sending is non-blocking (errors are logged but don't break the flow)
