"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const categories_service_1 = require("./categories.service");
const prisma_service_1 = require("../prisma/prisma.service");
describe('CategoriesService', () => {
    let service;
    let prismaService;
    const mockPrismaService = {
        category: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                categories_service_1.CategoriesService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(categories_service_1.CategoriesService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('should create category successfully', async () => {
            const dto = {
                name: 'Test Category',
                slug: 'test-category',
                description: 'Test description',
                isActive: true,
            };
            const mockCategory = {
                id: 'category-id',
                ...dto,
                icon: null,
                sortOrder: 0,
                _count: { services: 0 },
            };
            mockPrismaService.category.findFirst.mockResolvedValue(null);
            mockPrismaService.category.create.mockResolvedValue(mockCategory);
            const result = await service.create(dto);
            expect(result).toBeDefined();
            expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [{ name: dto.name }, { slug: dto.slug }],
                },
            });
            expect(mockPrismaService.category.create).toHaveBeenCalled();
        });
        it('should throw ConflictException when category name already exists', async () => {
            const dto = {
                name: 'Existing Category',
                slug: 'existing-category',
            };
            const existingCategory = {
                id: 'existing-id',
                name: 'Existing Category',
                slug: 'different-slug',
            };
            mockPrismaService.category.findFirst.mockResolvedValue(existingCategory);
            await expect(service.create(dto)).rejects.toThrow(common_1.ConflictException);
            expect(mockPrismaService.category.findFirst).toHaveBeenCalled();
        });
        it('should throw ConflictException when category slug already exists', async () => {
            const dto = {
                name: 'New Category',
                slug: 'existing-slug',
            };
            const existingCategory = {
                id: 'existing-id',
                name: 'Different Name',
                slug: 'existing-slug',
            };
            mockPrismaService.category.findFirst.mockResolvedValue(existingCategory);
            await expect(service.create(dto)).rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('findAll', () => {
        it('should return all active categories by default', async () => {
            const mockCategories = [
                {
                    id: 'cat-1',
                    name: 'Category 1',
                    slug: 'category-1',
                    isActive: true,
                    _count: { services: 5 },
                },
                {
                    id: 'cat-2',
                    name: 'Category 2',
                    slug: 'category-2',
                    isActive: true,
                    _count: { services: 3 },
                },
            ];
            mockPrismaService.category.findMany.mockResolvedValue(mockCategories);
            const result = await service.findAll();
            expect(result).toBeDefined();
            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                include: {
                    _count: {
                        select: { services: true },
                    },
                },
            });
        });
        it('should return all categories including inactive when includeInactive is true', async () => {
            const mockCategories = [
                {
                    id: 'cat-1',
                    name: 'Active Category',
                    isActive: true,
                    _count: { services: 5 },
                },
                {
                    id: 'cat-2',
                    name: 'Inactive Category',
                    isActive: false,
                    _count: { services: 0 },
                },
            ];
            mockPrismaService.category.findMany.mockResolvedValue(mockCategories);
            const result = await service.findAll(true);
            expect(result).toBeDefined();
            expect(result.data).toHaveLength(2);
            expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                include: {
                    _count: {
                        select: { services: true },
                    },
                },
            });
        });
    });
    describe('findOne', () => {
        it('should return category by id', async () => {
            const categoryId = 'category-id';
            const mockCategory = {
                id: categoryId,
                name: 'Test Category',
                slug: 'test-category',
                isActive: true,
                _count: { services: 5 },
            };
            mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
            const result = await service.findOne(categoryId);
            expect(result).toBeDefined();
            expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
                where: { id: categoryId },
                include: {
                    _count: {
                        select: { services: true },
                    },
                },
            });
        });
        it('should throw NotFoundException when category not found', async () => {
            const categoryId = 'non-existent-category';
            mockPrismaService.category.findUnique.mockResolvedValue(null);
            await expect(service.findOne(categoryId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('should update category successfully', async () => {
            const categoryId = 'category-id';
            const dto = {
                name: 'Updated Category',
                description: 'Updated description',
            };
            const existingCategory = {
                id: categoryId,
                name: 'Old Category',
                slug: 'old-category',
            };
            const updatedCategory = {
                ...existingCategory,
                ...dto,
                _count: { services: 0 },
            };
            mockPrismaService.category.findUnique.mockResolvedValue(existingCategory);
            mockPrismaService.category.update.mockResolvedValue(updatedCategory);
            const result = await service.update(categoryId, dto);
            expect(result).toBeDefined();
            expect(mockPrismaService.category.update).toHaveBeenCalledWith({
                where: { id: categoryId },
                data: dto,
                include: {
                    _count: {
                        select: { services: true },
                    },
                },
            });
        });
        it('should throw NotFoundException when category not found', async () => {
            const categoryId = 'non-existent-category';
            const dto = {
                name: 'Updated Category',
            };
            mockPrismaService.category.findUnique.mockResolvedValue(null);
            await expect(service.update(categoryId, dto)).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=categories.service.spec.js.map