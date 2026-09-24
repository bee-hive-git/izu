import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Loader2, Search, X } from 'lucide-react';
import { productsApi, type Product } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const ALL = '__all__';

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { products: data } = await productsApi.list({ all: true });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categoryOptions = useMemo(() => {
    const names = new Set(CATEGORIES.map((item) => item.name));
    products.forEach((product) => names.add(product.category));
    return [...names];
  }, [products]);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    return products.filter(
      (product) =>
        (category === ALL || product.category === category) &&
        (!term || normalize(product.name).includes(term)),
    );
  }, [products, search, category]);

  const hasFilters = search.trim() !== '' || category !== ALL;

  const handleDelete = async (id: string) => {
    try {
      await productsApi.remove(id);
      fetchProducts();
    } catch {
      alert('Erro ao excluir produto');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await productsApi.setActive(id, !currentStatus);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Produtos</h2>
          <Button asChild className="rounded-md bg-green-500 px-6 text-white shadow-sm hover:bg-green-600">
            <Link to="/admin/produtos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Link>
          </Button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome..."
              className="pl-8"
              aria-label="Buscar produto por nome"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-56" aria-label="Filtrar por categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as categorias</SelectItem>
              {categoryOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setCategory(ALL);
              }}
            >
              <X className="mr-1 h-4 w-4" /> Limpar
            </Button>
          )}
          {!loading && (
            <span className="text-sm text-slate-500 sm:ml-auto">
              {hasFilters ? `${filtered.length} de ${products.length}` : products.length} produto(s)
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Nome</th>
                  <th className="p-4 font-semibold text-slate-600">Categoria</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 text-right font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt="" className="h-10 w-10 shrink-0 rounded bg-slate-100 object-cover" />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded bg-slate-100" />
                        )}
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{product.category}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(product.id, product.active)}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${product.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      >
                        {product.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="space-x-2 whitespace-nowrap p-4 text-right">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-blue-50 hover:text-blue-600">
                        <Link to={`/admin/produtos/${product.id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto "{product.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-500 hover:bg-red-600">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="bg-slate-50/30 p-12 text-center text-muted-foreground">
                      {hasFilters ? (
                        <p className="font-medium">Nenhum produto encontrado com esses filtros.</p>
                      ) : (
                        <>
                          <p className="font-medium">Nenhum produto cadastrado.</p>
                          <p className="text-sm">Clique em "Novo Produto" para começar.</p>
                        </>
                      )}
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
