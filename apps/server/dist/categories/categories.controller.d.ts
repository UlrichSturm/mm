import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto, CategoryListResponseDto } from './dto/category-response.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(includeInactive?: string): Promise<CategoryListResponseDto>;
    findBySlug(slug: string): Promise<CategoryResponseDto>;
    findOne(id: string): Promise<CategoryResponseDto>;
    create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
