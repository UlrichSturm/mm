"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
        this.mailgunDomain = this.configService.get('MAILGUN_DOMAIN', 'sandboxe001d498458247eb9510fd6af0bdd3d7.mailgun.org');
        this.mailgunApiKey = this.configService.get('MAILGUN_API_KEY');
        const isEuDomain = this.mailgunDomain.includes('.eu.');
        this.mailgunApiUrl = isEuDomain
            ? 'https://api.eu.mailgun.net/v3'
            : 'https://api.mailgun.net/v3';
        if (!this.mailgunApiKey) {
            this.logger.warn('MAILGUN_API_KEY not set, email sending will be disabled');
        }
        this.templatesDir =
            process.env.NODE_ENV === 'production'
                ? path.join(process.cwd(), 'dist', 'email', 'templates')
                : path.join(__dirname, 'templates');
    }
    renderTemplate(templateName, context) {
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
    async sendEmail(options) {
        if (!this.mailgunApiKey) {
            this.logger.warn(`Email sending disabled: MAILGUN_API_KEY not configured`);
            return;
        }
        try {
            const html = this.renderTemplate(options.template, options.context);
            const from = this.configService.get('EMAIL_FROM', `Memento Mori <postmaster@${this.mailgunDomain}>`);
            const formData = new URLSearchParams();
            formData.append('from', from);
            formData.append('to', options.to);
            formData.append('subject', options.subject);
            formData.append('html', html);
            const apiUrl = `${this.mailgunApiUrl}/${this.mailgunDomain}/messages`;
            this.logger.debug(`Sending email to ${options.to} via Mailgun API`);
            const response = await axios_1.default.post(apiUrl, formData, {
                auth: {
                    username: 'api',
                    password: this.mailgunApiKey,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.logger.log(`Email sent to ${options.to}: ${options.subject} (ID: ${response.data.id || 'N/A'})`);
        }
        catch (error) {
            const errorMessage = axios_1.default.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error.message;
            this.logger.error(`Failed to send email to ${options.to}: ${errorMessage}`, error.stack);
        }
    }
    async sendWelcomeEmail(to, firstName) {
        await this.sendEmail({
            to,
            subject: 'Welcome to Memento Mori',
            template: 'welcome',
            context: {
                firstName,
            },
        });
    }
    async sendOrderConfirmation(to, context) {
        await this.sendEmail({
            to,
            subject: `Order Confirmation - ${context.orderNumber}`,
            template: 'order-confirmation',
            context,
        });
    }
    async sendVendorApprovalEmail(to, context) {
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
    async sendVendorRejectionEmail(to, firstName, businessName, reason) {
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
    async sendPasswordResetEmail(to, firstName, resetToken) {
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
    async sendOrderStatusUpdate(to, firstName, orderNumber, status, message) {
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
    async sendAppointmentReminder(to, firstName, appointmentDate, appointmentTime, serviceName, location) {
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map