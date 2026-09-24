import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productsApi, type BlogBlock, type Product } from '@/lib/api';
import { galleryColumns, segmentContent } from '@/lib/blog';
import { BlogImage } from '@/components/blog/BlogImage';
import { cn } from '@/lib/utils';

type ImageBlock = Extract<BlogBlock, { type: 'image' }>;

const GRID_CLASSES: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
};

const GRID_SIZES: Record<number, string> = {
  1: '(min-width: 768px) 768px, 100vw',
  2: '(min-width: 768px) 384px, 50vw',
  3: '(min-width: 768px) 256px, 50vw',
};

function Gallery({ images }: { images: ImageBlock[] }) {
  const columns = galleryColumns(images.length);

  if (columns === 1) {
    const [image] = images;
    return (
      <figure className="overflow-hidden rounded-xl bg-slate-100">
        <BlogImage src={image.url} alt={image.alt} sizes={GRID_SIZES[1]} className="h-auto" />
        {image.alt && <figcaption className="px-1 pt-2 text-sm text-slate-500">{image.alt}</figcaption>}
      </figure>
    );
  }

  return (
    <div className={cn('grid gap-2 md:gap-3', GRID_CLASSES[columns])}>
      {images.map((image) => (
        <div key={image.id} className="aspect-square overflow-hidden rounded-lg bg-slate-100">
          <BlogImage src={image.url} alt={image.alt} sizes={GRID_SIZES[columns]} />
        </div>
      ))}
    </div>
  );
}

export function ProductsBlock({ productIds }: { productIds: string[] }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const idsKey = productIds.join(',');

  useEffect(() => {
    let cancelled = false;
    productsApi
      .list({ ids: idsKey.split(',').filter(Boolean) })
      .then(({ products: data }) => {
        if (cancelled) return;
        const order = idsKey.split(',');
        setProducts([...data].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)));
      })
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  if (products === null) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {productIds.slice(0, 3).map((id) => (
          <div key={id} className="aspect-[4/5] animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">Produtos relacionados</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/produto/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-slate-100">
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-500">{product.category}</span>
              <span className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</span>
              <span className="mt-auto flex items-center gap-1 pt-1 text-xs font-semibold text-primary">
                Ver produto <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6 md:space-y-8">
      {segmentContent(blocks).map((segment) => {
        if (segment.kind === 'gallery') {
          return <Gallery key={segment.id} images={segment.images} />;
        }
        const { block } = segment;
        if (block.type === 'text') {
          return <div key={block.id} className="blog-rich" dangerouslySetInnerHTML={{ __html: block.html }} />;
        }
        return <ProductsBlock key={block.id} productIds={block.productIds} />;
      })}
    </div>
  );
}
