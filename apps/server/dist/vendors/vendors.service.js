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
var VendorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorsService = exports.VendorStatus = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["PENDING"] = "PENDING";
    VendorStatus["APPROVED"] = "APPROVED";
    VendorStatus["REJECTED"] = "REJECTED";
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
let VendorsService = VendorsService_1 = class VendorsService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(VendorsService_1.name);
    }
    async findAll(status) {
        const where = status ? { status: status } : {};
        const vendors = await this.prisma.vendorProfile.findMany({
            where,
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        return vendors.map(v => this.mapToInterface(v));
    }
    async findOne(id) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { id },
            include: { user: true },
        });
        return vendor ? this.mapToInterface(vendor) : null;
    }
    async findByUserId(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            include: { user: true },
        });
        return vendor ? this.mapToInterface(vendor) : null;
    }
    async create(userId, data) {
        const vendor = await this.prisma.vendorProfile.create({
            data: {
                userId,
                businessName: data.businessName || '',
                contactEmail: data.email || '',
                contactPhone: data.phone,
                address: data.address,
                postalCode: data.postalCode,
                status: 'PENDING',
            },
            include: { user: true },
        });
        return this.mapToInterface(vendor);
    }
    async updateProfile(id, userId, userRole, data) {
        const vendor = await this.findOne(id);
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        if (vendor.userId !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You can only update your own profile');
        }
        const updated = await this.prisma.vendorProfile.update({
            where: { id },
            data: {
                businessName: data.businessName,
                contactEmail: data.email,
                contactPhone: data.phone,
                address: data.address,
                postalCode: data.postalCode,
            },
            include: { user: true },
        });
        return this.mapToInterface(updated);
    }
    async updateStatus(id, status) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor ${id} not found`);
        }
        const updated = await this.prisma.vendorProfile.update({
            where: { id },
            data: { status: status },
            include: { user: true },
        });
        if (vendor.user.email && vendor.user.firstName) {
            try {
                if (status === VendorStatus.APPROVED) {
                    await this.emailService.sendVendorApprovalEmail(vendor.user.email, {
                        firstName: vendor.user.firstName || '',
                        businessName: vendor.businessName,
                    });
                }
                else if (status === VendorStatus.REJECTED) {
                    await this.emailService.sendVendorRejectionEmail(vendor.user.email, vendor.user.firstName || '', vendor.businessName);
                }
            }
            catch (error) {
                this.logger.error(`Failed to send vendor status email: ${error.message}`);
            }
        }
        return this.mapToInterface(updated);
    }
    async delete(id) {
        await this.prisma.vendorProfile.delete({
            where: { id },
        });
    }
    mapToInterface(vendor) {
        return {
            id: vendor.id,
            userId: vendor.userId,
            businessName: vendor.businessName,
            email: vendor.contactEmail,
            phone: vendor.contactPhone,
            address: vendor.address,
            postalCode: vendor.postalCode,
            status: vendor.status,
            registrationDate: vendor.registrationDate || vendor.createdAt,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt,
        };
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = VendorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map