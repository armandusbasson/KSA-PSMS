import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { CreateStaffInput } from '../types';
import { formatDate, formatFullName } from '../utils/formatters';

const StaffForm: React.FC<{
  onSubmit: (data: CreateStaffInput) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}> = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<CreateStaffInput>({
    name: '',
    surname: '',
    role: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ name: '', surname: '', role: '', email: '', phone: '' });
  };

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Staff Member</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
          <input
            type="text"
            value={formData.surname || ''}
            onChange={(e) => setFormData({ ...formData, surname: e.target.value || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Staff Member'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export const StaffList: React.FC = () => {
  const { staff, loading, error, fetchStaff, createStaffMember, deleteStaffMember } = useStaff();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (data: CreateStaffInput) => {
    setFormLoading(true);
    try {
      await createStaffMember(data);
      setShowForm(false);
    } catch {
      // Error is handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaffMember(id);
      } catch {
        // Error is handled
      }
    }
  };

  const filteredStaff = staff.filter(s =>
    (s.name + ' ' + (s.surname || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Staff Directory</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="inline mr-2" />
          Add Staff
        </Button>
      </div>

      <ErrorMessage message={error} />

      {showForm && (
        <StaffForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      )}

      <Card>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredStaff.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No staff members found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{formatFullName(member.name, member.surname)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.role || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(member.created_at)}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        variant="destructive"
                        className="px-3 py-1"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
