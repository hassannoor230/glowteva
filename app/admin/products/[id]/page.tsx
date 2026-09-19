'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  X,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Star,
} from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().max(300, 'Short description must be under 300 characters').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  compareAtPrice: z.number().optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0).default(10),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  ingredients: z.array(z.string()).optional(),
  howToUse: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuthStore();
  const isEditing = params.id && params.id !== 'add';
  const productId = isEditing ? params.id as string : null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({});
  const [productOptions, setProductOptions] = useState<Array<{ name: string; values: string[] }>>([]);
  const [generatedVariants, setGeneratedVariants] = useState<Array<any>>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'draft',
      featured: false,
      bestSeller: false,
      newArrival: false,
      lowStockThreshold: 10,
      stock: 0,
      tags: [],
      images: [],
      ingredients: [],
    },
  });

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchCategories();
    if (isEditing) fetchProduct();
  }, [token, user, router, isEditing, productId]);

  const fetchCategories = async () => {
    try {
      const res = await api.get<{ data: Category[] }>('/admin/categories', { token });
      setCategories(res.data.filter((category, index, all) => all.findIndex(item => item.name === category.name) === index));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: any }>(`/admin/products/${productId}`, { token });
      const product = res.data;
      setValue('name', product.name);
      setValue('slug', product.slug);
      setValue('description', product.description);
      setValue('shortDescription', product.shortDescription || '');
      setValue('price', product.price);
      setValue('compareAtPrice', product.compareAtPrice || 0);
      setValue('sku', product.sku);
      setValue('stock', product.stock);
      setValue('lowStockThreshold', product.lowStockThreshold);
      setValue('category', typeof product.category === 'object' ? product.category.name : product.category);
      setValue('tags', product.tags || []);
      setValue('status', product.status);
      setValue('featured', product.featured);
      setValue('bestSeller', product.bestSeller);
      setValue('newArrival', product.newArrival);
      setValue('images', product.images || []);
      setValue('ingredients', product.ingredients || []);
      setValue('howToUse', product.howToUse || '');
      setValue('weight', product.weight || '');
      setValue('dimensions', product.dimensions || '');
      setImagePreviews(product.images || []);
      setProductOptions(product.options || []);
      setGeneratedVariants(product.variants || []);
    } catch (error) {
      alert('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingImages(prev => ({ ...prev, [index]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post<{ data: { url: string } }>('/admin/upload/image', formData, { token });
      const newPreviews = [...imagePreviews];
      newPreviews[index] = res.data.url;
      setImagePreviews(newPreviews);
      const currentImages = watch('images') || [];
      const newImages = [...currentImages];
      newImages[index] = res.data.url;
      setValue('images', newImages.filter(Boolean));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(index, file);
    }
  };

  const addImageSlot = () => {
    if (imagePreviews.length >= 10) return;
    const newPreviews = [...imagePreviews, ''];
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    const currentImages = watch('images') || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue('images', newImages);
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const tags = watch('tags') || [];
    if (checked) {
      setValue('tags', [...tags, tag]);
    } else {
      setValue('tags', tags.filter(t => t !== tag));
    }
  };

  const addProductAttribute = () => {
    setProductOptions((current) => [...current, { name: '', values: [] }]);
  };

  const updateProductAttribute = (index: number, field: 'name' | 'values', value: string) => {
    setProductOptions((current) => current.map((option, optionIndex) => {
      if (optionIndex !== index) return option;
      if (field === 'name') return { ...option, name: value };
      return { ...option, values: value.split(',').map((v) => v.trim()).filter(Boolean) };
    }));
  };

  const generateVariantsFromOptions = () => {
    const validOptions = productOptions.filter((option) => option.name.trim() && option.values.length > 0);
    if (!validOptions.length) {
      setGeneratedVariants([]);
      return;
    }

    const buildCombinations = (index: number, current: Record<string, string>, acc: Array<Record<string, string>>) => {
      if (index === validOptions.length) {
        acc.push({ ...current });
        return;
      }
      for (const value of validOptions[index].values) {
        buildCombinations(index + 1, { ...current, [validOptions[index].name]: value }, acc);
      }
    };

    const combinations: Array<Record<string, string>> = [];
    buildCombinations(0, {}, combinations);

    const existingMap = new Map((generatedVariants || []).map((variant) => [JSON.stringify(variant.options || {}), variant]));

    const nextVariants = combinations.map((options, index) => {
      const existing = existingMap.get(JSON.stringify(options));
      return {
        _id: existing?._id,
        sku: existing?.sku || `${(watch('sku') || 'PROD').replace(/\s+/g, '-').toUpperCase()}-${index + 1}`,
        options,
        price: existing?.price ?? watch('price') ?? 0,
        compareAtPrice: existing?.compareAtPrice ?? watch('compareAtPrice') ?? 0,
        stock: existing?.stock ?? 0,
        lowStockThreshold: existing?.lowStockThreshold ?? 5,
        image: existing?.image ?? '',
        images: existing?.images ?? [],
        barcode: existing?.barcode ?? '',
        status: existing?.status ?? 'active',
      };
    });

    setGeneratedVariants(nextVariants);
  };

  const updateVariantField = (index: number, field: 'sku' | 'price' | 'compareAtPrice' | 'stock' | 'lowStockThreshold' | 'image' | 'status', value: string | number) => {
    setGeneratedVariants((current) => current.map((variant, variantIndex) => {
      if (variantIndex !== index) return variant;
      return { ...variant, [field]: value };
    }));
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const cleanOptions = productOptions.filter((option) => option.name.trim() && option.values.length > 0);
      const cleanVariants = (generatedVariants || []).map((variant) => ({
        ...variant,
        price: Number(variant.price ?? data.price ?? 0),
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
        stock: Number(variant.stock ?? 0),
        lowStockThreshold: Number(variant.lowStockThreshold ?? 5),
      }));

      const payload = {
        ...data,
        shortDescription: data.shortDescription?.trim() || data.description.slice(0, 300),
        productType: data.category,
        thumbnail: data.images?.[0] || '',
        compareAtPrice: data.compareAtPrice || undefined,
        tags: data.tags || [],
        images: data.images || [],
        ingredients: data.ingredients || [],
        options: cleanOptions,
        variants: cleanVariants,
      };

      if (isEditing) {
        await api.put<{ data: any }>(`/admin/products/${productId}`, payload, { token });
      } else {
        await api.post<{ data: any }>('/admin/products', payload, { token });
      }
      router.push('/admin/products');
    } catch (error: any) {
      alert(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const tagOptions = ['organic', 'vegan', 'cruelty-free', 'paraben-free', 'sulfate-free', 'fragrance-free', 'bestseller', 'new', 'gift-set', 'travel-size'];

  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-muted-cream/30">
        <div className="container-luxury text-center py-32">
          <p className="font-serif text-2xl text-forest mb-4">Access Restricted</p>
          <p className="text-soft-green mb-6">Please login as an admin to access this page.</p>
          <button onClick={() => router.push('/login')} className="btn-primary">Go to Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
        <div className="container-luxury">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted-cream rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-luxury p-6 space-y-4">
                  <div className="h-4 bg-muted-cream rounded w-1/3" />
                  <div className="h-10 bg-muted-cream rounded" />
                  <div className="h-10 bg-muted-cream rounded" />
                  <div className="h-10 bg-muted-cream rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin/products" className="flex items-center gap-2 text-soft-green hover:text-forest mb-4">
              <ChevronLeft size={18} />
              Back to Products
            </Link>
            <p className="eyebrow mb-2">ADMIN / PRODUCTS</p>
            <h1 className="heading-section">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8" noValidate>
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card-luxury p-6 space-y-6">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" {...register('name')} placeholder="e.g., Radiant Glow Serum" />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" {...register('slug')} placeholder="radiant-glow-serum" />
                  {errors.slug && <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>}
                  <p className="text-xs text-soft-green/70 mt-1">URL-friendly identifier (lowercase, numbers, hyphens only)</p>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={v => setValue('category', v)} defaultValue={watch('category')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="w-[min(24rem,calc(100vw-2rem))] max-h-72 overflow-x-hidden overflow-y-auto rounded-md">
                      {categories.filter((cat, index, all) => all.findIndex(item => item.name === cat.name) === index).map(cat => (
                        <SelectItem key={cat._id} value={cat.name} className="whitespace-nowrap pr-10">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" {...register('sku')} placeholder="GTS-001" />
                  {errors.sku && <p className="text-red-600 text-xs mt-1">{errors.sku.message}</p>}
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className="card-luxury p-6 space-y-6">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Descriptions</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    {...register('shortDescription')}
                    rows={3}
                    placeholder="Brief summary for product cards (max 300 chars)"
                    maxLength={300}
                  />
                  <p className="text-xs text-soft-green/70 text-right mt-1">
                    {watch('shortDescription')?.length || 0}/300
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    rows={8}
                    placeholder="Detailed product description..."
                  />
                  {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card-luxury p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg text-forest">Product Images</h2>
                {imagePreviews.length < 10 && (
                  <button type="button" onClick={addImageSlot} className="btn-ghost text-sm">
                    <Plus size={16} className="mr-1" /> Add Image
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square bg-white border border-soft-border rounded-lg overflow-hidden">
                    {preview ? (
                      <>
                        <img src={preview} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 z-10 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(index, e)}
                        />
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center gap-2 text-soft-green border-2 border-dashed border-soft-border cursor-pointer hover:border-gold hover:bg-muted-cream/50 transition-colors">
                        <Upload size={24} />
                        <span className="text-xs">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(index, e)}
                        />
                      </label>
                    )}
                    {uploadingImages[index] && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-gold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="card-luxury p-6 space-y-6">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                  <Textarea
                    id="ingredients"
                    defaultValue={watch('ingredients')?.join('\n')}
                    {...register('ingredients', {
                      setValueAs: (value: string | string[] | undefined) => {
                        if (typeof value === 'string') return value.split('\n').filter(Boolean).map(s => s.trim());
                        return value || [];
                      },
                    })}
                    rows={4}
                    placeholder="Aqua\nGlycerin\nVitamin C..."
                  />
                </div>
                <div>
                  <Label htmlFor="howToUse">How to Use</Label>
                  <Textarea
                    id="howToUse"
                    {...register('howToUse')}
                    rows={4}
                    placeholder="Apply 2-3 drops to clean skin..."
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input id="weight" {...register('weight')} placeholder="e.g., 30ml / 1 fl oz" />
                </div>
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input id="dimensions" {...register('dimensions')} placeholder="e.g., 4 x 4 x 12 cm" />
                </div>
              </div>
            </div>

            <div className="card-luxury p-6 space-y-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-lg text-forest">Product Variations</h2>
                <button type="button" className="btn-ghost text-sm" onClick={addProductAttribute}>+ Add Attribute</button>
              </div>

              <div className="space-y-4">
                {productOptions.length === 0 && (
                  <p className="text-sm text-soft-green">No variations yet. Add options like Size, Weight, ml, etc.</p>
                )}
                {productOptions.map((option, index) => (
                  <div key={`option-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 border border-soft-border p-3 rounded-lg bg-muted-cream/40">
                    <Input
                      value={option.name}
                      onChange={(e) => updateProductAttribute(index, 'name', e.target.value)}
                      placeholder="Attribute name (Size, ml, Weight, Material)"
                    />
                    <Input
                      value={option.values.join(', ')}
                      onChange={(e) => updateProductAttribute(index, 'values', e.target.value)}
                      placeholder="Values comma separated (S, M, L or 50ml, 100ml)"
                    />
                    <button
                      type="button"
                      className="text-red-500 text-sm px-2"
                      onClick={() => setProductOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="button" className="btn-outline" onClick={generateVariantsFromOptions}>Generate Variants</button>
              </div>

              {generatedVariants.length > 0 && (
                <div className="space-y-3 overflow-x-auto">
                  <h3 className="font-serif text-md text-forest">Generated Variant List</h3>
                  <div className="min-w-[760px] border border-soft-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted-cream text-forest">
                        <tr>
                          <th className="p-2">Options</th>
                          <th className="p-2">SKU</th>
                          <th className="p-2">Price</th>
                          <th className="p-2">Stock</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedVariants.map((variant, index) => (
                          <tr key={`${variant.sku || index}`} className="border-t border-soft-border align-top">
                            <td className="p-2">{Object.entries(variant.options || {}).map(([key, value]) => `${key}: ${value}`).join(' / ')}</td>
                            <td className="p-2"><Input value={variant.sku || ''} onChange={(e) => updateVariantField(index, 'sku', e.target.value)} /></td>
                            <td className="p-2"><Input type="number" value={variant.price ?? ''} onChange={(e) => updateVariantField(index, 'price', Number(e.target.value || 0))} /></td>
                            <td className="p-2"><Input type="number" value={variant.stock ?? 0} onChange={(e) => updateVariantField(index, 'stock', Number(e.target.value || 0))} /></td>
                            <td className="p-2">
                              <select value={variant.status || 'active'} onChange={(e) => updateVariantField(index, 'status', e.target.value)} className="w-full border border-soft-border rounded-md px-2 py-2 text-sm bg-white">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="out_of_stock">Out of Stock</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="card-luxury p-6 space-y-4">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Pricing</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Compare At Price</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('compareAtPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-soft-green/70 mt-1">Original price for sale display</p>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="card-luxury p-6 space-y-4">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Inventory</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    {...register('stock', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="0"
                    {...register('lowStockThreshold', { valueAsNumber: true })}
                    placeholder="10"
                  />
                  <p className="text-xs text-soft-green/70 mt-1">Alert when stock falls below this</p>
                </div>
              </div>
            </div>

            {/* Status & Tags */}
            <div className="card-luxury p-6 space-y-4">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Status & Tags</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={v => setValue('status', v as any)} defaultValue={watch('status')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map(tag => (
                      <label key={tag} className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={watch('tags')?.includes(tag)}
                          onChange={(e) => handleTagChange(tag, e.target.checked)}
                          className="w-4 h-4 text-gold border-soft-border rounded focus:ring-gold"
                        />
                        <span className="text-sm text-dark-text capitalize">{tag.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="card-luxury p-6 space-y-4">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Badges</h2>
              <div className="space-y-3">
                {[
                  { key: 'featured' as const, label: 'Featured', icon: Star },
                  { key: 'bestSeller' as const, label: 'Best Seller', icon: Star },
                  { key: 'newArrival' as const, label: 'New Arrival', icon: ImageIcon },
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <Switch
                      checked={Boolean(watch(key))}
                      onCheckedChange={checked => setValue(key, checked)}
                    />
                    <span className="text-sm text-dark-text">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="card-luxury p-6">
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={saving || isSubmitting}>
                  {saving || isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      {isEditing ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </Button>
                <Link href="/admin/products" className="btn-outline flex-1 justify-center">
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}