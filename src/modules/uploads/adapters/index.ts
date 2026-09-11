import { env } from '../../../config/env.js';
import { LocalStorageAdapter } from './local.adapter.js';
import { S3StorageAdapter } from './s3.adapter.js';
import type { StorageAdapter } from './storage.adapter.js';

export function getStorageAdapter(): StorageAdapter {
  return env.STORAGE_PROVIDER === 's3' ? new S3StorageAdapter() : new LocalStorageAdapter();
}

export type { StorageAdapter, UploadableFile, UploadedObject } from './storage.adapter.js';
