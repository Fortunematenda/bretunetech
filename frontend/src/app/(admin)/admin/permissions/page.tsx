'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, Check, X, RefreshCw, ChevronDown, ChevronUp, Plus, Trash2, Edit2 } from 'lucide-react';
import { authApi, customRolesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
}

interface RolePermissions {
  role: string;
  permissions: Permission[];
}

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  _count: {
    users: number;
    permissions: number;
  };
}

export default function PermissionsPage() {
  const { token, user, isInitialized } = useAuthStore();
  const router = useRouter();
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({});
  const [rolePermissions, setRolePermissions] = useState<Record<string, Set<string>>>({
    ADMIN: new Set(),
    STAFF: new Set(),
    VENDOR: new Set(),
  });
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [customRolePermissions, setCustomRolePermissions] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedCustomRole, setSelectedCustomRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      setAuthChecked(true);
      if (user && user.role !== 'SUPER_ADMIN') {
        router.push('/admin');
      }
    }
  }, [user, router, isInitialized]);

  const fetchPermissions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [grouped, adminPerms, staffPerms, vendorPerms, roles] = await Promise.all([
        authApi.getPermissionsByCategory(token),
        authApi.getRolePermissions(token, 'ADMIN'),
        authApi.getRolePermissions(token, 'STAFF'),
        authApi.getRolePermissions(token, 'VENDOR'),
        customRolesApi.getCustomRoles(token),
      ]);

      setPermissionsByCategory(grouped);
      setRolePermissions({
        ADMIN: new Set(adminPerms.map((p: Permission) => p.id)),
        STAFF: new Set(staffPerms.map((p: Permission) => p.id)),
        VENDOR: new Set(vendorPerms.map((p: Permission) => p.id)),
      });
      setCustomRoles(roles);

      // Fetch permissions for each custom role
      const customPerms: Record<string, Set<string>> = {};
      for (const role of roles) {
        const perms = await customRolesApi.getCustomRolePermissions(token, role.id);
        customPerms[role.id] = new Set(perms.map((p: Permission) => p.id));
      }
      setCustomRolePermissions(customPerms);

      // Expand all categories by default
      setExpandedCategories(new Set(Object.keys(grouped)));
    } catch (err: any) {
      setError(err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && token) {
      fetchPermissions();
    }
  }, [authChecked, token]);

  const togglePermission = async (role: string, permissionId: string) => {
    if (!token) return;
    const hasPermission = rolePermissions[role].has(permissionId);
    setSaving(prev => ({ ...prev, [`${role}-${permissionId}`]: true }));

    try {
      if (hasPermission) {
        await authApi.removePermission(token, { role, permissionId });
        setRolePermissions(prev => ({
          ...prev,
          [role]: new Set([...prev[role]].filter(id => id !== permissionId)),
        }));
      } else {
        await authApi.assignPermission(token, { role, permissionId });
        setRolePermissions(prev => ({
          ...prev,
          [role]: new Set([...prev[role], permissionId]),
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
    } finally {
      setSaving(prev => ({ ...prev, [`${role}-${permissionId}`]: false }));
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleAllInCategory = async (role: string, category: string) => {
    if (!token) return;
    const permissions = permissionsByCategory[category] || [];
    const allSelected = permissions.every(p => rolePermissions[role].has(p.id));

    setSaving(prev => ({ ...prev, [`${role}-${category}`]: true }));

    try {
      if (allSelected) {
        // Remove all
        for (const perm of permissions) {
          await authApi.removePermission(token, { role, permissionId: perm.id });
        }
        setRolePermissions(prev => ({
          ...prev,
          [role]: new Set([...prev[role]].filter(id => !permissions.some(p => p.id === id))),
        }));
      } else {
        // Add all
        for (const perm of permissions) {
          await authApi.assignPermission(token, { role, permissionId: perm.id });
        }
        setRolePermissions(prev => ({
          ...prev,
          [role]: new Set([...prev[role], ...permissions.map(p => p.id)]),
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setSaving(prev => ({ ...prev, [`${role}-${category}`]: false }));
    }
  };

  const createCustomRole = async () => {
    if (!token || !newRoleName.trim()) return;
    setSaving(prev => ({ ...prev, createRole: true }));

    try {
      await customRolesApi.createCustomRole(token, {
        name: newRoleName,
        description: newRoleDescription || undefined,
      });
      setNewRoleName('');
      setNewRoleDescription('');
      setShowCreateRoleModal(false);
      fetchPermissions();
    } catch (err: any) {
      setError(err.message || 'Failed to create custom role');
    } finally {
      setSaving(prev => ({ ...prev, createRole: false }));
    }
  };

  const deleteCustomRole = async (roleId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this custom role?')) return;

    setSaving(prev => ({ ...prev, [`delete-${roleId}`]: true }));

    try {
      await customRolesApi.deleteCustomRole(token, roleId);
      fetchPermissions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete custom role');
    } finally {
      setSaving(prev => ({ ...prev, [`delete-${roleId}`]: false }));
    }
  };

  const toggleCustomRolePermission = async (customRoleId: string, permissionId: string) => {
    if (!token) return;
    const hasPermission = customRolePermissions[customRoleId]?.has(permissionId);
    setSaving(prev => ({ ...prev, [`custom-${customRoleId}-${permissionId}`]: true }));

    try {
      if (hasPermission) {
        await customRolesApi.removePermissionFromCustomRole(token, {
          customRoleId,
          permissionId,
        });
        setCustomRolePermissions(prev => ({
          ...prev,
          [customRoleId]: new Set([...(prev[customRoleId] || [])].filter(id => id !== permissionId)),
        }));
      } else {
        await customRolesApi.assignPermissionToCustomRole(token, {
          customRoleId,
          permissionId,
        });
        setCustomRolePermissions(prev => ({
          ...prev,
          [customRoleId]: new Set([...(prev[customRoleId] || []), permissionId]),
        }));
      }
    } catch (err: any) {
      // If conflict (409), the permission is already assigned - update local state
      if (err.message?.includes('already assigned') || err.status === 409) {
        setCustomRolePermissions(prev => ({
          ...prev,
          [customRoleId]: new Set([...(prev[customRoleId] || []), permissionId]),
        }));
      } else {
        setError(err.message || 'Failed to update permission');
      }
    } finally {
      setSaving(prev => ({ ...prev, [`custom-${customRoleId}-${permissionId}`]: false }));
    }
  };

  const toggleAllInCategoryForCustomRole = async (customRoleId: string, category: string) => {
    if (!token) return;
    const permissions = permissionsByCategory[category] || [];
    const allSelected = permissions.every(p => customRolePermissions[customRoleId]?.has(p.id));

    setSaving(prev => ({ ...prev, [`custom-${customRoleId}-${category}`]: true }));

    try {
      if (allSelected) {
        // Remove all
        for (const perm of permissions) {
          await customRolesApi.removePermissionFromCustomRole(token, {
            customRoleId,
            permissionId: perm.id,
          });
        }
        setCustomRolePermissions(prev => ({
          ...prev,
          [customRoleId]: new Set([...(prev[customRoleId] || [])].filter(id => !permissions.some(p => p.id === id))),
        }));
      } else {
        // Add all
        for (const perm of permissions) {
          await customRolesApi.assignPermissionToCustomRole(token, {
            customRoleId,
            permissionId: perm.id,
          });
        }
        setCustomRolePermissions(prev => ({
          ...prev,
          [customRoleId]: new Set([...(prev[customRoleId] || []), ...permissions.map(p => p.id)]),
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setSaving(prev => ({ ...prev, [`custom-${customRoleId}-${category}`]: false }));
    }
  };

  if (!authChecked || (user && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Role Permissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage permissions for each role</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateRoleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Custom Role
          </button>
          <button
            onClick={fetchPermissions}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Standard Roles Permissions */}
          <div className="space-y-4">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-violet-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({permissions.length} permissions)</span>
                  </div>
                  {expandedCategories.has(category) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedCategories.has(category) && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Permission</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor</th>
                            {customRoles.map((role) => (
                              <th key={role.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {role.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {permissions.map((permission) => (
                            <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{permission.name}</p>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{permission.description}</p>
                                  )}
                                </div>
                              </td>
                              {(['ADMIN', 'STAFF', 'VENDOR'] as const).map((role) => (
                                <td key={role} className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => togglePermission(role, permission.id)}
                                    disabled={saving[`${role}-${permission.id}`]}
                                    className={`p-2 rounded-lg transition-colors ${
                                      rolePermissions[role].has(permission.id)
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={`${rolePermissions[role].has(permission.id) ? 'Remove' : 'Add'} ${role} permission`}
                                  >
                                    {saving[`${role}-${permission.id}`] ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : rolePermissions[role].has(permission.id) ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              ))}
                              {customRoles.map((role) => (
                                <td key={role.id} className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => toggleCustomRolePermission(role.id, permission.id)}
                                    disabled={saving[`custom-${role.id}-${permission.id}`]}
                                    className={`p-2 rounded-lg transition-colors ${
                                      customRolePermissions[role.id]?.has(permission.id)
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={`${customRolePermissions[role.id]?.has(permission.id) ? 'Remove' : 'Add'} ${role.name} permission`}
                                  >
                                    {saving[`custom-${role.id}-${permission.id}`] ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : customRolePermissions[role.id]?.has(permission.id) ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Bulk actions for {category}</span>
                      <div className="flex gap-2 flex-wrap">
                        {(['ADMIN', 'STAFF', 'VENDOR'] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => toggleAllInCategory(role, category)}
                            disabled={saving[`${role}-${category}`]}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving[`${role}-${category}`] ? 'Saving...' : `Toggle ${role}`}
                          </button>
                        ))}
                        {customRoles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => toggleAllInCategoryForCustomRole(role.id, category)}
                            disabled={saving[`custom-${role.id}-${category}`]}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving[`custom-${role.id}-${category}`] ? 'Saving...' : `Toggle ${role.name}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Custom Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="e.g., Regional Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the role's purpose..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateRoleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCustomRole}
                disabled={saving.createRole || !newRoleName.trim()}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving.createRole ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
