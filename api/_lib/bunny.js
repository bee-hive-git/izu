import { randomUUID } from 'node:crypto';

const PRODUCT_FOLDER = 'produtos';
const ALLOWED_FOLDERS = [PRODUCT_FOLDER, 'blog'];

function requiredEnv(name) {
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

function encodeStoragePath(path) {
  return path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

function storageUrl(path) {
  return `https://${storageHost()}/${encodeURIComponent(storageZone())}/${encodeStoragePath(path)}`;
}

export function publicUrl(path) {
  return `${cdnBaseUrl()}/${encodeStoragePath(path)}`;
}

export function sanitizeStoragePath(path) {
  const normalized = path.replace(/^\/+/, '').replace(/\\/g, '/');
  const allowed = ALLOWED_FOLDERS.some((folder) => normalized.startsWith(`${folder}/`));
  if (!allowed || normalized.includes('..')) {
    return null;
  }
  return normalized;
}

function fileExtension(fileName, mimeType) {
  const fromName = fileName.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }

  const fromMime = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };

  return (mimeType && fromMime[mimeType]) || 'jpg';
}

export async function uploadBuffer(path, body, mimeType) {
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

  return publicUrl(path);
}

export async function listStorageFolder(folder) {
  const response = await fetch(`${storageUrl(folder)}/`, {
    headers: { AccessKey: accessKey(), accept: 'application/json' },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Bunny list failed: ${response.status} ${details}`.trim());
  }
  const entries = await response.json();
  return entries.filter((entry) => !entry.IsDirectory).map((entry) => `${folder}/${entry.ObjectName}`);
}

export function storagePathFromUrl(url) {
  if (typeof url !== 'string') {
    return null;
  }
  const base = `${cdnBaseUrl()}/`;
  if (!url.startsWith(base)) {
    return null;
  }
  return sanitizeStoragePath(decodeURIComponent(url.slice(base.length)));
}

export async function uploadProductImageBuffer(body, originalName, mimeType) {
  const extension = fileExtension(originalName, mimeType);
  const path = `${PRODUCT_FOLDER}/${randomUUID()}.${extension}`;

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

export async function deleteProductImage(publicId) {
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
