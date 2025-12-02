import { Type } from '@nestjs/common';
export interface ApiEndpointOptions {
    summary: string;
    description?: string;
    tags?: string[];
    auth?: boolean;
    responses?: ApiResponseConfig[];
}
export interface ApiResponseConfig {
    status: number;
    description: string;
    type?: Type<unknown>;
    isArray?: boolean;
}
export declare function ApiEndpoint(options: ApiEndpointOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function ApiPaginatedResponse<TModel extends Type<unknown>>(model: TModel): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function ApiPublicEndpoint(options: Omit<ApiEndpointOptions, 'auth'>): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
