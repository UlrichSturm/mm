import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

export interface WelcomeEmailContext {
  firstName: string;
  appUrl: string;
}

export interface OrderConfirmationContext {
  firstName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  totalPrice: string;
  appUrl: string;
}

export interface VendorApprovalContext {
  firstName: string;
  businessName: string;
  dashboardUrl: string;
}

export interface PasswordResetContext {
  firstName: string;
  resetUrl: string;
  expiresIn: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly appUrl: string;
  private readonly mailgunDomain: string;
  private readonly mailgunApiKey: string | undefined;
  private readonly templatesDir: string;
  private readonly mailgunApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    this.mailgunDomain = this.configService.get(
      'MAILGUN_DOMAIN',
      'sandboxe001d498458247eb9510fd6af0bdd3d7.mailgun.org',
    );
    this.mailgunApiKey = this.configService.get('MAILGUN_API_KEY');

    // Mailgun API URL (use EU endpoint if domain is EU)
    const isEuDomain = this.mailgunDomain.includes('.eu.');
    this.mailgunApiUrl = isEuDomain
      ? 'https://api.eu.mailgun.net/v3'
      : 'https://api.mailgun.net/v3';

    if (!this.mailgunApiKey) {
      this.logger.warn('MAILGUN_API_KEY not set, email sending will be disabled');
    }

    // Set templates directory
    this.templatesDir =
      process.env.NODE_ENV === 'production'
        ? path.join(process.cwd(), 'dist', 'email', 'templates')
        : path.join(__dirname, 'templates');
  }

  /**
   * Render Handlebars template to HTML
   */
  private renderTemplate(templateName: string, context: Record<string, unknown>): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template({
      ...context,
      appUrl: this.appUrl,
      year: new Date().getFullYear(),
    });
  }

  /**
   * Send a generic email using a template
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.mailgunApiKey) {
      this.logger.warn(`Email sending disabled: MAILGUN_API_KEY not configured`);
      return;
    }

    try {
      const html = this.renderTemplate(options.template, options.context);

      const from = this.configService.get(
        'EMAIL_FROM',
        `Memento Mori <postmaster@${this.mailgunDomain}>`,
      );

      // Use Mailgun API directly via axios
      const formData = new URLSearchParams();
      formData.append('from', from);
      formData.append('to', options.to);
      formData.append('subject', options.subject);
      formData.append('html', html);

      const apiUrl = `${this.mailgunApiUrl}/${this.mailgunDomain}/messages`;

      this.logger.debug(`Sending email to ${options.to} via Mailgun API`);

      const response = await axios.post(apiUrl, formData, {
        auth: {
          username: 'api',
          password: this.mailgunApiKey,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.logger.log(
        `Email sent to ${options.to}: ${options.subject} (ID: ${response.data.id || 'N/A'})`,
      );
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : (error as Error).message;
      this.logger.error(
        `Failed to send email to ${options.to}: ${errorMessage}`,
        (error as Error).stack,
      );
      // Don't throw - email failures shouldn't break the main flow
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to Memento Mori',
      template: 'welcome',
      context: {
        firstName,
      },
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: string,
    context: Omit<OrderConfirmationContext, 'appUrl'>,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Order Confirmation - ${context.orderNumber}`,
      template: 'order-confirmation',
      context,
    });
  }

  /**
   * Send vendor approval notification
   */
  async sendVendorApprovalEmail(
    to: string,
    context: Omit<VendorApprovalContext, 'dashboardUrl'>,
  ): Promise<void> {
    const dashboardUrl = this.configService.get('VENDOR_PORTAL_URL', 'http://localhost:3002');
    await this.sendEmail({
      to,
      subject: 'Your Vendor Account has been Approved',
      template: 'vendor-approval',
      context: {
        ...context,
        dashboardUrl,
      },
    });
  }

  /**
   * Send vendor rejection notification
   */
  async sendVendorRejectionEmail(
    to: string,
    firstName: string,
    businessName: string,
    reason?: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Update on Your Vendor Application',
      template: 'vendor-rejection',
      context: {
        firstName,
        businessName,
        reason: reason || 'Your application did not meet our requirements at this time.',
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;
    await this.sendEmail({
      to,
      subject: 'Reset Your Password',
      template: 'password-reset',
      context: {
        firstName,
        resetUrl,
        expiresIn: '1 hour',
      },
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    to: string,
    firstName: string,
    orderNumber: string,
    status: string,
    message?: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Order ${orderNumber} - Status Update`,
      template: 'order-status',
      context: {
        firstName,
        orderNumber,
        status,
        message,
      },
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    to: string,
    firstName: string,
    appointmentDate: string,
    appointmentTime: string,
    serviceName: string,
    location?: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Appointment Reminder',
      template: 'appointment-reminder',
      context: {
        firstName,
        appointmentDate,
        appointmentTime,
        serviceName,
        location,
      },
    });
  }
}
