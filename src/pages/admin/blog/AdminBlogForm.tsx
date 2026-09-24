import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ImageIcon,
  Images,
  Loader2,
  Package,
  Search,
  Star,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import {
  blogApi,
  productsApi,
  type BlogBlock,
  type BlogCategory,
  type BlogPost,
  type BlogPostPayload,
  type Product,
} from '@/lib/api';
import {
  MAX_FEATURED_POSTS,
  compressImage,
  fromDateInputValue,
  newBlockId,
  slugify,
  toDateInputValue,
} from '@/lib/blog';
import { RichTextEditor } from '@/components/blog/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type LocalImage = { url?: string; file?: File; preview?: string };

type EditorBlock =
  | { id: string; type: 'text'; html: string }
  | ({ id: string; type: 'image'; alt: string } & LocalImage)
  | { id: string; type: 'products'; productIds: string[] };

type Progress = { current: number; total: number } | 'saving' | null;

const COVER_KEY = 'cover';

function imageSource(image: LocalImage) {
  return image.preview || image.url || '';
}

function toEditorBlocks(content: BlogBlock[] | undefined): EditorBlock[] {
  return (content ?? []).map((block) => ({ ...block }));
}

function scrollToElement(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function ImagePicker({
  image,
  onPick,
  aspect,
  label,
}: {
  image: LocalImage;
  onPick: (file: File) => void;
  aspect: string;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const src = imageSource(image);

  return (
    <div className={cn('group relative overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50', aspect)}>
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500 hover:bg-slate-100"
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      )}
      {src && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-2 right-2 rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white opacity-90 hover:opacity-100"
        >
          Trocar foto
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}

function ProductsPicker({
  selectedIds,
  products,
  onChange,
}: {
  selectedIds: string[];
  products: Product[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const term = search.trim().toLowerCase();
  const options = products
    .filter((product) => !selectedIds.includes(product.id))
    .filter((product) => !term || product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term))
    .slice(0, 8);

  return (
    <div className="space-y-3">
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const product = byId.get(id);
            return (
              <span key={id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 text-sm">
                {product?.images[0] ? (
                  <img src={product.images[0]} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-slate-400" />
                )}
                <span className="max-w-[180px] truncate">{product?.name ?? 'Produto removido'}</span>
                <button
                  type="button"
                  onClick={() => onChange(selectedIds.filter((selected) => selected !== id))}
                  className="text-slate-400 hover:text-red-600"
                  aria-label={`Remover ${product?.name ?? 'produto'}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Nenhum produto escolhido ainda.</p>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar produto para adicionar..."
          className="pl-8"
        />
      </div>
      {options.length > 0 && (
        <div className="grid max-w-2xl grid-cols-1 gap-1 sm:grid-cols-2">
          {options.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onChange([...selectedIds, product.id])}
              className="flex items-center gap-2 rounded-md border border-transparent p-1.5 text-left text-sm hover:border-slate-200 hover:bg-white"
            >
              {product.images[0] ? (
                <img src={product.images[0]} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-100">
                  <Package className="h-4 w-4 text-slate-400" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-800">{product.name}</span>
                <span className="block truncate text-xs text-slate-500">
                  {product.category}
                  {!product.active && ' · inativo'}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [otherFeaturedCount, setOtherFeaturedCount] = useState(0);
  const [existingPost, setExistingPost] = useState<BlogPost | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [publishedDate, setPublishedDate] = useState(toDateInputValue(null));
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [cover, setCover] = useState<LocalImage>({});
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);

  const [progress, setProgress] = useState<Progress>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const multiImageInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const previews = previewsRef.current;
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setInitialLoading(true);
      try {
        const [categoriesResult, productsResult, postsResult, postResult] = await Promise.all([
          blogApi.listCategories(),
          productsApi.list({ all: true }),
          blogApi.listPosts({ all: true }),
          id ? blogApi.getPost(id) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        setCategories(categoriesResult.categories);
        setProducts(productsResult.products);
        setOtherFeaturedCount(postsResult.posts.filter((post) => post.featured && post.id !== id).length);

        if (postResult) {
          const post = postResult.post;
          setExistingPost(post);
          setTitle(post.title);
          setSubtitle(post.subtitle ?? '');
          setCategory(post.category);
          setPublishedDate(toDateInputValue(post.published_at));
          setPublished(post.published);
          setFeatured(post.featured);
          setCover({ url: post.cover_image });
          setBlocks(toEditorBlocks(post.content));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      }
      if (!cancelled) setInitialLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const makePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    previewsRef.current.add(url);
    return url;
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateBlock = (blockId: string, patch: Partial<EditorBlock>) => {
    setBlocks((current) =>
      current.map((block) => (block.id === blockId ? ({ ...block, ...patch } as EditorBlock) : block)),
    );
  };

  const addBlock = (type: EditorBlock['type']) => {
    const block: EditorBlock =
      type === 'text'
        ? { id: newBlockId(), type: 'text', html: '' }
        : type === 'image'
          ? { id: newBlockId(), type: 'image', alt: '' }
          : { id: newBlockId(), type: 'products', productIds: [] };
    setBlocks((current) => [...current, block]);
    requestAnimationFrame(() => scrollToElement(`block-${block.id}`));
  };

  const addImageBlocks = (files: FileList) => {
    const newBlocks: EditorBlock[] = Array.from(files).map((file) => ({
      id: newBlockId(),
      type: 'image',
      alt: '',
      file,
      preview: makePreview(file),
    }));
    setBlocks((current) => [...current, ...newBlocks]);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeBlock = (blockId: string) => {
    setBlocks((current) => current.filter((block) => block.id !== blockId));
    clearFieldError(blockId);
  };

  const fail = (message: string, errorKey?: string, elementId?: string) => {
    setFormError(message);
    if (errorKey) setFieldErrors((current) => ({ ...current, [errorKey]: message }));
    setProgress(null);
    requestAnimationFrame(() => scrollToElement(elementId ?? 'blog-form-top'));
  };

  const handleSave = async () => {
    setFormError(null);
    setFieldErrors({});

    if (!title.trim()) return fail('Informe o título do post.', 'title', 'field-title');
    if (!category) return fail('Escolha uma categoria.', 'category', 'field-category');
    if (!cover.url && !cover.file) return fail('Adicione a foto de capa.', COVER_KEY, 'field-cover');
    if (featured && otherFeaturedCount >= MAX_FEATURED_POSTS) {
      return fail(`Já existem ${MAX_FEATURED_POSTS} posts em destaque. Remova o destaque de outro post antes.`, 'featured', 'field-featured');
    }

    const emptyImage = blocks.find((block) => block.type === 'image' && !block.url && !block.file);
    if (emptyImage) {
      return fail('Há um bloco de foto sem imagem. Escolha a foto ou remova o bloco.', emptyImage.id, `block-${emptyImage.id}`);
    }

    let workingCover = { ...cover };
    let workingBlocks = blocks.map((block) => ({ ...block })) as EditorBlock[];

    const queue: { key: string; elementId: string; file: File; kind: 'cover' | 'content' }[] = [];
    if (workingCover.file) {
      queue.push({ key: COVER_KEY, elementId: 'field-cover', file: workingCover.file, kind: 'cover' });
    }
    for (const block of workingBlocks) {
      if (block.type === 'image' && block.file) {
        queue.push({ key: block.id, elementId: `block-${block.id}`, file: block.file, kind: 'content' });
      }
    }

    for (let index = 0; index < queue.length; index += 1) {
      const item = queue[index];
      setProgress({ current: index + 1, total: queue.length });
      try {
        const compressed = await compressImage(item.file);
        const { url } = await blogApi.uploadImage(compressed.blob, compressed.name, item.kind);

        if (item.key === COVER_KEY) {
          workingCover = { url, preview: workingCover.preview };
          setCover(workingCover);
        } else {
          workingBlocks = workingBlocks.map((block) =>
            block.id === item.key && block.type === 'image' ? { ...block, url, file: undefined } : block,
          );
          setBlocks((current) =>
            current.map((block) =>
              block.id === item.key && block.type === 'image' ? { ...block, url, file: undefined } : block,
            ),
          );
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'Erro desconhecido';
        const label = item.key === COVER_KEY ? 'a foto de capa' : `a foto ${index + 1} de ${queue.length}`;
        return fail(`Não foi possível enviar ${label}: ${reason}`, item.key, item.elementId);
      }
    }

    const content: BlogBlock[] = [];
    for (const block of workingBlocks) {
      if (block.type === 'text') {
        if (block.html.trim()) content.push({ id: block.id, type: 'text', html: block.html });
      } else if (block.type === 'image') {
        if (block.url) content.push({ id: block.id, type: 'image', url: block.url, alt: block.alt.trim() });
      } else if (block.productIds.length) {
        content.push({ id: block.id, type: 'products', productIds: block.productIds });
      }
    }

    const payload: BlogPostPayload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      category,
      cover_image: workingCover.url!,
      published_at: fromDateInputValue(publishedDate, existingPost?.published_at),
      published,
      featured,
      content,
    };

    setProgress('saving');
    try {
      if (isEditing && id) {
        await blogApi.updatePost(id, payload);
      } else {
        await blogApi.createPost(payload);
      }
      navigate('/admin/blog');
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Erro ao salvar o post');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Carregando post...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <FormAlert message={loadError} />
        <Button asChild variant="outline">
          <Link to="/admin/blog">Voltar para o blog</Link>
        </Button>
      </div>
    );
  }

  const busy = progress !== null;
  const featuredBlocked = !featured && otherFeaturedCount >= MAX_FEATURED_POSTS;

  return (
    <div id="blog-form-top" className="space-y-6 pb-24">
      {busy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-80 rounded-xl bg-white p-6 text-center shadow-2xl">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            {progress === 'saving' ? (
              <p className="font-semibold text-slate-900">Salvando post...</p>
            ) : (
              <>
                <p className="font-semibold text-slate-900">
                  Enviando Foto {progress.current} de {progress.total}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((progress.current - 1) / progress.total) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Comprimindo e otimizando as imagens...</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/blog" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Editar post' : 'Novo post'}</h2>
        </div>
      </div>

      {formError && (
        <div className="sticky top-4 z-40">
          <FormAlert message={formError} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div id="field-title" className="space-y-2">
              <Label htmlFor="post-title">Título *</Label>
              <Input
                id="post-title"
                value={title}
                maxLength={200}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearFieldError('title');
                }}
                placeholder="Ex.: Tendências de verão"
                className={cn('text-lg', fieldErrors.title && 'border-red-500 focus-visible:ring-red-500')}
              />
              <p className="text-xs text-slate-500">
                Endereço: /blog/{existingPost ? existingPost.slug : slugify(title || 'titulo-do-post')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-subtitle">Subtítulo / resumo</Label>
              <Textarea
                id="post-subtitle"
                value={subtitle}
                maxLength={400}
                rows={2}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Aparece abaixo do título, nos cards e na prévia ao compartilhar"
              />
            </div>
          </section>

          <section
            id="field-cover"
            className={cn(
              'space-y-3 rounded-xl border bg-white p-6 shadow-sm',
              fieldErrors[COVER_KEY] ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200',
            )}
          >
            <Label>Foto de capa *</Label>
            <ImagePicker
              image={cover}
              aspect="aspect-[1200/630]"
              label="Escolher foto de capa"
              onPick={(file) => {
                setCover({ file, preview: makePreview(file) });
                clearFieldError(COVER_KEY);
              }}
            />
            {fieldErrors[COVER_KEY] && <p className="text-sm font-medium text-red-600">{fieldErrors[COVER_KEY]}</p>}
            <p className="text-xs text-slate-500">
              Usada no topo do post, nos cards e como imagem ao compartilhar (recortada em formato de banner).
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Conteúdo</h3>

            {blocks.length === 0 && (
              <p className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Adicione blocos de texto, fotos ou produtos usando os botões abaixo.
              </p>
            )}

            {blocks.map((block, index) => {
              const error = fieldErrors[block.id];
              const typeLabel = block.type === 'text' ? 'Texto' : block.type === 'image' ? 'Foto' : 'Produtos';
              const TypeIcon = block.type === 'text' ? Type : block.type === 'image' ? ImageIcon : Package;
              return (
                <div
                  key={block.id}
                  id={`block-${block.id}`}
                  className={cn(
                    'rounded-xl border bg-white shadow-sm',
                    error ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200',
                  )}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <TypeIcon className="h-4 w-4" /> {typeLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveBlock(index, -1)} title="Mover para cima">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 1)} title="Mover para baixo">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => removeBlock(block.id)} title="Remover bloco">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    {block.type === 'text' && (
                      <RichTextEditor value={block.html} onChange={(html) => updateBlock(block.id, { html })} />
                    )}

                    {block.type === 'image' && (
                      <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
                        <ImagePicker
                          image={block}
                          aspect="aspect-[4/3]"
                          label="Escolher foto"
                          onPick={(file) => {
                            updateBlock(block.id, { file, preview: makePreview(file), url: undefined });
                            clearFieldError(block.id);
                          }}
                        />
                        <div className="space-y-2">
                          <Label htmlFor={`alt-${block.id}`}>Texto alternativo (opcional)</Label>
                          <Input
                            id={`alt-${block.id}`}
                            value={block.alt}
                            maxLength={300}
                            onChange={(event) => updateBlock(block.id, { alt: event.target.value })}
                            placeholder="Descreva a foto para acessibilidade"
                          />
                          <p className="text-xs text-slate-500">
                            Fotos seguidas, sem texto entre elas, viram uma grade no site.
                          </p>
                        </div>
                      </div>
                    )}

                    {block.type === 'products' && (
                      <ProductsPicker
                        selectedIds={block.productIds}
                        products={products}
                        onChange={(productIds) => updateBlock(block.id, { productIds })}
                      />
                    )}

                    {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <Button type="button" variant="outline" onClick={() => addBlock('text')}>
                <Type className="mr-2 h-4 w-4" /> Texto
              </Button>
              <Button type="button" variant="outline" onClick={() => addBlock('image')}>
                <ImageIcon className="mr-2 h-4 w-4" /> Foto
              </Button>
              <Button type="button" variant="outline" onClick={() => multiImageInputRef.current?.click()}>
                <Images className="mr-2 h-4 w-4" /> Várias fotos
              </Button>
              <Button type="button" variant="outline" onClick={() => addBlock('products')}>
                <Package className="mr-2 h-4 w-4" /> Produtos
              </Button>
              <input
                ref={multiImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.length) addImageBlocks(event.target.files);
                  event.target.value = '';
                }}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div id="field-category" className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  clearFieldError('category');
                }}
              >
                <SelectTrigger className={cn(fieldErrors.category && 'border-red-500 ring-2 ring-red-200')}>
                  <SelectValue placeholder="Escolha a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link to="/admin/blog/categorias" className="text-xs text-primary hover:underline">
                Gerenciar categorias
              </Link>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-date">Data de publicação</Label>
              <Input id="post-date" type="date" value={publishedDate} onChange={(event) => setPublishedDate(event.target.value)} />
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <span>
                <span className="block text-sm font-medium text-slate-900">Publicado</span>
                <span className="block text-xs text-slate-500">{published ? 'Visível no site' : 'Rascunho, oculto do site'}</span>
              </span>
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
                className="h-5 w-5 accent-green-500"
              />
            </label>

            <label
              id="field-featured"
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg border p-3',
                featuredBlocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                fieldErrors.featured ? 'border-red-500' : 'border-slate-200',
              )}
            >
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  <Star className="h-4 w-4 text-amber-400" /> Destaque
                </span>
                <span className="block text-xs text-slate-500">
                  {featuredBlocked
                    ? `Já há ${MAX_FEATURED_POSTS} posts em destaque`
                    : `Máximo de ${MAX_FEATURED_POSTS} ao mesmo tempo`}
                </span>
              </span>
              <input
                type="checkbox"
                checked={featured}
                disabled={featuredBlocked}
                onChange={(event) => {
                  setFeatured(event.target.checked);
                  clearFieldError('featured');
                }}
                className="h-5 w-5 accent-amber-400"
              />
            </label>
          </section>

          <Button type="button" onClick={handleSave} disabled={busy} className="w-full bg-green-500 py-6 text-base text-white hover:bg-green-600">
            {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isEditing ? 'Salvar alterações' : 'Salvar post'}
          </Button>
          {formError && <FormAlert message={formError} />}
        </aside>
      </div>
    </div>
  );
}
