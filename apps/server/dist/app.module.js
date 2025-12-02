"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const lawyer_notary_module_1 = require("./lawyer-notary/lawyer-notary.module");
const auth_module_1 = require("./auth/auth.module");
const vendors_module_1 = require("./vendors/vendors.module");
const prisma_module_1 = require("./prisma/prisma.module");
const health_module_1 = require("./health/health.module");
const stripe_module_1 = require("./stripe/stripe.module");
const email_module_1 = require("./email/email.module");
const storage_module_1 = require("./storage/storage.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const services_module_1 = require("./services/services.module");
const categories_module_1 = require("./categories/categories.module");
const admin_module_1 = require("./admin/admin.module");
const wills_controller_1 = require("./wills/wills.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60000,
                    limit: 100,
                },
                {
                    name: 'strict',
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            prisma_module_1.PrismaModule,
            stripe_module_1.StripeModule,
            email_module_1.EmailModule,
            storage_module_1.StorageModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            vendors_module_1.VendorsModule,
            lawyer_notary_module_1.LawyerNotaryModule,
            categories_module_1.CategoriesModule,
            services_module_1.ServicesModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
        ],
        controllers: [wills_controller_1.WillsController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map