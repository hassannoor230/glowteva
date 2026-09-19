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
  User,
  Users,
  Shield,
  Mail,
  Loader2,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Edit,
  Eye,
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const roleColors: Record<string, string> = {
  user: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
};

export default function UsersPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const currentUserId = user?.id;

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchUsers();
  }, [token, user, router, page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { isActive: String(statusFilter === 'active') }),
      });
      const res = await api.get<{ data: PaginatedResponse<User> }>(`/admin/users?${params}`, { token });
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

const handleStatusChange = async (targetUser: User, newStatus: boolean) => {
    if (targetUser._id === currentUserId) {
      alert('You cannot change your own status');
      return;
    }
    setUpdatingId(targetUser._id);
    try {
      await api.put(`/admin/users/${targetUser._id}`, { isActive: newStatus }, { token });
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, isActive: newStatus } : u));
    } catch (error) {
      alert('Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

const handleRoleChange = async (targetUser: User, newRole: 'user' | 'admin') => {
    if (targetUser._id === currentUserId) {
      alert('You cannot change your own role');
      return;
    }
    setUpdatingId(targetUser._id);
    try {
      await api.put(`/admin/users/${targetUser._id}`, { role: newRole }, { token });
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
    } catch (error) {
      alert('Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
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
            <p className="eyebrow mb-2">ADMIN / USERS</p>
            <h1 className="heading-section">Users</h1>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: 'text-forest' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-purple-600' },
            { label: 'Active', value: users.filter(u => u.isActive).length, icon: CheckCircle, color: 'text-soft-green' },
            { label: 'Verified', value: users.filter(u => u.emailVerified).length, icon: Mail, color: 'text-gold' },
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
                placeholder="Search name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card-luxury overflow-hidden">
          {loading ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-soft-border py-4">
                  <div className="flex items-center gap-4 px-6">
                    <div className="w-10 h-10 bg-muted-cream rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-cream rounded w-1/4" />
                      <div className="h-3 bg-muted-cream rounded w-1/6" />
                    </div>
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-32 h-6 bg-muted-cream rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-soft-green/30 mb-4" />
              <p className="text-soft-green">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-soft-border bg-muted-cream/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Email Verified</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Orders</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Total Spent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Last Login</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Joined</th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-soft-green">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soft-border">
                    {users.map((targetUser) => (
                      <tr key={targetUser._id} className={cn('hover:bg-muted-cream/30 transition-colors', !targetUser.isActive && 'opacity-50')}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-forest font-medium text-sm">
                              {targetUser.avatar ? (
                                <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                targetUser.name?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-dark-text">{targetUser.name}</p>
                              <p className="text-xs text-soft-green">{targetUser.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={targetUser.role}
                            onChange={(e) => handleRoleChange(targetUser, e.target.value as 'user' | 'admin')}
                            disabled={updatingId === targetUser._id || targetUser._id === currentUserId}
                            className={cn('px-2 py-1 text-xs font-medium rounded-full border-0 appearance-none cursor-pointer', roleColors[targetUser.role], targetUser._id === currentUserId && 'opacity-50 cursor-not-allowed')}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={targetUser.isActive}
                              onChange={(e) => handleStatusChange(targetUser, e.target.checked)}
                              disabled={updatingId === targetUser._id || targetUser._id === currentUserId}
                              className="sr-only peer"
                            />
                            <div className={cn('w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest', targetUser._id === currentUserId && 'opacity-50 cursor-not-allowed')}>
                            </div>
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex items-center gap-1 text-xs font-medium', targetUser.emailVerified ? 'text-green-600' : 'text-yellow-600')}>
                            {targetUser.emailVerified ? (
                              <>
                                <CheckCircle size={12} /> Verified
                              </>
                            ) : (
                              <>
                                <Mail size={12} /> Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-dark-text">{targetUser.orderCount}</td>
                        <td className="px-6 py-4 text-sm text-forest font-medium">
                          {targetUser.totalSpent > 0 ? `$${targetUser.totalSpent.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-soft-green">
                          {targetUser.lastLogin ? formatDate(targetUser.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-sm text-soft-green">
                          {formatDate(targetUser.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/users/${targetUser._id}`} className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="View Details">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-soft-border flex items-center justify-between">
                  <p className="text-sm text-soft-green">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} users
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