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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyerNotaryService = exports.LawyerNotaryStatus = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../common/enums/role.enum");
const prisma_service_1 = require("../prisma/prisma.service");
var LawyerNotaryStatus;
(function (LawyerNotaryStatus) {
    LawyerNotaryStatus["PENDING"] = "PENDING";
    LawyerNotaryStatus["APPROVED"] = "APPROVED";
    LawyerNotaryStatus["REJECTED"] = "REJECTED";
})(LawyerNotaryStatus || (exports.LawyerNotaryStatus = LawyerNotaryStatus = {}));
let LawyerNotaryService = class LawyerNotaryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        const profile = await this.prisma.lawyerNotaryProfile.create({
            data: {
                userId,
                licenseNumber: data.licenseNumber || '',
                licenseType: (data.licenseType || 'LAWYER'),
                organizationName: data.organizationName,
                status: 'PENDING',
                specialization: data.specialization,
                yearsOfExperience: data.yearsOfExperience,
                postalCode: data.postalCode,
                address: data.address,
                homeVisitAvailable: data.homeVisitAvailable || false,
                maxTravelRadius: data.maxTravelRadius,
                rating: data.rating,
            },
        });
        return this.mapToInterface(profile);
    }
    async findAll(status) {
        const where = status ? { status: status } : {};
        const profiles = await this.prisma.lawyerNotaryProfile.findMany({
            where,
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        return profiles.map(p => this.mapToInterface(p));
    }
    async findByUserId(userId) {
        const profile = await this.prisma.lawyerNotaryProfile.findUnique({
            where: { userId },
            include: { user: true },
        });
        return profile ? this.mapToInterface(profile) : null;
    }
    async findOne(id) {
        const profile = await this.prisma.lawyerNotaryProfile.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Lawyer/Notary profile with ID ${id} not found`);
        }
        return this.mapToInterface(profile);
    }
    mapToInterface(profile) {
        return {
            id: profile.id,
            userId: profile.userId,
            licenseNumber: profile.licenseNumber,
            licenseType: profile.licenseType,
            organizationName: profile.organizationName,
            status: profile.status,
            specialization: profile.specialization,
            yearsOfExperience: profile.yearsOfExperience,
            postalCode: profile.postalCode,
            address: profile.address,
            homeVisitAvailable: profile.homeVisitAvailable,
            maxTravelRadius: profile.maxTravelRadius,
            rating: profile.rating,
            name: profile.name,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
    async updateProfile(id, userId, userRole, data) {
        const profile = await this.findOne(id);
        if (profile.userId !== userId && userRole !== role_enum_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own profile');
        }
        const updated = await this.prisma.lawyerNotaryProfile.update({
            where: { id },
            data: {
                licenseNumber: data.licenseNumber,
                licenseType: data.licenseType,
                organizationName: data.organizationName,
                specialization: data.specialization,
                yearsOfExperience: data.yearsOfExperience,
                postalCode: data.postalCode,
                address: data.address,
                homeVisitAvailable: data.homeVisitAvailable,
                maxTravelRadius: data.maxTravelRadius,
                rating: data.rating,
            },
            include: { user: true },
        });
        return this.mapToInterface(updated);
    }
    async updateStatus(id, status) {
        const updated = await this.prisma.lawyerNotaryProfile.update({
            where: { id },
            data: { status: status },
            include: { user: true },
        });
        return this.mapToInterface(updated);
    }
    async delete(id) {
        await this.prisma.lawyerNotaryProfile.delete({
            where: { id },
        });
    }
    async getAvailableLawyers(postalCode) {
        const approvedLawyers = await this.prisma.lawyerNotaryProfile.findMany({
            where: { status: 'APPROVED' },
            include: { user: true },
        });
        const filteredLawyers = approvedLawyers.filter(profile => {
            if (!profile.postalCode) {
                return false;
            }
            if (profile.homeVisitAvailable && profile.maxTravelRadius) {
                return true;
            }
            const userPostalNum = parseInt(postalCode);
            const lawyerPostalNum = parseInt(profile.postalCode);
            if (userPostalNum >= 10115 &&
                userPostalNum <= 14199 &&
                lawyerPostalNum >= 10115 &&
                lawyerPostalNum <= 14199) {
                return true;
            }
            const userPostalStr = postalCode.padStart(5, '0');
            const lawyerPostalStr = profile.postalCode.padStart(5, '0');
            if (userPostalStr.startsWith('01') && lawyerPostalStr.startsWith('01')) {
                return true;
            }
            return profile.homeVisitAvailable === true;
        });
        return filteredLawyers.map((profile) => {
            let licenseType = 'lawyer';
            if (profile.licenseType === 'NOTARY') {
                licenseType = 'notary';
            }
            else if (profile.licenseType === 'BOTH') {
                licenseType = 'both';
            }
            return {
                id: profile.id,
                name: profile.name || profile.organizationName || 'Lawyer',
                rating: profile.rating || 4.5,
                licenseType,
                postalCode: profile.postalCode,
                address: profile.address || 'Address not provided',
                homeVisitAvailable: profile.homeVisitAvailable ?? true,
                specialization: profile.specialization,
                maxTravelRadius: profile.maxTravelRadius || 50,
            };
        });
    }
};
exports.LawyerNotaryService = LawyerNotaryService;
exports.LawyerNotaryService = LawyerNotaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LawyerNotaryService);
//# sourceMappingURL=lawyer-notary.service.js.map