import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category (admin only)
   */
  async create(dto: CreateCategoryDto) {
    this.logger.log(`Creating category: ${dto.name}`);

    // Check for duplicate name or slug
    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug: dto.slug }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.name === dto.name
          ? 'Category with this name already exists'
          : 'Category with this slug already exists',
      );
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

  /**
   * Get all categories (public - only active, admin - all)
   */
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

  /**
   * Get category by ID
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return this.formatCategoryResponse(category);
  }

  /**
   * Get category by slug (public)
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return this.formatCategoryResponse(category);
  }

  /**
   * Update category (admin only)
   */
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    // Check for duplicates if name or slug is being changed
    if (dto.name || dto.slug) {
      const existing = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          OR: [dto.name ? { name: dto.name } : {}, dto.slug ? { slug: dto.slug } : {}].filter(
            obj => Object.keys(obj).length > 0,
          ),
        },
      });

      if (existing) {
        if (dto.name && existing.name === dto.name) {
          throw new ConflictException('Category with this name already exists');
        }
        if (dto.slug && existing.slug === dto.slug) {
          throw new ConflictException('Category with this slug already exists');
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

  /**
   * Delete category (admin only)
   */
  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    // Check if category has services
    if (category._count.services > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category._count.services} associated services. ` +
          'Please reassign or delete the services first.',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    this.logger.log(`Category ${id} deleted`);
    return { message: 'Category deleted successfully' };
  }

  /**
   * Format category for API response
   */
  private formatCategoryResponse(category: any) {
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
}
