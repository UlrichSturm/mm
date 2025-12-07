import { ConfigService } from '@nestjs/config';
export interface UploadFileOptions {
    folder?: string;
    contentType?: string;
    isPublic?: boolean;
    metadata?: Record<string, string>;
}
export interface UploadResult {
    key: string;
    url: string;
    bucket: string;
}
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly endpoint;
    private readonly publicUrl;
    constructor(configService: ConfigService);
    uploadFile(file: Buffer, filename: string, options?: UploadFileOptions): Promise<UploadResult>;
    uploadBase64(base64Data: string, filename: string, options?: UploadFileOptions): Promise<UploadResult>;
    deleteFile(key: string): Promise<void>;
    fileExists(key: string): Promise<boolean>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    getPublicUrl(key: string): string;
    listFiles(folder: string, maxKeys?: number): Promise<string[]>;
    private getContentType;
}
