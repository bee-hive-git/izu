import { useState } from 'react';

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<{ url: string; public_id: string }>;
  deleteImage: (public_id: string) => Promise<void>;
  uploading: boolean;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload da imagem');
      }

      const data = await response.json();
      setUploading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setUploading(false);
      throw err;
    }
  };

  const deleteImage = async (public_id: string) => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id }),
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar imagem');
      }

      setUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setUploading(false);
      throw err;
    }
  };

  return { uploadImage, deleteImage, uploading, error };
}
