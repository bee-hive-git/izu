import { Link } from 'react-router-dom';
import type { BlogPost } from '@/lib/api';
import { formatBlogDate } from '@/lib/blog';
import { BlogImage } from '@/components/blog/BlogImage';
import { cn } from '@/lib/utils';

type BlogPostCardProps = {
  post: BlogPost;
  sizes?: string;
  large?: boolean;
  eager?: boolean;
};

export function BlogPostCard({ post, sizes = '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw', large, eager }: BlogPostCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className={cn('overflow-hidden bg-slate-100', large ? 'aspect-[16/9]' : 'aspect-[3/2]')}>
        <BlogImage
          src={post.cover_image}
          alt={post.title}
          sizes={sizes}
          eager={eager}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className={cn('flex flex-1 flex-col gap-2', large ? 'p-5 md:p-6' : 'p-4 md:p-5')}>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">{post.category}</span>
        <h3 className={cn('font-bold leading-snug text-slate-900 group-hover:text-primary', large ? 'text-xl md:text-2xl' : 'text-lg')}>
          {post.title}
        </h3>
        {post.subtitle && <p className="line-clamp-3 text-sm text-slate-600">{post.subtitle}</p>}
        <time dateTime={post.published_at} className="mt-auto pt-2 text-xs text-slate-500">
          {formatBlogDate(post.published_at)}
        </time>
      </div>
    </Link>
  );
}
