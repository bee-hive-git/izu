import type { BlogBlock } from '@/lib/api';

export const MAX_FEATURED_POSTS = 3;

const MAX_IMAGE_SIDE = 2000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export function formatBlogDate(iso: string | null | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function toDateInputValue(iso: string | null | undefined) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function fromDateInputValue(value: string, previousIso?: string | null) {
  if (!value) return null;
  const previous = previousIso ? new Date(previousIso) : new Date();
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(previous);
  date.setFullYear(year, month - 1, day);
  return date.toISOString();
}

const BLOG_IMAGE_PATTERN = /^(.*\/blog\/[^/]+)\.webp$/;

export function blogImageSrcSet(url: string) {
  const match = url.match(BLOG_IMAGE_PATTERN);
  if (!match) return undefined;
  const base = match[1];
  return `${base}-480.webp 480w, ${base}-960.webp 960w, ${url} 2000w`;
}

export type ContentSegment =
  | { kind: 'block'; block: Exclude<BlogBlock, { type: 'image' }> }
  | { kind: 'gallery'; id: string; images: Extract<BlogBlock, { type: 'image' }>[] };

export function segmentContent(blocks: BlogBlock[]): ContentSegment[] {
  const segments: ContentSegment[] = [];
  for (const block of blocks) {
    if (block.type === 'image') {
      const last = segments[segments.length - 1];
      if (last?.kind === 'gallery') {
        last.images.push(block);
      } else {
        segments.push({ kind: 'gallery', id: block.id, images: [block] });
      }
    } else {
      segments.push({ kind: 'block', block });
    }
  }
  return segments;
}

export function galleryColumns(count: number) {
  if (count <= 1) return 1;
  if (count === 2 || count === 4) return 2;
  return 3;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Formato de imagem não suportado. Use JPG, PNG ou WebP.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File): Promise<{ blob: Blob; name: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo escolhido não é uma imagem.');
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight));

  if (scale === 1 && file.size <= MAX_IMAGE_BYTES && /image\/(jpeg|webp)/.test(file.type)) {
    return { blob: file, name: file.name };
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível processar a imagem neste navegador.');
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.88;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.5) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }
  if (!blob) {
    throw new Error('Não foi possível comprimir a imagem.');
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
  return { blob, name: `${baseName}.jpg` };
}

export function slugify(text: string) {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '') || 'post'
  );
}

export function newBlockId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
