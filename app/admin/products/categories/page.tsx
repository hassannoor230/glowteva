'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  ArrowUpDown,
  GripVertical,
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    order: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchCategories();
  }, [token, user, router]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Category[] }>('/admin/categories', { token });
      setCategories(res.data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, formData, { token });
      } else {
        await api.post('/admin/categories', formData, { token });
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      alert('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      order: category.order,
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/categories/${id}`, { token });
      setCategories(categories.filter(c => c._id !== id));
    } catch (error) {
      alert('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      order: 0,
      isActive: true,
    });
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    resetForm();
    setShowForm(true);
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
            <p className="eyebrow mb-2">ADMIN / PRODUCTS / CATEGORIES</p>
            <h1 className="heading-section">Categories</h1>
          </div>
          <Button onClick={handleNewCategory}>
            <Plus size={18} className="mr-2" />
            Add Category
          </Button>
        </div>

        {showForm && (
          <div className="card-luxury p-6 mb-8 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg text-forest">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => { setShowForm(false); setEditingCategory(null); resetForm(); }} className="text-soft-green hover:text-forest">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} required />
                <p className="text-xs text-soft-green/70 mt-1">URL-friendly identifier</p>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={formData.image} onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input id="order" type="number" value={formData.order} onChange={e => setFormData(prev => ({ ...prev, order: e.target.value === '' ? 0 : Number(e.target.value) }))} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 text-gold border-soft-border rounded focus:ring-gold" />
                  <Label htmlFor="isActive" className="mb-0">Active</Label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : null} {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingCategory(null); resetForm(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div className="card-luxury overflow-hidden">
          {loading ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-soft-border py-4">
                  <div className="flex items-center gap-4 px-6">
                    <div className="w-10 h-10 bg-muted-cream rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-cream rounded w-1/4" />
                      <div className="h-3 bg-muted-cream rounded w-1/6" />
                    </div>
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-20 h-6 bg-muted-cream rounded" />
                    <div className="w-32 h-6 bg-muted-cream rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-soft-green/30 mb-4">
                <path d="M21 8.5V6a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 6v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                <path d="M3.31 16.06 12 12.06l8.69 4" />
                <path d="M5 12.19V16" />
                <path d="M19 12.19V16" />
              </svg>
              <p className="text-soft-green">No categories yet</p>
              <Button onClick={handleNewCategory} className="mt-4">Create Category</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-soft-border bg-muted-cream/50">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green w-10">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Products</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-soft-green">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-border">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-muted-cream/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-soft-green/70">
                          <GripVertical size={14} />
                          {category.order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {category.image && (
                            <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-forest">{category.name}</p>
                            <p className="text-xs text-soft-green">/{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-dark-text line-clamp-2 max-w-xs">{category.description || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-forest">{category.productCount} products</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(category)} className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            disabled={deletingId === category._id}
                            className="p-2 text-soft-green hover:text-red-600 hover:bg-muted-cream rounded-lg transition-colors"
                            title="Delete"
                          >
                            {deletingId === category._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}