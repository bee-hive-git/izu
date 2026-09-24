import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  EyeOff,
  FileText,
  Loader2,
  Newspaper,
  Package,
  Plus,
  Star,
  Tags,
} from 'lucide-react';
import { adminIssuesApi, blogApi, productsApi, type BlogCategory, type BlogPost, type Product } from '@/lib/api';
import { formatBlogDate } from '@/lib/blog';
import { Button } from '@/components/ui/button';

type StatCardProps = {
  label: string;
  value: number | string;
  detail?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'warning' | 'success';
  to?: string;
};

function StatCard({ label, value, detail, icon: Icon, tone = 'default', to }: StatCardProps) {
  const toneClasses = {
    default: 'bg-slate-100 text-slate-700',
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-green-100 text-green-700',
  }[tone];

  const content = (
    <div className="flex h-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function formatDate(iso: string) {
  return formatBlogDate(iso);
}

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [issuesCount, setIssuesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([productsApi.list({ all: true }), blogApi.listPosts({ all: true }), blogApi.listCategories()])
      .then(([productsResult, postsResult, categoriesResult]) => {
        setProducts(productsResult.products);
        setPosts(postsResult.posts);
        setCategories(categoriesResult.categories);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar o painel'))
      .finally(() => setLoading(false));

    adminIssuesApi
      .list()
      .then(({ issues }) => setIssuesCount(issues.length))
      .catch(() => setIssuesCount(null));
  }, []);

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.active).length;
    const byCategory = new Map<string, number>();
    products.forEach((product) => byCategory.set(product.category, (byCategory.get(product.category) ?? 0) + 1));
    const publishedPosts = posts.filter((post) => post.published).length;
    return {
      activeProducts,
      inactiveProducts: products.length - activeProducts,
      categoryBreakdown: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      publishedPosts,
      draftPosts: posts.length - publishedPosts,
      featuredPosts: posts.filter((post) => post.featured).length,
      recentProducts: [...products].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
      recentPosts: [...posts].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5),
    };
  }, [products, posts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Carregando painel...</p>
      </div>
    );
  }

  const maxCategory = stats.categoryBreakdown[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Visão geral do site</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/blog/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo post
            </Link>
          </Button>
          <Button asChild className="bg-green-500 text-white hover:bg-green-600">
            <Link to="/admin/produtos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo produto
            </Link>
          </Button>
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Produtos cadastrados"
          value={products.length}
          detail={`${stats.activeProducts} ativos · ${stats.inactiveProducts} inativos`}
          icon={Package}
          to="/admin/produtos"
        />
        <StatCard
          label="Posts no blog"
          value={posts.length}
          detail={`${stats.publishedPosts} publicados · ${stats.draftPosts} rascunhos`}
          icon={Newspaper}
          to="/admin/blog"
        />
        <StatCard
          label="Posts em destaque"
          value={`${stats.featuredPosts} / 3`}
          detail={`${categories.length} categorias no blog`}
          icon={Star}
          to="/admin/blog"
        />
        {issuesCount === null ? (
          <StatCard label="Ajustes pendentes" value="…" detail="Verificando fotos dos produtos" icon={Loader2} />
        ) : issuesCount > 0 ? (
          <StatCard
            label="Ajustes pendentes"
            value={issuesCount}
            detail="Produtos com fotos perdidas"
            icon={AlertTriangle}
            tone="warning"
            to="/admin/ajustes"
          />
        ) : (
          <StatCard label="Ajustes pendentes" value={0} detail="Todas as fotos estão ok" icon={CheckCircle2} tone="success" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Tags className="h-4 w-4 text-slate-500" /> Produtos por categoria
          </h3>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum produto cadastrado.</p>
          ) : (
            <ul className="space-y-3">
              {stats.categoryBreakdown.map(([name, count]) => (
                <li key={name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{name}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(count / maxCategory) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Newspaper className="h-4 w-4 text-slate-500" /> Blog por categoria
          </h3>
          <ul className="grid grid-cols-2 gap-2">
            {categories.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-700">{item.name}</span>
                <span className="font-semibold text-slate-900">{item.post_count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Package className="h-4 w-4 text-slate-500" /> Últimos produtos
            </h3>
            <Link to="/admin/produtos" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {stats.recentProducts.map((product) => (
              <li key={product.id}>
                <Link to={`/admin/produtos/${product.id}/editar`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt="" className="h-10 w-10 shrink-0 rounded bg-slate-100 object-cover" />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded bg-slate-100" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{product.name}</span>
                    <span className="block text-xs text-slate-500">
                      {product.category} · {formatDate(product.created_at)}
                    </span>
                  </span>
                  {!product.active && <EyeOff className="h-4 w-4 text-slate-400" aria-label="Inativo" />}
                </Link>
              </li>
            ))}
            {stats.recentProducts.length === 0 && <li className="py-4 text-sm text-slate-500">Nenhum produto ainda.</li>}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <FileText className="h-4 w-4 text-slate-500" /> Últimos posts
            </h3>
            <Link to="/admin/blog" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {stats.recentPosts.map((post) => (
              <li key={post.id}>
                <Link to={`/admin/blog/${post.id}/editar`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                  <img src={post.cover_image} alt="" className="h-10 w-14 shrink-0 rounded bg-slate-100 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{post.title}</span>
                    <span className="block text-xs text-slate-500">
                      {post.category} · {formatDate(post.published_at)}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </Link>
              </li>
            ))}
            {stats.recentPosts.length === 0 && (
              <li className="py-4 text-sm text-slate-500">
                Nenhum post ainda.{' '}
                <Link to="/admin/blog/novo" className="text-primary hover:underline">
                  Escrever o primeiro
                </Link>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
