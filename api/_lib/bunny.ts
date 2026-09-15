import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';

const PRODUCT_FOLDER = 'produtos';

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

function storageHost() {
  const explicitHost = process.env.BUNNY_STORAGE_HOST?.trim();
  if (explicitHost) {
    return explicitHost;
  }

  const region = process.env.BUNNY_STORAGE_REGION?.trim().toLowerCase();
  if (!region || region === 'de' || region === 'frankfurt') {
    return 'storage.bunnycdn.com';
  }

  return `${region}.storage.bunnycdn.com`;
}

function storageZone() {
  return requiredEnv('BUNNY_STORAGE_ZONE');
}

function accessKey() {
  return requiredEnv('BUNNY_STORAGE_PASSWORD');
}

function cdnBaseUrl() {
  return requiredEnv('BUNNY_CDN_URL').replace(/\/$/, '');
}

function encodeStoragePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

function storageUrl(path: string) {
  return `https://${storageHost()}/${encodeURIComponent(storageZone())}/${encodeStoragePath(path)}`;
}

export function publicUrl(path: string) {
  return `${cdnBaseUrl()}/${encodeStoragePath(path)}`;
}

export function sanitizeStoragePath(path: string) {
  const normalized = path.replace(/^\/+/, '').replace(/\\/g, '/');
  if (!normalized.startsWith(`${PRODUCT_FOLDER}/`) || normalized.includes('..')) {
    return null;
  }
  return normalized;
}

function fileExtension(fileName: string, mimeType?: string) {
  const fromName = fileName.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }

  const fromMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };

  return (mimeType && fromMime[mimeType]) || 'jpg';
}

export async function uploadProductImage(filePath: string, originalName: string, mimeType?: string) {
  const extension = fileExtension(originalName, mimeType);
  const path = `${PRODUCT_FOLDER}/${randomUUID()}.${extension}`;
  const body = await readFile(filePath);

  const response = await fetch(storageUrl(path), {
    method: 'PUT',
    headers: {
      AccessKey: accessKey(),
      'Content-Type': mimeType || 'application/octet-stream',
    },
    body,
  });

  if (response.status !== 201 && !response.ok) {
    const details = await response.text();
    throw new Error(`Bunny upload failed (${storageZone()} @ ${storageHost()}): ${response.status} ${details}`.trim());
  }

  return {
    url: publicUrl(path),
    public_id: path,
  };
}

export async function deleteProductImage(publicId: string) {
  const path = sanitizeStoragePath(publicId);
  if (!path) {
    throw new Error('Caminho de imagem inválido');
  }

  const response = await fetch(storageUrl(path), {
    method: 'DELETE',
    headers: {
      AccessKey: accessKey(),
    },
  });

  if (!response.ok && response.status !== 404) {
    const details = await response.text();
    throw new Error(`Bunny delete failed: ${response.status} ${details}`.trim());
  }
}
