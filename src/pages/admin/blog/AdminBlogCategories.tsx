import { useEffect, useState } from 'react';
import { Loader2, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { blogApi, type BlogCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function AdminBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { categories: data } = await blogApi.listCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      await blogApi.createCategory(name);
      setNewName('');
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
    }
    setCreating(false);
  };

  const handleRename = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    setSavingId(id);
    setError(null);
    try {
      await blogApi.renameCategory(id, name);
      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao renomear categoria');
    }
    setSavingId(null);
  };

  const handleDelete = async (id: string) => {
    setSavingId(id);
    setError(null);
    try {
      await blogApi.removeCategory(id);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
    }
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Blog</h2>
          <AdminBlogTabs />
        </div>

        <form onSubmit={handleCreate} className="mb-6 flex max-w-md gap-2">
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Nova categoria"
            maxLength={60}
            aria-label="Nome da nova categoria"
          />
          <Button type="submit" disabled={creating || !newName.trim()} className="bg-green-500 text-white hover:bg-green-600">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Adicionar
          </Button>
        </form>

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100">
            {categories.map((category) => {
              const isEditing = editingId === category.id;
              const isBusy = savingId === category.id;
              return (
                <li key={category.id} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                  {isEditing ? (
                    <form
                      className="flex flex-1 items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleRename(category.id);
                      }}
                    >
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        maxLength={60}
                        className="h-9 max-w-xs"
                        aria-label="Novo nome da categoria"
                      />
                      <Button type="submit" size="icon" variant="ghost" disabled={isBusy} title="Salvar">
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => setEditingId(null)} title="Cancelar">
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-slate-900">{category.name}</span>
                      <span className="text-xs text-slate-500">
                        {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Renomear"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {category.post_count > 0 ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled
                          title="Só é possível excluir categorias sem posts"
                          className="text-slate-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" disabled={isBusy} title="Excluir" className="text-slate-400 hover:bg-red-50 hover:text-red-600">
                              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                              <AlertDialogDescription>A categoria "{category.name}" será removida.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-red-500 hover:bg-red-600">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Renomear atualiza todos os posts da categoria. Só dá para excluir categorias sem posts.
        </p>
      </div>
    </div>
  );
}
