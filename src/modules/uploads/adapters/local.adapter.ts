import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '../../../config/env.js';
import type { StorageAdapter, UploadableFile, UploadedObject } from './storage.adapter.js';

const EXTENSION_BY_MIME_TYPE: Readonly<Record<string, string>> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

/** Stores uploads on local disk. Suitable for development, tests, and single-instance demos. */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly uploadDir: string;

  constructor(uploadDir: string = env.UPLOAD_DIR) {
    this.uploadDir = path.resolve(uploadDir);
  }

  async upload(file: UploadableFile): Promise<UploadedObject> {
    // The stored filename is always a generated UUID; the caller's original name only ever
    // contributes an extension, never a directory path, so this can't be used for traversal.
    const extension = EXTENSION_BY_MIME_TYPE[file.mimeType] ?? path.extname(file.originalName);
    const key = `${randomUUID()}${extension}`;

    await mkdir(this.uploadDir, { recursive: true });
    await writeFile(path.join(this.uploadDir, key), file.buffer);

    return {
      key,
      url: `/uploads/${key}`,
      size: file.buffer.length,
      mimeType: file.mimeType,
    };
  }
}
