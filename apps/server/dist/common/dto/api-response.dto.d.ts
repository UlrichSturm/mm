export declare class ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}
export declare class ValidationErrorDetail {
    field: string;
    message: string;
}
export declare class ApiErrorInfo {
    code: string;
    message: string;
    details?: ValidationErrorDetail[];
}
export declare class ApiErrorResponse {
    success: false;
    error: ApiErrorInfo;
    timestamp: string;
    path: string;
}
export declare class MessageResponseDto {
    success: boolean;
    message: string;
}
export declare class IdResponseDto {
    success: boolean;
    id: string;
    message?: string;
}
