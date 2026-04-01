import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<{ url: string; public_id: string }>;
  deleteImage: (public_id: string) => Promise<void>;
  uploading: boolean;
  error: string | null;
}

const STORAGE_BUCKET = 'products';

const sanitizeFileName = (fileName: string) =>
  fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const getStoragePath = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''));
  const fileName = extension ? `${safeName}.${extension}` : safeName;
  return `admin/${crypto.randomUUID()}-${fileName}`;
};

export const getStoragePathFromImageUrl = (imageUrl: string) => {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
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
      const filePath = getStoragePath(file);
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Falha no upload da imagem');
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem');
      }

      return {
        url: data.publicUrl,
        public_id: filePath,
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
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([public_id]);

      if (deleteError) {
        throw new Error(deleteError.message || 'Falha ao deletar imagem');
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
