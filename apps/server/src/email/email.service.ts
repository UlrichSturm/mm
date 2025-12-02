import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

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

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
  }

  /**
   * Send a generic email using a template
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: {
          ...options.context,
          appUrl: this.appUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
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
