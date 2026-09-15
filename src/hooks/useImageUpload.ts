import { useState } from 'react';

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<{ url: string; public_id: string }>;
  deleteImage: (public_id: string) => Promise<void>;
  uploading: boolean;
  error: string | null;
}

export const getStoragePathFromImageUrl = (imageUrl: string) => {
  try {
    const url = new URL(imageUrl);

    if (url.hostname.endsWith('.b-cdn.net') || url.hostname.includes('bunnycdn.com')) {
      const path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
      return path.startsWith('produtos/') ? path : null;
    }

    if (url.hostname.includes('cloudinary.com')) {
      const uploadIndex = url.pathname.indexOf('/upload/');
      if (uploadIndex === -1) {
        return null;
      }

      const afterUpload = url.pathname.slice(uploadIndex + '/upload/'.length).replace(/^v\d+\//, '');
      return decodeURIComponent(afterUpload.replace(/\.[^.]+$/, ''));
    }

    const marker = '/storage/v1/object/public/products/';
    const index = url.pathname.indexOf(marker);
    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Falha no upload da imagem');
      }

      return {
        url: data.url as string,
        public_id: data.public_id as string,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (public_id: string) => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao deletar imagem');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, deleteImage, uploading, error };
}
