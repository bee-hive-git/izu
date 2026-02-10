import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Loader2, X, Upload, Check } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Preto', value: '#000000', border: 'border-slate-200' },
  { name: 'Branco', value: '#FFFFFF', border: 'border-slate-300 shadow-sm' },
  { name: 'Cinza', value: '#808080', border: 'border-transparent' },
  { name: 'Azul Marinho', value: '#000080', border: 'border-transparent' },
  { name: 'Azul Royal', value: '#4169E1', border: 'border-transparent' },
  { name: 'Azul Claro', value: '#87CEEB', border: 'border-transparent' },
  { name: 'Vermelho', value: '#FF0000', border: 'border-transparent' },
  { name: 'Vinho', value: '#800000', border: 'border-transparent' },
  { name: 'Verde', value: '#008000', border: 'border-transparent' },
  { name: 'Verde Claro', value: '#90EE90', border: 'border-transparent' },
  { name: 'Amarelo', value: '#FFD700', border: 'border-transparent' },
  { name: 'Laranja', value: '#FFA500', border: 'border-transparent' },
  { name: 'Roxo', value: '#800080', border: 'border-transparent' },
  { name: 'Rosa', value: '#FFC0CB', border: 'border-transparent' },
  { name: 'Marrom', value: '#A52A2A', border: 'border-transparent' },
  { name: 'Bege', value: '#E8DCC4', border: 'border-transparent' },
  { name: 'Prata', value: '#C0C0C0', border: 'border-transparent' },
  { name: 'Dourado', value: '#DAA520', border: 'border-transparent' },
];

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  subcategory: z.string().min(1, "Subcategoria é obrigatória"),
  height: z.coerce.number().min(0, "Altura inválida"),
  width: z.coerce.number().min(0, "Largura inválida"),
  depth: z.coerce.number().min(0, "Profundidade inválida"),
  weight: z.coerce.number().optional(),
  engraving_dimensions: z.string().optional(),
  additional_info: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      category: '',
      subcategory: '',
      height: 0,
      width: 0,
      depth: 0,
    },
  });

  const selectedCategory = form.watch('category');
  const subcategories = CATEGORIES.find(c => c.name === selectedCategory)?.subcategories || [];

  useEffect(() => {
    if (isEditing) {
      async function fetchProduct() {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          form.reset({
            name: data.name,
            description: data.description,
            category: data.category,
            subcategory: data.subcategory,
            height: data.height,
            width: data.width,
            depth: data.depth,
            weight: data.weight,
            engraving_dimensions: data.engraving_dimensions,
            additional_info: data.additional_info,
          });
          setImages(data.images || []);
          setColors(data.colors || []);
        }
      }
      fetchProduct();
    }
  }, [id, isEditing, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    const files = Array.from(e.target.files);
    const newImages: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        alert('Erro ao fazer upload da imagem');
        continue;
      }

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      newImages.push(data.publicUrl);
    }

    setImages([...images, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleColor = (colorName: string) => {
    if (colors.includes(colorName)) {
      setColors(colors.filter(c => c !== colorName));
    } else {
      setColors([...colors, colorName]);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    
    if (images.length === 0) {
      alert("Adicione pelo menos uma imagem.");
      setLoading(false);
      return;
    }

    const productData = {
      ...data,
      images,
      colors,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([{ ...productData, active: true }]);
      error = insertError;
    }

    if (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    } else {
      navigate('/admin/produtos');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-10">
        {/* Informações Básicas */}
        <Card className="border border-slate-200 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-4 px-6">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-slate-700">Nome do Produto</Label>
              <Input {...form.register('name')} className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12 text-base" placeholder="Ex: Mochila Executiva Premium" />
              {form.formState.errors.name && <p className="text-red-500 text-sm font-medium mt-1">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-slate-700">Descrição</Label>
              <Textarea {...form.register('description')} className="min-h-[150px] bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-base p-4" placeholder="Descreva os detalhes do produto..." />
              {form.formState.errors.description && <p className="text-red-500 text-sm font-medium mt-1">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">Categoria</Label>
                <Select onValueChange={(val) => form.setValue('category', val)} defaultValue={form.getValues('category')} value={form.watch('category')}>
                  <SelectTrigger className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.name} value={cat.name} className="py-3 cursor-pointer">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && <p className="text-red-500 text-sm font-medium mt-1">{form.formState.errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">Subcategoria</Label>
                <Select onValueChange={(val) => form.setValue('subcategory', val)} defaultValue={form.getValues('subcategory')} value={form.watch('subcategory')}>
                  <SelectTrigger className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12">
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(sub => (
                      <SelectItem key={sub} value={sub} className="py-3 cursor-pointer">{sub}</SelectItem>
                    ))}
                    {subcategories.length === 0 && <SelectItem value="default" disabled>Selecione uma categoria primeiro</SelectItem>}
                  </SelectContent>
                </Select>
                {form.formState.errors.subcategory && <p className="text-red-500 text-sm font-medium mt-1">{form.formState.errors.subcategory.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imagens e Cores */}
        <Card className="border border-slate-200 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-4 px-6">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
              Imagens e Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8 bg-white">
            <div className="space-y-4">
               <Label className="text-base font-semibold text-slate-700 block">Imagens do Produto</Label>
               <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-dashed">
                 <div className="flex flex-wrap gap-6">
                   {images.map((img, i) => (
                     <div key={i} className="relative w-32 h-32 border-2 border-white shadow-md rounded-lg overflow-hidden group">
                       <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button type="button" onClick={() => removeImage(i)} className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform hover:scale-110 transition-all">
                           <X className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                   ))}
                   <label className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-primary hover:text-primary hover:shadow-md transition-all group bg-white">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-5 w-5 text-slate-500 group-hover:text-primary" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-primary">Adicionar Foto</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                   </label>
                 </div>
               </div>
               {uploading && <p className="text-sm text-primary animate-pulse font-medium mt-2 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Enviando imagens...</p>}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
               <Label className="text-base font-semibold text-slate-700 block">Cores Disponíveis</Label>
               
               <div className="flex flex-wrap gap-x-4 gap-y-10 mb-8 pt-2">
                 {PRESET_COLORS.map((color) => {
                   const isSelected = colors.includes(color.name);
                   return (
                     <button
                       key={color.name}
                       type="button"
                       onClick={() => toggleColor(color.name)}
                       className={`
                         group relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center
                         ${isSelected ? 'border-primary ring-2 ring-primary/20 scale-110' : `${color.border} hover:scale-110 hover:shadow-md`}
                       `}
                       style={{ backgroundColor: color.value }}
                       title={color.name}
                     >
                       {isSelected && <Check className={`h-5 w-5 ${color.name === 'Branco' || color.name === 'Bege' || color.name === 'Prata' ? 'text-black' : 'text-white'}`} />}
                       <span className="sr-only">{color.name}</span>
                       
                       {/* Tooltip on hover */}
                       <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                         {color.name}
                       </span>
                     </button>
                    );
                  })}
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Especificações Técnicas */}
        <Card className="border border-slate-200 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-4 px-6">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
              Especificações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">Altura (cm)</Label>
                <Input type="number" step="0.1" {...form.register('height')} className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">Largura (cm)</Label>
                <Input type="number" step="0.1" {...form.register('width')} className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">Profundidade (cm)</Label>
                <Input type="number" step="0.1" {...form.register('depth')} className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">Peso (g) <span className="text-slate-400 font-normal text-sm ml-1">(Opcional)</span></Label>
                <Input type="number" step="1" {...form.register('weight')} className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold text-slate-700">Dimensões de Gravação <span className="text-slate-400 font-normal text-sm ml-1">(Opcional)</span></Label>
                <Input placeholder="Ex: 5x5 cm" {...form.register('engraving_dimensions')} className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-slate-700">Informações Adicionais <span className="text-slate-400 font-normal text-sm ml-1">(Opcional)</span></Label>
              <Textarea {...form.register('additional_info')} className="bg-white border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm min-h-[120px] p-4 text-base" placeholder="Detalhes extras sobre o produto..." />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 mt-10">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/produtos')} className="px-8 h-12 text-base border-slate-300 hover:bg-slate-50">Cancelar</Button>
          <Button type="submit" disabled={loading || uploading} className="bg-green-600 hover:bg-green-700 px-10 h-12 text-base font-bold shadow-lg shadow-green-600/20">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Salvar Produto
          </Button>
        </div>
      </form>
    </div>
  );
}
