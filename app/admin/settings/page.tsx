'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  Loader2,
  Plus,
  Image as ImageIcon,
  Upload,
  X,
  Palette,
  Newspaper,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Truck,
  Mail,
  Eye,
  Edit,
} from 'lucide-react';

interface Settings {
  site: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    favicon: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialLinks: {
      instagram: string;
      facebook: string;
      twitter: string;
      pinterest: string;
      youtube: string;
      tiktok: string;
    };
    seo: {
      metaTitle: string;
      metaDescription: string;
      ogImage: string;
    };
  };
  hero: Array<{
    _id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    position: number;
    active: boolean;
  }>;
  blog: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    author: string;
    tags: string[];
    published: boolean;
    publishedAt?: string;
    createdAt: string;
  }>;
  media: Array<{
    _id: string;
    url: string;
    alt: string;
    type: 'image' | 'video';
    folder: string;
    size: number;
    uploadedAt: string;
  }>;
}

export default function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const params = use(searchParams);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(params.tab || 'general');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchSettings();
  }, [token, user, router]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Settings }>('/admin/settings', { token });
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string, data: any) => {
    setSaving(section);
    try {
      await api.put(`/admin/settings/${section}`, data, { token });
      // Update local state
      setSettings(prev => prev ? { ...prev, [section]: data } : null);
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
    } catch (error: any) {
      alert(error.message || 'Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  const handleMediaUpload = async (file: File) => {
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ data: { url: string; _id: string } }>('/admin/upload/media', formData, { token });
      if (settings) {
        const newMedia = {
          _id: res.data._id,
          url: res.data.url,
          alt: file.name,
          type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
          folder: 'general',
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setSettings({ ...settings, media: [newMedia, ...settings.media] });
      }
      return res.data.url;
    } catch (error) {
      alert('Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

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

  const generalSettings = settings?.site || {
    name: '',
    tagline: '',
    description: '',
    logo: '',
    favicon: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
      pinterest: '',
      youtube: '',
      tiktok: '',
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      ogImage: '',
    },
  };

  const handleGeneralChange = (field: string, value: any) => {
    const newSettings = { ...generalSettings };
    if (field.startsWith('socialLinks.')) {
      const child = field.split('.')[1];
      newSettings.socialLinks = { ...newSettings.socialLinks, [child]: value };
    } else if (field.startsWith('seo.')) {
      const child = field.split('.')[1];
      newSettings.seo = { ...newSettings.seo, [child]: value };
    } else {
      newSettings[field as keyof typeof newSettings] = value;
    }
    setSettings(prev => prev ? { ...prev, site: newSettings } : null);
  };

  return (
    <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow mb-2">ADMIN / SETTINGS</p>
            <h1 className="heading-section">Settings</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="general">
              <Globe className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="hero">
              <Palette className="mr-2 h-4 w-4" />
              Hero Sections
            </TabsTrigger>
            <TabsTrigger value="blog">
              <Newspaper className="mr-2 h-4 w-4" />
              Blog & Pages
            </TabsTrigger>
            <TabsTrigger value="media">
              <ImageIcon className="mr-2 h-4 w-4" />
              Media Library
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-8">
            <div className="card-luxury p-6 space-y-6">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Site Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName">Site Name *</Label>
                  <Input id="siteName" value={generalSettings.name} onChange={e => handleGeneralChange('name', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" value={generalSettings.tagline} onChange={e => handleGeneralChange('tagline', e.target.value)} placeholder="Pure by Nature. Luxury by Choice." />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={generalSettings.description} onChange={e => handleGeneralChange('description', e.target.value)} rows={3} />
                </div>
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input id="logo" value={generalSettings.logo} onChange={e => handleGeneralChange('logo', e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input id="favicon" value={generalSettings.favicon} onChange={e => handleGeneralChange('favicon', e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <Button onClick={() => handleSave('site', generalSettings)} disabled={saving === 'site'}>
                {saving === 'site' ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} Save General Settings
              </Button>
            </div>

            <div className="card-luxury p-6 space-y-6">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" value={generalSettings.contactEmail} onChange={e => handleGeneralChange('contactEmail', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" value={generalSettings.contactPhone} onChange={e => handleGeneralChange('contactPhone', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={generalSettings.address} onChange={e => handleGeneralChange('address', e.target.value)} rows={3} />
                </div>
              </div>
            </div>

            <div className="card-luxury p-6 space-y-6">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(generalSettings.socialLinks).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                    <Input
                      id={key}
                      value={value}
                      onChange={e => handleGeneralChange(`socialLinks.${key}`, e.target.value)}
                      placeholder={`https://${key}.com/yourhandle`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="card-luxury p-6 space-y-6">
              <h2 className="font-serif text-lg text-forest border-b border-soft-border pb-3">SEO Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input id="metaTitle" value={generalSettings.seo.metaTitle} onChange={e => handleGeneralChange('seo.metaTitle', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input id="ogImage" value={generalSettings.seo.ogImage} onChange={e => handleGeneralChange('seo.ogImage', e.target.value)} placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea id="metaDescription" value={generalSettings.seo.metaDescription} onChange={e => handleGeneralChange('seo.metaDescription', e.target.value)} rows={3} maxLength={160} />
                  <p className="text-xs text-soft-green/70 text-right mt-1">{generalSettings.seo.metaDescription?.length || 0}/160</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Hero Sections */}
          <TabsContent value="hero" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-forest">Hero Sections</h2>
              <Button variant="outline" onClick={() => {
                const newHero = {
                  _id: `temp-${Date.now()}`,
                  title: '',
                  subtitle: '',
                  description: '',
                  image: '',
                  ctaText: 'Shop Now',
                  ctaLink: '/shop',
                  position: (settings?.hero?.length || 0) + 1,
                  active: false,
                };
                setSettings(prev => prev ? { ...prev, hero: [...(prev.hero || []), newHero] } : null);
              }}>
                <Plus size={18} className="mr-2" /> Add Hero
              </Button>
            </div>

            <div className="grid gap-6">
              {settings?.hero?.map((hero, index) => (
                <div key={hero._id} className="card-luxury p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-medium">{index + 1}</span>
                      <div>
                        <input
                          type="text"
                          value={hero.title}
                          onChange={e => {
                            const updated = [...(settings?.hero || [])];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setSettings(prev => prev ? { ...prev, hero: updated } : null);
                          }}
                          placeholder="Hero Title"
                          className="font-serif text-lg text-forest bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gold/20 rounded px-2 py-1"
                        />
                        {hero.active && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Active</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = (settings?.hero || []).filter((_, i) => i !== index);
                        setSettings(prev => prev ? { ...prev, hero: updated } : null);
                      }}
                      className="p-2 text-soft-green hover:text-red-600 hover:bg-muted-cream rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`subtitle-${index}`}>Subtitle</Label>
                      <Input
                        id={`subtitle-${index}`}
                        value={hero.subtitle}
                        onChange={e => {
                          const updated = [...(settings?.hero || [])];
                          updated[index] = { ...updated[index], subtitle: e.target.value };
                          setSettings(prev => prev ? { ...prev, hero: updated } : null);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ctaText-${index}`}>CTA Text</Label>
                      <Input
                        id={`ctaText-${index}`}
                        value={hero.ctaText}
                        onChange={e => {
                          const updated = [...(settings?.hero || [])];
                          updated[index] = { ...updated[index], ctaText: e.target.value };
                          setSettings(prev => prev ? { ...prev, hero: updated } : null);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ctaLink-${index}`}>CTA Link</Label>
                      <Input
                        id={`ctaLink-${index}`}
                        value={hero.ctaLink}
                        onChange={e => {
                          const updated = [...(settings?.hero || [])];
                          updated[index] = { ...updated[index], ctaLink: e.target.value };
                          setSettings(prev => prev ? { ...prev, hero: updated } : null);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`position-${index}`}>Position</Label>
                      <Input
                        id={`position-${index}`}
                        type="number"
                        value={hero.position}
                        onChange={e => {
                          const updated = [...(settings?.hero || [])];
                          updated[index] = { ...updated[index], position: parseInt(e.target.value) };
                          setSettings(prev => prev ? { ...prev, hero: updated } : null);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={hero.description}
                      onChange={e => {
                        const updated = [...(settings?.hero || [])];
                        updated[index] = { ...updated[index], description: e.target.value };
                        setSettings(prev => prev ? { ...prev, hero: updated } : null);
                      }}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`hero-image-${index}`}>Background Image</Label>
                    <div className="flex items-center gap-4">
                      {hero.image && (
                        <div className="relative w-32 h-20 bg-white border border-soft-border rounded-lg overflow-hidden flex-shrink-0">
                          <img src={hero.image} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(settings?.hero || [])];
                              updated[index] = { ...updated[index], image: '' };
                              setSettings(prev => prev ? { ...prev, hero: updated } : null);
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <Input
                        id={`hero-image-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleMediaUpload(file);
                            if (url) {
                              const updated = [...(settings?.hero || [])];
                              updated[index] = { ...updated[index], image: url };
                              setSettings(prev => prev ? { ...prev, hero: updated } : null);
                            }
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-soft-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hero.active}
                        onChange={e => {
                          const updated = (settings?.hero || []).map((h, i) => ({
                            ...h,
                            active: i === index ? e.target.checked : false,
                          }));
                          setSettings(prev => prev ? { ...prev, hero: updated } : null);
                        }}
                        className="w-4 h-4 text-gold border-soft-border rounded focus:ring-gold"
                      />
                      <span className="text-sm text-dark-text">Set as Active Hero</span>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSave('hero', settings?.hero || [])}
                      disabled={saving === 'hero'}
                    >
                      {saving === 'hero' ? <Loader2 size={16} className="animate-spin mr-1" /> : <Save size={16} className="mr-1" />} Save Hero Sections
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {(!settings?.hero || settings.hero.length === 0) && (
              <div className="card-luxury p-12 text-center">
                <Palette size={48} className="mx-auto text-soft-green/30 mb-4" />
                <p className="text-soft-green">No hero sections configured</p>
                <Button variant="outline" onClick={() => {
                  const newHero = {
                    _id: `temp-${Date.now()}`,
                    title: '',
                    subtitle: '',
                    description: '',
                    image: '',
                    ctaText: 'Shop Now',
                    ctaLink: '/shop',
                    position: 1,
                    active: true,
                  };
                  setSettings(prev => prev ? { ...prev, hero: [newHero] } : null);
                }} className="mt-4">
                  <Plus size={18} className="mr-2" /> Create First Hero
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Blog & Pages */}
          <TabsContent value="blog" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-forest">Blog Posts & Pages</h2>
              <Button variant="outline">
                <Plus size={18} className="mr-2" /> Add Post
              </Button>
            </div>

            <div className="card-luxury overflow-hidden">
              {settings?.blog?.length === 0 ? (
                <div className="p-12 text-center">
                  <Newspaper size={48} className="mx-auto text-soft-green/30 mb-4" />
                  <p className="text-soft-green">No blog posts yet</p>
                  <Button variant="outline" className="mt-4">Create First Post</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-soft-border bg-muted-cream/50">
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Author</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Published</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Created</th>
                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-soft-green">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-soft-border">
                      {settings?.blog?.map((post) => (
                        <tr key={post._id} className="hover:bg-muted-cream/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {post.featuredImage && (
                                <img src={post.featuredImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div>
                                <p className="font-medium text-forest line-clamp-1">{post.title}</p>
                                <p className="text-xs text-soft-green">/{post.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-text">{post.author}</td>
                          <td className="px-6 py-4">
                            <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-soft-green">
                            {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-soft-green">
                            {formatDate(post.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/journal/${post.slug}`} target="_blank" className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="View">
                                <Eye size={16} />
                              </Link>
                              <button className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="Edit">
                                <Edit size={16} />
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
          </TabsContent>

          {/* Media Library */}
          <TabsContent value="media" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-forest">Media Library</h2>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    for (const file of files) {
                      await handleMediaUpload(file);
                    }
                  }}
                  className="hidden"
                  id="media-upload"
                />
                <Button variant="outline" onClick={() => document.getElementById('media-upload')?.click()}>
                  <Upload size={18} className="mr-2" /> Upload
                </Button>
              </div>
            </div>

            <div className="card-luxury p-6">
              {settings?.media?.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon size={48} className="mx-auto text-soft-green/30 mb-4" />
                  <p className="text-soft-green">No media uploaded yet</p>
                  <Button variant="outline" onClick={() => document.getElementById('media-upload')?.click()} className="mt-4">
                    <Upload size={18} className="mr-2" /> Upload Files
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {settings?.media?.map((media) => (
                    <div key={media._id} className="relative group aspect-square bg-white border border-soft-border rounded-lg overflow-hidden">
                      {media.type === 'image' ? (
                        <img src={media.url} alt={media.alt} className="w-full h-full object-cover" />
                      ) : (
                        <video src={media.url} className="w-full h-full object-cover" muted />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <button className="p-2 bg-white rounded-lg" title="Copy URL">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 bg-white rounded-lg text-red-600" title="Delete">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-xs truncate">{media.alt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}