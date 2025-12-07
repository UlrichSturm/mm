import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateCategoryDto): Promise<{
        id: any;
        name: any;
        slug: any;
        description: any;
        icon: any;
        sortOrder: any;
        isActive: any;
        servicesCount: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findAll(includeInactive?: boolean): Promise<{
        data: {
            id: any;
            name: any;
            slug: any;
            description: any;
            icon: any;
            sortOrder: any;
            isActive: any;
            servicesCount: any;
            createdAt: any;
            updatedAt: any;
        }[];
        total: number;
    }>;
    findOne(id: string): Promise<{
        id: any;
        name: any;
        slug: any;
        description: any;
        icon: any;
        sortOrder: any;
        isActive: any;
        servicesCount: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findBySlug(slug: string): Promise<{
        id: any;
        name: any;
        slug: any;
        description: any;
        icon: any;
        sortOrder: any;
        isActive: any;
        servicesCount: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: any;
        name: any;
        slug: any;
        description: any;
        icon: any;
        sortOrder: any;
        isActive: any;
        servicesCount: any;
        createdAt: any;
        updatedAt: any;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    private formatCategoryResponse;
}
