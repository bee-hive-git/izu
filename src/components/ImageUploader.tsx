import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageOff } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: { url: string; public_id?: string }[];
  onChange: (images: { url: string; public_id?: string }[]) => void;
  maxImages?: number;
  coverImage?: string;
  onSetCover?: (url: string) => void;
}

export function ImageUploader({ value, onChange, maxImages = 20, coverImage, onSetCover }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, error } = useImageUpload();
  const [dragActive, setDragActive] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());
  const brokenCount = value.filter((image) => brokenUrls.has(image.url)).length;

  const isUploading = uploading || localUploading;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    if (value.length + files.length > maxImages) {
      alert(`Você pode enviar no máximo ${maxImages} imagens.`);
      return;
    }

    setLocalUploading(true);
    const newImages = [...value];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      try {
        const result = await uploadImage(file);
        newImages.push(result);
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
      }
    }

    onChange(newImages);
    setLocalUploading(false);
  };

  // The file stays in storage until the product is saved; the server removes it only if no product uses it.
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[150px]",
          dragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Enviando imagens...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Upload className="h-6 w-6 text-slate-500" />
            </div>
            <p className="font-medium text-slate-700">Clique para selecionar ou arraste arquivos aqui</p>
            <p className="text-xs text-slate-500">Suporta JPG, PNG e WEBP (Max {maxImages} imagens)</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Imagens selecionadas ({value.length} / {maxImages})
          </p>
          {brokenCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <span>{brokenCount} foto(s) não existem mais no armazenamento.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => onChange(value.filter((image) => !brokenUrls.has(image.url)))}
              >
                Remover fotos perdidas
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {value.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                <img 
                  src={image.url} 
                  alt={`Preview ${index}`} 
                  onError={() => setBrokenUrls((current) => new Set(current).add(image.url))}
                  className={cn(
                    "w-full h-full object-cover",
                    coverImage === image.url && "ring-2 ring-primary"
                  )}
                />

                {brokenUrls.has(image.url) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50 text-center text-red-600 ring-2 ring-inset ring-red-500">
                    <ImageOff className="h-6 w-6" />
                    <span className="px-2 text-xs font-semibold">Foto perdida — remova e envie de novo</span>
                  </div>
                )}
                
                {coverImage === image.url && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded shadow-sm z-10">
                    Capa
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {onSetCover && coverImage !== image.url && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="text-xs h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetCover(image.url);
                      }}
                    >
                      Definir Capa
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
