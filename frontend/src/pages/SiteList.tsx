import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSites } from '../hooks/useSites';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { truncate, formatDate } from '../utils/formatters';

export const SiteList: React.FC = () => {
  const { sites, loading, error, fetchSites, deleteSite } = useSites();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await deleteSite(id);
      } catch {
        // Error is handled by the hook
      }
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Power Stations</h1>
        <Link to="/sites/new">
          <Button>
            <Plus size={20} className="inline mr-2" />
            New Site
          </Button>
        </Link>
      </div>

      <ErrorMessage message={error} />

      <Card>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredSites.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sites found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact Person</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact Number</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/sites/${site.id}`} className="text-blue-600 hover:underline font-medium">
                        {site.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{truncate(site.contact_person || '', 40)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{truncate(site.contact_number || '', 40)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(site.created_at)}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link to={`/sites/${site.id}/edit`} className="inline">
                        <Button variant="secondary" className="px-3 py-1">
                          <Edit2 size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="px-3 py-1"
                        onClick={() => handleDelete(site.id)}
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
