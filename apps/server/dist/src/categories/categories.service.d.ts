export interface Category {
    id: string;
    name: string;
    slug: string;
}
export declare class CategoriesService {
    findAll(): Category[];
}
