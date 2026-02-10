import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/constants';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  images: string[];
  active: boolean;
}

export function ProductList() {
  const { category, subcategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('id, name, category, subcategory, images, active')
        .eq('active', true);

      if (category) {
        query = query.eq('category', decodeURIComponent(category));
      }
      if (subcategory) {
        query = query.eq('subcategory', decodeURIComponent(subcategory));
      }

      const search = searchParams.get('search');
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [category, subcategory, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchTerm ? { search: searchTerm } : {});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" /> Categorias
            </h3>
            <div className="space-y-2">
              <Link 
                to="/produtos" 
                className={`block px-3 py-2 rounded-md transition-colors ${!category ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-slate-100'}`}
              >
                Todos os Produtos
              </Link>
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <Link 
                    to={`/produtos/${encodeURIComponent(cat.name)}`}
                    className={`block px-3 py-2 rounded-md transition-colors ${category === cat.name ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-100'}`}
                  >
                    {cat.name}
                  </Link>
                  {category === cat.name && cat.subcategories.length > 0 && (
                    <div className="pl-4 space-y-1 mt-1">
                      {cat.subcategories.map((sub) => (
                        <Link 
                          key={sub}
                          to={`/produtos/${encodeURIComponent(cat.name)}/${encodeURIComponent(sub)}`}
                          className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${subcategory === sub ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Breadcrumbs & Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Link to="/" className="hover:text-primary">Home</Link>
               <span>/</span>
               <Link to="/produtos" className="hover:text-primary">Produtos</Link>
               {category && (
                 <>
                   <span>/</span>
                   <Link to={`/produtos/${encodeURIComponent(category)}`} className="hover:text-primary">{category}</Link>
                 </>
               )}
               {subcategory && (
                 <>
                   <span>/</span>
                   <span className="text-foreground">{subcategory}</span>
                 </>
               )}
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold">
                {subcategory || category || 'Todos os Produtos'}
              </h1>
              
              <form onSubmit={handleSearch} className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar nesta categoria..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link to={`/produto/${product.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all group">
                      <CardContent className="p-0 aspect-square relative overflow-hidden bg-slate-100 rounded-t-lg">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">Sem imagem</div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 flex flex-col items-start gap-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
                        <h3 className="font-bold text-slate-900 line-clamp-2">{product.name}</h3>
                        <Button variant="link" className="p-0 h-auto text-primary font-semibold mt-2 group-hover:underline">
                          Ver Detalhes
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed">
               <p className="text-muted-foreground mb-4">Nenhum produto encontrado nesta seleção.</p>
               <Button asChild variant="outline">
                 <Link to="/produtos">Limpar Filtros</Link>
               </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
