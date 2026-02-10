import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
} from "@/components/ui/alert-dialog"

interface Product {
  id: string;
  name: string;
  category: string;
  active: boolean;
  created_at: string;
}

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir produto');
    } else {
      fetchProducts();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('products').update({ active: !currentStatus }).eq('id', id);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Produtos</h2>
            <Button asChild className="bg-green-500 hover:bg-green-600 text-white rounded-md px-6 shadow-sm">
            <Link to="/admin/produtos/novo">
                <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Link>
            </Button>
        </div>

        <div className="rounded-lg border border-slate-100 overflow-hidden">
            {loading ? (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            ) : (
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                    <th className="p-4 font-semibold text-slate-600">Nome</th>
                    <th className="p-4 font-semibold text-slate-600">Categoria</th>
                    <th className="p-4 font-semibold text-slate-600">Status</th>
                    <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{product.name}</td>
                    <td className="p-4 text-slate-600">{product.category}</td>
                    <td className="p-4">
                        <button 
                        onClick={() => toggleActive(product.id, product.active)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${product.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                        {product.active ? 'Ativo' : 'Inativo'}
                        </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-blue-50 hover:text-blue-600">
                        <Link to={`/admin/produtos/${product.id}/editar`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        </Button>
                        
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
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
                {products.length === 0 && (
                    <tr>
                    <td colSpan={4} className="p-12 text-center text-muted-foreground bg-slate-50/30">
                        <div className="flex flex-col items-center gap-2">
                           <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                             <Plus className="h-6 w-6 text-slate-400" />
                           </div>
                           <p className="font-medium">Nenhum produto cadastrado.</p>
                           <p className="text-sm">Clique em "Novo Produto" para começar.</p>
                        </div>
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
