import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService, User, CreateUserInput, UpdateUserInput } from '../api/authService';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { Plus, Edit, Trash2, Key, Shield, UserCheck, User as UserIcon } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'password'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    is_active: true,
  });

  useEffect(() => {
    // Check if user is admin
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      full_name: '',
      role: 'user',
      is_active: true,
    });
    setModalMode('create');
    setSelectedUser(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      username: user.username,
      password: '',
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role,
      is_active: user.is_active,
    });
    setModalMode('edit');
    setSelectedUser(user);
    setFormError(null);
    setShowModal(true);
  };

  const openPasswordModal = (user: User) => {
    setFormData({ ...formData, password: '' });
    setModalMode('password');
    setSelectedUser(user);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (modalMode === 'create') {
        const input: CreateUserInput = {
          username: formData.username,
          password: formData.password,
          email: formData.email || undefined,
          full_name: formData.full_name || undefined,
          role: formData.role,
        };
        await authService.createUser(input);
      } else if (modalMode === 'edit' && selectedUser) {
        const input: UpdateUserInput = {
          username: formData.username,
          email: formData.email || undefined,
          full_name: formData.full_name || undefined,
          role: formData.role,
          is_active: formData.is_active,
        };
        await authService.updateUser(selectedUser.id, input);
      } else if (modalMode === 'password' && selectedUser) {
        await authService.resetUserPassword(selectedUser.id, formData.password);
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) return;
    
    try {
      await authService.deleteUser(user.id);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-600" />;
      case 'manager': return <UserCheck className="w-4 h-4 text-blue-600" />;
      default: return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <Button onClick={openCreateModal}>
          <Plus size={16} className="inline mr-2" />
          New User
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Login</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.full_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Button variant="secondary" className="px-3 py-1" onClick={() => openEditModal(user)} title="Edit user">
                      <Edit size={16} />
                    </Button>
                    <Button variant="secondary" className="px-3 py-1" onClick={() => openPasswordModal(user)} title="Reset password">
                      <Key size={16} />
                    </Button>
                    {user.id !== currentUser?.id && (
                      <Button variant="destructive" className="px-3 py-1" onClick={() => handleDelete(user)} title="Delete user">
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === 'create' ? 'Create New User' : 
               modalMode === 'edit' ? 'Edit User' : 
               'Reset Password'}
            </h2>

            {formError && <ErrorMessage message={formError} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalMode !== 'password' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {modalMode === 'edit' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                  )}
                </>
              )}

              {(modalMode === 'create' || modalMode === 'password') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalMode === 'create' ? 'Password *' : 'New Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
