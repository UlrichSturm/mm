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
export declare class EmailService {
    private readonly mailerService;
    private readonly configService;
    private readonly logger;
    private readonly appUrl;
    constructor(mailerService: MailerService, configService: ConfigService);
    sendEmail(options: SendEmailOptions): Promise<void>;
    sendWelcomeEmail(to: string, firstName: string): Promise<void>;
    sendOrderConfirmation(to: string, context: Omit<OrderConfirmationContext, 'appUrl'>): Promise<void>;
    sendVendorApprovalEmail(to: string, context: Omit<VendorApprovalContext, 'dashboardUrl'>): Promise<void>;
    sendVendorRejectionEmail(to: string, firstName: string, businessName: string, reason?: string): Promise<void>;
    sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<void>;
    sendOrderStatusUpdate(to: string, firstName: string, orderNumber: string, status: string, message?: string): Promise<void>;
    sendAppointmentReminder(to: string, firstName: string, appointmentDate: string, appointmentTime: string, serviceName: string, location?: string): Promise<void>;
}
