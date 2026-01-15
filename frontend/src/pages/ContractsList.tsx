import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContracts } from '../hooks/useContracts';
import { useSites } from '../hooks/useSites';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { Plus, Edit, Trash2, Download, FileText } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Contract, ContractStatus } from '../types';

export const ContractsList: React.FC = () => {
  const navigate = useNavigate();
  const { contracts, loading, error, fetchContracts, deleteContract } = useContracts();
  const { sites, fetchSites } = useSites();
  
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContracts();
    fetchSites();
  }, []);

  useEffect(() => {
    let filtered = contracts.filter(c => c.contract_type === 'Service');

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Search by reference or contact name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.eskom_reference?.toLowerCase().includes(term) ||
        c.contact_person_name?.toLowerCase().includes(term) ||
        c.internal_quotation_number?.toLowerCase().includes(term)
      );
    }

    setFilteredContracts(filtered);
  }, [contracts, statusFilter, searchTerm]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await deleteContract(id);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  const getStatusColor = (status: ContractStatus): string => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSiteName = (siteId: number): string => {
    return sites.find(s => s.id === siteId)?.name || `Site #${siteId}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Service Contracts</h1>
        <Button onClick={() => navigate('/contracts/create')}>
          <Plus size={16} className="inline mr-2" />
          New Service Contract
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by reference, contact name, or quotation number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContractStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {filteredContracts.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            {searchTerm || statusFilter ? 'No contracts match your filters.' : 'No contracts found. Create one to get started.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Site</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Value (ZAR)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map(contract => (
                <tr 
                  key={contract.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/contracts/${contract.id}/view`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {contract.eskom_reference || contract.internal_quotation_number || `Contract #${contract.id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getSiteName(contract.site_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(contract.start_date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(contract.end_date)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contract.contact_person_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{contract.contract_value ? formatCurrency(contract.contract_value) : '-'}</td>
                  <td className="px-6 py-4 text-sm space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/contracts/${contract.id}/edit`} className="inline">
                      <Button variant="secondary" className="px-3 py-1" title="Edit contract">
                        <Edit size={16} />
                      </Button>
                    </Link>
                    {contract.document_path && (
                      <Button
                        variant="secondary"
                        className="px-3 py-1"
                        title="Download document"
                        onClick={() => navigate(`/contracts/${contract.id}/view`)}
                      >
                        <Download size={16} />
                      </Button>
                    )}
                    {!contract.document_path && (
                      <Button
                        variant="secondary"
                        className="px-3 py-1"
                        title="View/Upload document"
                        onClick={() => navigate(`/contracts/${contract.id}/view`)}
                      >
                        <FileText size={16} />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      className="px-3 py-1"
                      title="Delete contract"
                      onClick={() => handleDelete(contract.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
