export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
}
export declare class PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class PaginatedResponseDto<T> {
    success: boolean;
    data: T[];
    meta: PaginationMeta;
}
export declare function createPaginationMeta(page: number, limit: number, total: number): PaginationMeta;
