import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { blogApi, type BlogPost } from '@/lib/api';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { cn } from '@/lib/utils';

const SITE_TITLE = 'Izu - Mochilas e Brindes';

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Blog | ${SITE_TITLE}`;
    return () => {
      document.title = SITE_TITLE;
    };
  }, []);

  useEffect(() => {
    blogApi
      .listPosts()
      .then(({ posts: data }) => setPosts(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar o blog'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(posts.map((post) => post.category))].sort(), [posts]);
  const featured = posts.filter((post) => post.featured).slice(0, 3);
  const featuredIds = new Set(featured.map((post) => post.id));
  const gridPosts = activeCategory
    ? posts.filter((post) => post.category === activeCategory)
    : posts.filter((post) => !featuredIds.has(post.id));

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 max-w-2xl md:mb-10">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Blog</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">Dicas, novidades e tendências</h1>
        <p className="mt-2 text-slate-600">Ideias para mochilas, brindes e para fortalecer a sua marca.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando posts...</p>
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed bg-slate-50 py-20 text-center text-muted-foreground">
          Em breve, novos conteúdos por aqui.
        </div>
      ) : (
        <div className="space-y-10 md:space-y-12">
          {featured.length > 0 && !activeCategory && (
            <section aria-label="Posts em destaque" className="grid gap-4 md:gap-6 lg:grid-cols-2">
              <BlogPostCard post={featured[0]} large eager sizes="(min-width: 1024px) 50vw, 100vw" />
              {featured.length > 1 && (
                <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-1">
                  {featured.slice(1).map((post) => (
                    <BlogPostCard key={post.id} post={post} sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw" />
                  ))}
                </div>
              )}
            </section>
          )}

          {categories.length > 1 && (
            <nav aria-label="Categorias do blog" className="flex flex-wrap gap-2">
              {[null, ...categories].map((item) => (
                <button
                  key={item ?? 'all'}
                  type="button"
                  onClick={() => setActiveCategory(item)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    activeCategory === item
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary',
                  )}
                >
                  {item ?? 'Todos'}
                </button>
              ))}
            </nav>
          )}

          {gridPosts.length > 0 && (
            <section aria-label="Todos os posts" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
