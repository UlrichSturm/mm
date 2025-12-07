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
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CategoriesService_1.name);
    }
    async create(dto) {
        this.logger.log(`Creating category: ${dto.name}`);
        const existing = await this.prisma.category.findFirst({
            where: {
                OR: [{ name: dto.name }, { slug: dto.slug }],
            },
        });
        if (existing) {
            throw new common_1.ConflictException(existing.name === dto.name
                ? 'Category with this name already exists'
                : 'Category with this slug already exists');
        }
        const category = await this.prisma.category.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                icon: dto.icon,
                sortOrder: dto.sortOrder || 0,
                isActive: dto.isActive ?? true,
            },
            include: {
                _count: {
                    select: { services: true },
                },
            },
        });
        this.logger.log(`Category ${category.id} created`);
        return this.formatCategoryResponse(category);
    }
    async findAll(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        const categories = await this.prisma.category.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: { services: true },
                },
            },
        });
        return {
            data: categories.map(category => this.formatCategoryResponse(category)),
            total: categories.length,
        };
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { services: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category ${id} not found`);
        }
        return this.formatCategoryResponse(category);
    }
    async findBySlug(slug) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { services: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with slug "${slug}" not found`);
        }
        return this.formatCategoryResponse(category);
    }
    async update(id, dto) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category ${id} not found`);
        }
        if (dto.name || dto.slug) {
            const existing = await this.prisma.category.findFirst({
                where: {
                    id: { not: id },
                    OR: [dto.name ? { name: dto.name } : {}, dto.slug ? { slug: dto.slug } : {}].filter(obj => Object.keys(obj).length > 0),
                },
            });
            if (existing) {
                if (dto.name && existing.name === dto.name) {
                    throw new common_1.ConflictException('Category with this name already exists');
                }
                if (dto.slug && existing.slug === dto.slug) {
                    throw new common_1.ConflictException('Category with this slug already exists');
                }
            }
        }
        const updated = await this.prisma.category.update({
            where: { id },
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                icon: dto.icon,
                sortOrder: dto.sortOrder,
                isActive: dto.isActive,
            },
            include: {
                _count: {
                    select: { services: true },
                },
            },
        });
        this.logger.log(`Category ${id} updated`);
        return this.formatCategoryResponse(updated);
    }
    async delete(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { services: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category ${id} not found`);
        }
        if (category._count.services > 0) {
            throw new common_1.BadRequestException(`Cannot delete category with ${category._count.services} associated services. ` +
                'Please reassign or delete the services first.');
        }
        await this.prisma.category.delete({
            where: { id },
        });
        this.logger.log(`Category ${id} deleted`);
        return { message: 'Category deleted successfully' };
    }
    formatCategoryResponse(category) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            servicesCount: category._count?.services || 0,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map