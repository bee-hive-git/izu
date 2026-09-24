export function publicUrl(path: string): string;
export function sanitizeStoragePath(path: string): string | null;
export function listStorageFolder(folder: string): Promise<string[]>;
export function storagePathFromUrl(url: unknown): string | null;
export function uploadBuffer(
  path: string,
  body: Buffer | Uint8Array | ArrayBuffer | Blob,
  mimeType?: string,
): Promise<string>;
export function uploadProductImageBuffer(
  body: Buffer | Uint8Array | ArrayBuffer | Blob,
  originalName: string,
  mimeType?: string,
): Promise<{ url: string; public_id: string }>;
export function deleteProductImage(publicId: string): Promise<void>;
