import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Loader2, Star, ExternalLink } from 'lucide-react';
import { blogApi, type BlogPost } from '@/lib/api';
import { formatBlogDate } from '@/lib/blog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AdminBlogTabs } from './AdminBlogTabs';

export function AdminBlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { posts: data } = await blogApi.listPosts({ all: true });
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar posts');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await blogApi.removePost(id);
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">Blog</h2>
            <AdminBlogTabs />
          </div>
          <Button asChild className="rounded-md bg-green-500 px-6 text-white shadow-sm hover:bg-green-600">
            <Link to="/admin/blog/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Post
            </Link>
          </Button>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="overflow-hidden rounded-lg border border-slate-100">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Post</th>
                  <th className="p-4 font-semibold text-slate-600">Categoria</th>
                  <th className="p-4 font-semibold text-slate-600">Data</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 text-right font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={post.cover_image} alt="" className="h-12 w-16 shrink-0 rounded object-cover bg-slate-100" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-medium text-slate-900">
                            {post.featured && <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-label="Destaque" />}
                            <span className="line-clamp-1">{post.title}</span>
                          </p>
                          <p className="line-clamp-1 text-xs text-slate-500">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{post.category}</td>
                    <td className="p-4 text-slate-600">{formatBlogDate(post.published_at)}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          post.published ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {post.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="space-x-1 whitespace-nowrap p-4 text-right">
                      {post.published && (
                        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100">
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" title="Ver no site">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild className="hover:bg-blue-50 hover:text-blue-600">
                        <Link to={`/admin/blog/${post.id}/editar`} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-red-50 hover:text-red-600" title="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O post "{post.title}" e as fotos dele serão apagados. Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-red-500 hover:bg-red-600">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="bg-slate-50/30 p-12 text-center text-muted-foreground">
                      <p className="font-medium">Nenhum post ainda.</p>
                      <p className="text-sm">Clique em "Novo Post" para escrever o primeiro.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
