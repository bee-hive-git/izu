import { blogImageSrcSet } from '@/lib/blog';
import { cn } from '@/lib/utils';

type BlogImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
};

export function BlogImage({ src, alt, sizes, className, eager }: BlogImageProps) {
  return (
    <img
      src={src}
      srcSet={blogImageSrcSet(src)}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      className={cn('block h-full w-full object-cover', className)}
    />
  );
}
