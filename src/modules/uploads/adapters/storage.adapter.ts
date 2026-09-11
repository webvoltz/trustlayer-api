export interface UploadableFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface UploadedObject {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageAdapter {
  upload(file: UploadableFile): Promise<UploadedObject>;
}
