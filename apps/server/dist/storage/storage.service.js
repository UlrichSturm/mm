"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
        this.bucket = this.configService.get('S3_BUCKET', 'memento-mori');
        this.publicUrl = this.configService.get('S3_PUBLIC_URL', this.endpoint);
        this.s3Client = new client_s3_1.S3Client({
            endpoint: this.endpoint,
            region: this.configService.get('S3_REGION', 'us-east-1'),
            credentials: {
                accessKeyId: this.configService.get('S3_ACCESS_KEY', 'minioadmin'),
                secretAccessKey: this.configService.get('S3_SECRET_KEY', 'minioadmin'),
            },
            forcePathStyle: true,
        });
        this.logger.log(`Storage initialized with endpoint: ${this.endpoint}`);
    }
    async uploadFile(file, filename, options = {}) {
        const { folder = 'uploads', contentType, isPublic = false, metadata } = options;
        const extension = filename.split('.').pop() || '';
        const uniqueFilename = `${(0, uuid_1.v4)()}${extension ? '.' + extension : ''}`;
        const key = `${folder}/${uniqueFilename}`;
        try {
            await this.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file,
                ContentType: contentType || this.getContentType(filename),
                ACL: isPublic ? 'public-read' : 'private',
                Metadata: metadata,
            }));
            this.logger.log(`File uploaded: ${key}`);
            return {
                key,
                url: isPublic ? this.getPublicUrl(key) : await this.getSignedUrl(key),
                bucket: this.bucket,
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`);
            throw new common_1.BadRequestException('Failed to upload file');
        }
    }
    async uploadBase64(base64Data, filename, options = {}) {
        const base64Clean = base64Data.replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(base64Clean, 'base64');
        return this.uploadFile(buffer, filename, options);
    }
    async deleteFile(key) {
        try {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            this.logger.log(`File deleted: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`);
            throw new common_1.BadRequestException('Failed to delete file');
        }
    }
    async fileExists(key) {
        try {
            await this.s3Client.send(new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            return true;
        }
        catch {
            return false;
        }
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    getPublicUrl(key) {
        return `${this.publicUrl}/${this.bucket}/${key}`;
    }
    async listFiles(folder, maxKeys = 100) {
        try {
            const response = await this.s3Client.send(new client_s3_1.ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: folder,
                MaxKeys: maxKeys,
            }));
            return (response.Contents || []).map(item => item.Key || '').filter(Boolean);
        }
        catch (error) {
            this.logger.error(`Failed to list files: ${error.message}`);
            return [];
        }
    }
    getContentType(filename) {
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        const mimeTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            json: 'application/json',
            txt: 'text/plain',
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map