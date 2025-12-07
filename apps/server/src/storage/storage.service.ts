import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

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

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
    this.bucket = this.configService.get('S3_BUCKET', 'memento-mori');
    this.publicUrl = this.configService.get('S3_PUBLIC_URL', this.endpoint);

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.configService.get('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.configService.get('S3_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.logger.log(`Storage initialized with endpoint: ${this.endpoint}`);
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    options: UploadFileOptions = {},
  ): Promise<UploadResult> {
    const { folder = 'uploads', contentType, isPublic = false, metadata } = options;

    // Generate unique key
    const extension = filename.split('.').pop() || '';
    const uniqueFilename = `${uuid()}${extension ? '.' + extension : ''}`;
    const key = `${folder}/${uniqueFilename}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file,
          ContentType: contentType || this.getContentType(filename),
          ACL: isPublic ? 'public-read' : 'private',
          Metadata: metadata,
        }),
      );

      this.logger.log(`File uploaded: ${key}`);

      return {
        key,
        url: isPublic ? this.getPublicUrl(key) : await this.getSignedUrl(key),
        bucket: this.bucket,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Upload a base64 encoded file
   */
  async uploadBase64(
    base64Data: string,
    filename: string,
    options: UploadFileOptions = {},
  ): Promise<UploadResult> {
    // Remove data URL prefix if present
    const base64Clean = base64Data.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    return this.uploadFile(buffer, filename, options);
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a signed URL for temporary access to a private file
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${this.bucket}/${key}`;
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string, maxKeys = 100): Promise<string[]> {
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: folder,
          MaxKeys: maxKeys,
        }),
      );

      return (response.Contents || []).map(item => item.Key || '').filter(Boolean);
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`);
      return [];
    }
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Other
      json: 'application/json',
      txt: 'text/plain',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
}
