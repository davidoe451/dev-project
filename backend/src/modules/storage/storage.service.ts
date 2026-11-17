import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  url: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly s3Client?: S3Client;
  private readonly bucket?: string;
  private readonly publicUrl?: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('R2_BUCKET');
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL');

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'product-images',
  ): Promise<UploadResult> {
    const extension = path.extname(file.originalname).toLowerCase();
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;

    if (this.s3Client && this.bucket && this.publicUrl) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        const url = `${this.publicUrl.replace(/\/$/, '')}/${key}`;
        return { url, key };
      } catch (err) {
        this.logger.warn(
          `R2 upload failed (${String(err)}), falling back to local storage`,
        );
      }
    }

    const uploadDir = path.resolve('public', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localFilePath = path.join(uploadDir, path.basename(key));
    fs.writeFileSync(localFilePath, file.buffer);
    return { url: `/${key}`, key };
  }

  async deleteFile(key: string): Promise<boolean> {
    if (this.s3Client && this.bucket) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          }),
        );
        return true;
      } catch (err) {
        this.logger.warn(`R2 delete failed (${String(err)})`);
      }
    }

    const localPath = path.resolve('public', key);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
        return true;
      } catch {
      }
    }

    return false;
  }
}
