import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, ArrowLeft, Loader2, Maximize2, Ruler, Weight } from 'lucide-react';
import { productsApi, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { COMPANY_INFO, PRODUCT_COLOR_PRESETS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PRODUCT_COLOR_VALUE_BY_NAME = new Map(PRODUCT_COLOR_PRESETS.map((color) => [color.name, color.value] as const));

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { product: data } = await productsApi.get(id);
        setProduct(data);
        if (data.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Produto não encontrado</h2>
        <Button asChild>
          <Link to="/produtos">Voltar para o Catálogo</Link>
        </Button>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const text = `Olá! Tenho interesse no produto:\n\n*${product.name}*\nCor: ${selectedColor || 'Não especificada'}\n\nGostaria de receber um orçamento.`;
    const url = `https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const categoryPath = product.category
    ? `/produtos/${encodeURIComponent(product.category)}`
    : '/produtos';
  const subcategoryPath = product.category && product.subcategory
    ? `/produtos/${encodeURIComponent(product.category)}/${encodeURIComponent(product.subcategory)}`
    : categoryPath;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 lg:space-y-8">
      <nav className="flex items-center gap-2 min-w-0 text-sm font-semibold tracking-wider uppercase text-primary">
        <Link
          to={categoryPath}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <Link to={categoryPath} className="truncate hover:underline">
            {product.category}
          </Link>
          {product.subcategory && (
            <>
              <span className="text-primary/60 shrink-0">&gt;</span>
              <Link to={subcategoryPath} className="truncate hover:underline">
                {product.subcategory}
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-4">
        <div className="order-1 lg:col-start-2 lg:row-start-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>
        </div>

        <div className="order-2 flex flex-col-reverse gap-3 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:flex-row lg:items-start">
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory lg:flex-col lg:w-24 lg:overflow-x-hidden lg:overflow-y-auto lg:max-h-[36rem] lg:pb-0 lg:snap-none">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "aspect-square w-16 sm:w-20 shrink-0 snap-start rounded-md border-2 overflow-hidden bg-slate-50 lg:w-full",
                    selectedImage === i ? "border-primary" : "border-transparent hover:border-slate-300"
                  )}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="aspect-[4/3] w-full bg-slate-100 rounded-xl overflow-hidden border lg:aspect-square">
            {product.images?.[selectedImage] ? (
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">Sem imagem</div>
            )}
          </div>
        </div>

        <div className="order-3 space-y-8 lg:col-start-2 lg:row-start-2">

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Descrição</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold">Cores Disponíveis</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all inline-flex items-center gap-2",
                      selectedColor === color 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-white text-slate-700 hover:border-slate-400"
                    )}
                  >
                    <span
                      className={cn(
                        "h-3 w-3 rounded-full border",
                        selectedColor === color ? "border-white/70" : "border-slate-200"
                      )}
                      style={{ backgroundColor: PRODUCT_COLOR_VALUE_BY_NAME.get(color) || '#e2e8f0' }}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-slate-50 border-none">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <Maximize2 className="h-5 w-5 text-primary" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Dimensões</p>
                  <p className="text-sm font-bold">{product.height}x{product.width}x{product.depth} cm</p>
                </div>
              </CardContent>
            </Card>
            
            {product.weight && (
              <Card className="bg-slate-50 border-none">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Weight className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Peso Aprox.</p>
                    <p className="text-sm font-bold">{product.weight}g</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {product.engraving_dimensions && (
              <Card className="bg-slate-50 border-none">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Gravação</p>
                    <p className="text-sm font-bold">{product.engraving_dimensions}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {product.additional_info && (
            <div className="p-4 bg-slate-50 rounded-lg text-sm">
              <p className="font-bold mb-1">Informações Adicionais:</p>
              <p className="text-muted-foreground">{product.additional_info}</p>
            </div>
          )}

          <Button size="lg" className="w-full py-8 text-xl gap-3 shadow-xl hover:scale-[1.02] transition-transform" onClick={handleWhatsApp}>
            <Phone className="h-6 w-6" /> Solicitar Orçamento via WhatsApp
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Atendimento rápido e personalizado para sua empresa.
          </p>
        </div>
      </div>
    </div>
  );
}
