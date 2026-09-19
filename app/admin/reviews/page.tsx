'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Flag,
  MessageSquare,
} from 'lucide-react';

interface Review {
  _id: string;
  product: { _id: string; name: string; slug: string; images: string[] };
  user: { _id: string; name: string; email: string; avatar?: string };
  rating: number;
  title: string;
  text: string;
  images: string[];
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  reported: number;
  adminResponse?: string;
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
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ReviewsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchReviews();
  }, [token, user, router, page, search, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(ratingFilter !== 'all' && { rating: ratingFilter }),
      });
      const res = await api.get<{ data: PaginatedResponse<Review> }>(`/admin/reviews?${params}`, { token });
      setReviews(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (review: Review, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(review._id);
    try {
      await api.put(`/admin/reviews/${review._id}/status`, { status: newStatus }, { token });
      setReviews(reviews.map(r => r._id === review._id ? { ...r, status: newStatus } : r));
      if (selectedReview?._id === review._id) {
        setSelectedReview({ ...selectedReview, status: newStatus });
      }
    } catch (error) {
      alert('Failed to update review status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdminResponse = async (review: Review) => {
    if (!adminResponse.trim()) return;
    try {
      await api.post(`/admin/reviews/${review._id}/response`, { response: adminResponse }, { token });
      setSelectedReview({ ...selectedReview!, adminResponse });
      setAdminResponse('');
      alert('Response posted successfully');
    } catch (error) {
      alert('Failed to post response');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < rating ? 'text-gold fill-current' : 'text-soft-green/30'} fill="currentColor" />
      ))}
    </div>
  );

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
            <p className="eyebrow mb-2">ADMIN / REVIEWS</p>
            <h1 className="heading-section">Reviews</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="card-luxury p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-green/50" size={18} />
              <Input
                placeholder="Search product, user, title..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="card-luxury overflow-hidden">
          {loading ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-soft-border py-6">
                  <div className="flex items-center gap-4 px-6">
                    <div className="w-12 h-12 bg-muted-cream rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-cream rounded w-1/4" />
                      <div className="h-3 bg-muted-cream rounded w-1/2" />
                    </div>
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-32 h-6 bg-muted-cream rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-soft-green/30 mb-4" />
              <p className="text-soft-green">No reviews found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-soft-border bg-muted-cream/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Rating</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Review</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-soft-green">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soft-border">
                    {reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-muted-cream/30 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/products/${review.product.slug}`} target="_blank" className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white border border-soft-border rounded-lg overflow-hidden flex-shrink-0">
                              {review.product.images[0] ? (
                                <img src={review.product.images[0]} alt={review.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full text-soft-green/30 flex items-center justify-center"><Star size={20} /></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-forest line-clamp-1">{review.product.name}</p>
                              <p className="text-xs text-soft-green">/{review.product.slug}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-forest font-medium text-sm">
                              {review.user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-dark-text">{review.user.name}</p>
                              <p className="text-xs text-soft-green">{review.user.email}</p>
                              {review.verified && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={10} /> Verified Purchase</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-forest">{review.rating}.0</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <p className="font-medium text-dark-text line-clamp-1">{review.title}</p>
                            <p className="text-sm text-soft-green line-clamp-2 mt-1">{review.text}</p>
                            {review.images.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {review.images.slice(0, 3).map((img, i) => (
                                  <img key={i} src={img} alt="" className="w-10 h-10 rounded object-cover" />
                                ))}
                                {review.images.length > 3 && <span className="w-10 h-10 rounded bg-muted-cream flex items-center justify-center text-xs text-soft-green">+{review.images.length - 3}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={review.status}
                            onChange={(e) => handleStatusChange(review, e.target.value as 'approved' | 'rejected')}
                            disabled={updatingId === review._id}
                            className={cn('px-2 py-1 text-xs font-medium rounded-full border-0 appearance-none cursor-pointer', statusColors[review.status])}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-soft-green">
                          {formatDate(review.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedReview(review); setAdminResponse(review.adminResponse || ''); }}
                              className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors"
                              title="View / Respond"
                            >
                              <Eye size={16} />
                            </button>
                            {review.status === 'approved' && review.adminResponse && (
                              <span className="p-2 text-green-600 hover:bg-muted-cream rounded-lg" title="Response posted">
                                <MessageSquare size={16} />
                              </span>
                            )}
                            <button className="p-2 text-soft-green hover:text-red-600 hover:bg-muted-cream rounded-lg transition-colors" title="Flag/Report">
                              <Flag size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-soft-border flex items-center justify-between">
                  <p className="text-sm text-soft-green">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} reviews
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

        {/* Admin Response Modal */}
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedReview(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-soft-border flex items-center justify-between">
                <h2 className="font-serif text-lg text-forest">Review Details</h2>
                <button onClick={() => setSelectedReview(null)} className="text-soft-green hover:text-forest">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center text-forest font-medium text-xl">
                    {selectedReview.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-forest">{selectedReview.user.name}</h3>
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[selectedReview.status])}>
                        {selectedReview.status}
                      </span>
                      {selectedReview.verified && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={10} /> Verified</span>}
                    </div>
                    <p className="text-sm text-soft-green">{selectedReview.user.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                
                <div className="border-t border-soft-border pt-4">
                  <p className="font-medium text-dark-text mb-1">{selectedReview.title}</p>
                  <p className="text-soft-green whitespace-pre-wrap">{selectedReview.text}</p>
                </div>

                {selectedReview.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-forest mb-2">Images</p>
                    <div className="flex gap-2">
                      {selectedReview.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-20 h-20 rounded object-cover" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-soft-border pt-4">
                  <Link href={`/products/${selectedReview.product.slug}`} target="_blank" className="text-sm text-gold hover:text-forest flex items-center gap-1">
                    <Eye size={14} /> View Product
                  </Link>
                </div>

                {selectedReview.status === 'approved' && (
                  <div className="border-t border-soft-border pt-4">
                    <h4 className="font-medium text-forest mb-2">Admin Response</h4>
                    {selectedReview.adminResponse ? (
                      <p className="text-soft-green bg-muted-cream/50 p-4 rounded-lg">{selectedReview.adminResponse}</p>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Write your response..."
                          rows={3}
                          className="w-full p-3 border border-soft-border rounded-lg focus:outline-none focus:border-gold"
                        />
                        <Button onClick={() => handleAdminResponse(selectedReview)} disabled={updatingId === selectedReview._id}>
                          {updatingId === selectedReview._id ? <Loader2 size={16} className="animate-spin mr-2" /> : null} Post Response
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}