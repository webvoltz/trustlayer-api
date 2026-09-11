import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { env } from '../../../config/env.js';
import type { StorageAdapter, UploadableFile, UploadedObject } from './storage.adapter.js';

/** Stores uploads in an S3-compatible bucket via the AWS SDK v3 modular client. */
export class S3StorageAdapter implements StorageAdapter {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    if (!env.S3_BUCKET || !env.S3_REGION || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new Error(
        'S3 storage requires S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY',
      );
    }

    this.bucket = env.S3_BUCKET;
    this.region = env.S3_REGION;
    this.client = new S3Client({
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(file: UploadableFile): Promise<UploadedObject> {
    const extension = path.extname(file.originalName);
    const key = `${randomUUID()}${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
      }),
    );

    return {
      key,
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      size: file.buffer.length,
      mimeType: file.mimeType,
    };
  }
}
