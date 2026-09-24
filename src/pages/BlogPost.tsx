import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { blogApi, type BlogPost as BlogPostType } from '@/lib/api';
import { formatBlogDate } from '@/lib/blog';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogImage } from '@/components/blog/BlogImage';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { Button } from '@/components/ui/button';

const SITE_TITLE = 'Izu - Mochilas e Brindes';

async function loadSuggestions(post: BlogPostType) {
  const [sameCategory, latest] = await Promise.all([
    blogApi.listPosts({ category: post.category, exclude: post.id, limit: 3 }),
    blogApi.listPosts({ exclude: post.id, limit: 6 }),
  ]);
  const merged = [...sameCategory.posts];
  for (const candidate of latest.posts) {
    if (merged.length >= 3) break;
    if (!merged.some((item) => item.id === candidate.id)) merged.push(candidate);
  }
  return merged;
}

export function BlogPost() {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [suggestions, setSuggestions] = useState<BlogPostType[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setSuggestions([]);

    blogApi
      .getPost(slug)
      .then(({ post: data }) => {
        if (cancelled) return;
        setPost(data);
        setStatus('ready');
        loadSuggestions(data)
          .then((items) => !cancelled && setSuggestions(items))
          .catch(() => undefined);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        setStatus(message.includes('não encontrado') ? 'not-found' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (post) document.title = `${post.title} | ${SITE_TITLE}`;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [post]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando post...</p>
      </div>
    );
  }

  if (status !== 'ready' || !post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {status === 'not-found' ? 'Post não encontrado' : 'Não foi possível carregar o post'}
        </h1>
        <p className="mt-2 text-slate-600">
          {status === 'not-found' ? 'Ele pode ter sido removido ou ainda não foi publicado.' : 'Tente novamente em instantes.'}
        </p>
        <Button asChild className="mt-6">
          <Link to="/blog">Ver todos os posts</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="pb-16">
      <div className="container mx-auto max-w-4xl px-4 pt-6 md:pt-8">
        <nav aria-label="Navegação" className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase text-primary">
          <Link to="/blog" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="h-4 w-4" /> Blog
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="truncate text-slate-600">{post.category}</span>
        </nav>

        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
          <BlogImage src={post.cover_image} alt={post.title} sizes="(min-width: 896px) 896px, 100vw" eager />
        </div>

        <header className="mx-auto mt-6 max-w-3xl md:mt-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold uppercase tracking-wider text-primary">{post.category}</span>
            <span className="text-slate-300">•</span>
            <time dateTime={post.published_at} className="text-slate-500">
              {formatBlogDate(post.published_at)}
            </time>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 md:text-5xl">{post.title}</h1>
          {post.subtitle && <p className="mt-4 text-lg text-slate-600 md:text-xl">{post.subtitle}</p>}
        </header>

        <div className="mx-auto mt-8 max-w-3xl md:mt-10">
          <BlogContent blocks={post.content ?? []} />
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-16 border-t border-slate-100 bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Continue lendo</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((item) => (
                <BlogPostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
