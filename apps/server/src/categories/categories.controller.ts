import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Roles, Resource, Public, Unprotected } from 'nest-keycloak-connect';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto, CategoryListResponseDto } from './dto/category-response.dto';

@ApiTags('categories')
@Controller('categories')
@Resource('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get()
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get all categories (public - active only)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories (admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of categories',
    type: CategoryListResponseDto,
  })
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<CategoryListResponseDto> {
    return this.categoriesService.findAll(includeInactive === 'true');
  }

  @Get('slug/:slug')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get category by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get category by ID (public)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Post()
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category (admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Category already exists' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update category (admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Name/slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category (admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete category with associated services',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.delete(id);
  }
}
