'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Package,
  Tag,
  Star,
  AlertTriangle,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  category: { _id: string; name: string; slug: string } | string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  averageRating?: number;
  reviewCount?: number;
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function ProductsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchProducts();
    fetchCategories();
  }, [token, user, router, page, search, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      });
      const res = await api.get<{ data: PaginatedResponse<Product> }>(`/admin/products?${params}`, { token });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get<{ data: { _id: string; name: string }[] }>('/admin/categories', { token });
      setCategories(res.data.filter((category, index, all) => all.findIndex(item => item.name === category.name) === index));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/products/${id}`, { token });
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      alert('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) return { label: 'Out of Stock', class: 'text-red-600' };
    if (product.stock <= product.lowStockThreshold) return { label: 'Low Stock', class: 'text-gold' };
    return { label: 'In Stock', class: 'text-soft-green' };
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
        <div className="container-luxury text-center py-32">
          <p className="font-serif text-2xl text-forest mb-4">Access Restricted</p>
          <p className="text-soft-green mb-6">Please login as an admin to access this page.</p>
          <button onClick={() => router.push('/login')} className="btn-primary">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow mb-2">ADMIN / PRODUCTS</p>
            <h1 className="heading-section">Products</h1>
          </div>
          <Link href="/admin/products/add" className="btn-primary">
            <Plus size={18} className="mr-2" />
            Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="card-luxury p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-green/50" size={18} />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter((cat, index, all) => all.findIndex(item => item.name === cat.name) === index).map((cat) => (
                    <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="card-luxury overflow-hidden">
          {loading ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-soft-border py-4">
                  <div className="flex items-center gap-4 px-6">
                    <div className="w-16 h-16 bg-muted-cream rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-cream rounded w-1/4" />
                      <div className="h-3 bg-muted-cream rounded w-1/6" />
                    </div>
                    <div className="w-32 h-6 bg-muted-cream rounded" />
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-20 h-6 bg-muted-cream rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto text-soft-green/30 mb-4" />
              <p className="text-soft-green">No products found</p>
              <Link href="/admin/products/add" className="btn-primary mt-4 inline-flex">Add Your First Product</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-soft-border bg-muted-cream/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Rating</th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-soft-green">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soft-border">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <tr key={product._id} className="hover:bg-muted-cream/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-white border border-soft-border rounded-lg overflow-hidden flex-shrink-0">
                                {product.images[0] ? (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-full h-full text-soft-green/30 flex items-center justify-center" size={24} />
                                )}
                              </div>
                              <div>
                                <Link href={`/admin/products/${product._id}`} className="font-medium text-forest hover:text-gold transition-colors block">
                                  {product.name}
                                </Link>
                                <p className="text-xs text-soft-green">{product.sku}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {product.featured && <Tag className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded" size={10} />}
                                  {product.bestSeller && <Star className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded" size={10} />}
                                  {product.newArrival && <span className="text-xs bg-forest/10 text-forest px-2 py-0.5 rounded">New</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-dark-text">{typeof product.category === 'object' ? product.category.name : product.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-forest">{formatPrice(product.price)}</p>
                              {product.compareAtPrice && (
                                <p className="text-xs line-through text-soft-green">{formatPrice(product.compareAtPrice)}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={cn('font-medium', stockStatus.class)}>{product.stock}</span>
                              <span className={`text-xs ${stockStatus.class}`}>{stockStatus.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', statusColors[product.status])}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Star className="text-gold" size={14} fill="currentColor" />
                              <span className="text-sm text-forest">{product.averageRating?.toFixed(1) ?? 'N/A'}</span>
                              <span className="text-xs text-soft-green">({product.reviewCount ?? 0})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/products/${product._id}`} className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="Edit">
                                <Edit size={16} />
                              </Link>
                              <Link href={`/products/${product.slug}`} target="_blank" className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="View">
                                <Eye size={16} />
                              </Link>
                              <button
                                onClick={() => handleDelete(product._id)}
                                disabled={deletingId === product._id}
                                className="p-2 text-soft-green hover:text-red-600 hover:bg-muted-cream rounded-lg transition-colors"
                                title="Delete"
                              >
                                {deletingId === product._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-soft-border flex items-center justify-between">
                  <p className="text-sm text-soft-green">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} products
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}