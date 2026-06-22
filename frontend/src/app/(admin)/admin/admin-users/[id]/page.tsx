'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Shield, Check, X, Loader2, User, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export default function AdminUserDetailsPage() {
  const { token, user, isInitialized } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [allPermissions, setAllPermissions] = useState<Record<string, Permission[]>>({});
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      setAuthChecked(true);
      if (user && user.role !== 'SUPER_ADMIN') {
        router.push('/admin');
      }
    }
  }, [user, router, isInitialized]);

  const fetchAdminUser = async () => {
    if (!token || !userId) return;
    try {
      const users = await authApi.getAdminUsers(token);
      const found = users.find((u: AdminUser) => u.id === userId);
      if (!found) {
        setError('Admin user not found');
        return;
      }
      setAdminUser(found);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin user');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    if (!token || !adminUser) return;
    try {
      const [permissionsByCategory, rolePermissions] = await Promise.all([
        authApi.getPermissionsByCategory(token),
        authApi.getRolePermissions(token, adminUser.role),
      ]);
      setAllPermissions(permissionsByCategory);
      setUserPermissions(rolePermissions);
    } catch (err: any) {
      setError(err.message || 'Failed to load permissions');
    }
  };

  useEffect(() => {
    if (authChecked && token && userId) {
      fetchAdminUser();
    }
  }, [authChecked, token, userId]);

  useEffect(() => {
    if (adminUser) {
      fetchPermissions();
    }
  }, [adminUser, token]);

  const hasPermission = (permissionName: string) => {
    return userPermissions.some(p => p.name === permissionName);
  };

  const togglePermission = async (permission: Permission) => {
    if (!token || !adminUser) return;
    setUpdating(true);
    try {
      if (hasPermission(permission.name)) {
        await authApi.removePermission(token, {
          role: adminUser.role,
          permissionId: permission.id,
        });
        setUserPermissions(userPermissions.filter(p => p.id !== permission.id));
      } else {
        await authApi.assignPermission(token, {
          role: adminUser.role,
          permissionId: permission.id,
        });
        setUserPermissions([...userPermissions, permission]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
    } finally {
      setUpdating(false);
    }
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (error || !adminUser) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {error || 'Admin user not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Users
      </button>

      {/* User Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-bold text-2xl">
              {adminUser.firstName?.charAt(0) || adminUser.email.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {adminUser.firstName} {adminUser.lastName}
              </h1>
              <p className="text-sm text-gray-500">{adminUser.email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            adminUser.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
            adminUser.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
            adminUser.role === 'STAFF' ? 'bg-green-100 text-green-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {adminUser.role}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">{adminUser.firstName} {adminUser.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{adminUser.email}</p>
            </div>
          </div>
          {adminUser.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{adminUser.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(adminUser.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
          {updating && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {Object.keys(allPermissions).length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No permissions available</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(allPermissions).map(([category, permissions]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <button
                      key={permission.id}
                      onClick={() => togglePermission(permission)}
                      disabled={updating || adminUser.role === 'SUPER_ADMIN'}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        hasPermission(permission.name)
                          ? 'bg-violet-50 border-violet-200 text-violet-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {hasPermission(permission.name) ? (
                        <Check className="w-4 h-4 text-violet-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium">{permission.name}</p>
                        {permission.description && (
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {adminUser.role === 'SUPER_ADMIN' && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
            SUPER_ADMIN has all permissions by default. Permissions cannot be modified.
          </div>
        )}
      </div>
    </div>
  );
}
