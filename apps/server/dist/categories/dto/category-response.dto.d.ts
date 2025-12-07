export declare class CategoryResponseDto {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    sortOrder: number;
    isActive: boolean;
    servicesCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CategoryListResponseDto {
    data: CategoryResponseDto[];
    total: number;
}
