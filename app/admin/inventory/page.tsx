'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Loader2,
  Plus,
  Minus,
  RefreshCw,
  Truck,
  Eye,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  category: { _id: string; name: string } | string;
  status: string;
  totalSold: number;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const params = use(searchParams);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState(params.filter || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingStock, setUpdatingStock] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchProducts();
  }, [token, user, router, page, search, stockFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(stockFilter !== 'all' && { stockFilter }),
      });
      const res = await api.get<{ data: PaginatedResponse<Product> }>(`/admin/inventory?${params}`, { token });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (product: Product, change: number) => {
    const newStock = Math.max(0, product.stock + change);
    setUpdatingStock(prev => ({ ...prev, [product._id]: true }));
    try {
      await api.put(`/admin/products/${product._id}/stock`, { stock: newStock }, { token });
      setProducts(products.map(p => p._id === product._id ? { ...p, stock: newStock } : p));
    } catch (error) {
      alert('Failed to update stock');
    } finally {
      setUpdatingStock(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const setStock = async (product: Product, newStock: number) => {
    setUpdatingStock(prev => ({ ...prev, [product._id]: true }));
    try {
      await api.put(`/admin/products/${product._id}/stock`, { stock: newStock }, { token });
      setProducts(products.map(p => p._id === product._id ? { ...p, stock: newStock } : p));
    } catch (error) {
      alert('Failed to update stock');
    } finally {
      setUpdatingStock(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) return { label: 'Out of Stock', class: 'text-red-600', bg: 'bg-red-100' };
    if (product.stock <= product.lowStockThreshold) return { label: 'Low Stock', class: 'text-gold', bg: 'bg-yellow-100' };
    return { label: 'In Stock', class: 'text-soft-green', bg: 'bg-green-100' };
  };

  const filteredProducts = products.filter(p => {
    if (stockFilter === 'out') return p.stock <= 0;
    if (stockFilter === 'low') return p.stock > 0 && p.stock <= p.lowStockThreshold;
    if (stockFilter === 'restock') return p.stock <= p.lowStockThreshold;
    if (stockFilter === 'ok') return p.stock > p.lowStockThreshold;
    return true;
  });

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

  return (
    <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow mb-2">ADMIN / INVENTORY</p>
            <h1 className="heading-section">Inventory Management</h1>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, icon: Package, color: 'text-forest' },
            { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length, icon: AlertTriangle, color: 'text-gold' },
            { label: 'Out of Stock', value: products.filter(p => p.stock <= 0).length, icon: Package, color: 'text-red-600' },
            { label: 'Well Stocked', value: products.filter(p => p.stock > p.lowStockThreshold).length, icon: Package, color: 'text-soft-green' },
          ].map((stat) => (
            <div key={stat.label} className="card-luxury p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-wide uppercase text-soft-green mb-2">{stat.label}</p>
                  <p className="text-3xl font-serif {stat.color}">{stat.value}</p>
                </div>
                <div className="p-3 bg-gold/10 rounded-xl text-gold">
                  <stat.icon size={24} aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
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
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="restock">Restock Alerts</SelectItem>
                <SelectItem value="ok">Well Stocked</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchProducts}>
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Inventory Table */}
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
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-32 h-6 bg-muted-cream rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto text-soft-green/30 mb-4" />
              <p className="text-soft-green">No products match your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-soft-border bg-muted-cream/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">SKU</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Threshold</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Sold</th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-soft-green">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soft-border">
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <tr key={product._id} className="hover:bg-muted-cream/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white border border-soft-border rounded-lg overflow-hidden flex-shrink-0">
                                {product.images[0] ? (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-full h-full text-soft-green/30 flex items-center justify-center" size={20} />
                                )}
                              </div>
                              <div>
                                <Link href={`/products/${product.slug}`} target="_blank" className="font-medium text-forest hover:text-gold transition-colors block">
                                  {product.name}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-text font-mono">{product.sku}</td>
                          <td className="px-6 py-4 text-sm text-dark-text">
                            {typeof product.category === 'object' ? product.category.name : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-forest font-medium">{formatPrice(product.price)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={product.stock}
                                onChange={(e) => setStock(product, parseInt(e.target.value) || 0)}
                                onBlur={() => {}}
                                disabled={updatingStock[product._id]}
                                className="w-20 px-2 py-1 border border-soft-border rounded-lg text-sm text-center focus:outline-none focus:border-gold"
                              />
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => adjustStock(product, 1)}
                                  disabled={updatingStock[product._id]}
                                  className="p-1 text-soft-green hover:text-forest hover:bg-muted-cream rounded transition-colors"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  onClick={() => adjustStock(product, -1)}
                                  disabled={updatingStock[product._id] || product.stock <= 0}
                                  className="p-1 text-soft-green hover:text-forest hover:bg-muted-cream rounded transition-colors disabled:opacity-50"
                                >
                                  <ArrowDown size={12} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-soft-green">{product.lowStockThreshold}</td>
                          <td className="px-6 py-4">
                            <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', stockStatus.bg, stockStatus.class)}>
                              {stockStatus.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-text">{product.totalSold}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/products/${product.slug}`} target="_blank" className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="View on Store">
                                <Eye size={16} />
                              </Link>
                              <button
                                onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                                className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors"
                                title="Edit Product"
                              >
                                <Truck size={16} />
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
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} products
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft size={16} />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                      
                      return (
                        <Button key={pageNum} variant={page === pageNum ? 'primary' : 'outline'} size="sm" onClick={() => setPage(pageNum)}>
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
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