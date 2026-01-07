import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts } from '../hooks/useContracts';
import { useStaff } from '../hooks/useStaff';
import { useSites } from '../hooks/useSites';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { ArrowLeft, Edit, Download, Upload, Trash2 } from 'lucide-react';
import { formatDate, formatFullName } from '../utils/formatters';

export const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchContract, uploadFile, downloadFile, deleteFile, deleteContract } = useContracts();
  const { staff, fetchStaff } = useStaff();
  const { sites, fetchSites } = useSites();

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        await Promise.all([fetchStaff(), fetchSites()]);
        const data = await fetchContract(parseInt(id));
        setContract(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load contract');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setFileError(null);
    setFileLoading(true);

    try {
      await uploadFile(parseInt(id), file);
      // Reload contract
      const data = await fetchContract(parseInt(id));
      setContract(data);
    } catch (err: any) {
      setFileError(err.message || 'Failed to upload file');
    } finally {
      setFileLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      await deleteContract(parseInt(id));
      navigate('/contracts');
    } catch (err: any) {
      setError(err.message || 'Failed to delete contract');
    }
  };

  const getStatusColor = (status: string): string => {
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

  const getStaffName = (staffId: number): string => {
    const s = staff.find(st => st.id === staffId);
    return s ? formatFullName(s.name, s.surname) : `Staff #${staffId}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!contract) return <ErrorMessage message="Contract not found" />;

  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => navigate('/contracts')}
        className="mb-6"
      >
        <ArrowLeft size={16} className="inline mr-2" />
        Back to Contracts
      </Button>

      <Card className="mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {contract.eskom_reference || contract.internal_quotation_number || `Contract #${contract.id}`}
            </h1>
            <div className="flex gap-4 items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(contract.status)}`}>
                {contract.status}
              </span>
              <p className="text-gray-600">
                Created on {formatDate(contract.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/contracts/${contract.id}/edit`)}>
              <Edit size={16} className="inline mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Contract Type</p>
            <p className="text-gray-900 font-semibold">{contract.contract_type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Associated Site</p>
            <p className="text-gray-900 font-semibold">{getSiteName(contract.site_id)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Start Date</p>
            <p className="text-gray-900">{formatDate(contract.start_date)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">End Date</p>
            <p className="text-gray-900">{formatDate(contract.end_date)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Responsible Staff Member</p>
            <p className="text-gray-900">{getStaffName(contract.responsible_staff_id)}</p>
          </div>
        </div>
      </Card>

      {(contract.eskom_reference || contract.internal_quotation_number || contract.internal_invoice_number) && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Reference Numbers</h2>
          <div className="grid grid-cols-3 gap-6">
            {contract.eskom_reference && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Eskom Contract Reference</p>
                <p className="text-gray-900 break-words">{contract.eskom_reference}</p>
              </div>
            )}
            {contract.internal_quotation_number && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Internal Quotation Number</p>
                <p className="text-gray-900 break-words">{contract.internal_quotation_number}</p>
              </div>
            )}
            {contract.internal_invoice_number && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Internal Invoice Number</p>
                <p className="text-gray-900 break-words">{contract.internal_invoice_number}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {(contract.contact_person_name || contract.contact_person_telephone || contract.contact_person_email) && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-3 gap-6">
            {contract.contact_person_name && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Contact Person</p>
                <p className="text-gray-900">{contract.contact_person_name}</p>
              </div>
            )}
            {contract.contact_person_telephone && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Telephone</p>
                <p className="text-gray-900">
                  <a href={`tel:${contract.contact_person_telephone}`} className="text-blue-600 hover:underline">
                    {contract.contact_person_telephone}
                  </a>
                </p>
              </div>
            )}
            {contract.contact_person_email && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">
                  <a href={`mailto:${contract.contact_person_email}`} className="text-blue-600 hover:underline">
                    {contract.contact_person_email}
                  </a>
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-xl font-semibold mb-4">Contract Document</h2>
        {fileError && <ErrorMessage message={fileError} />}
        
        {contract.document_path ? (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Download size={24} className="text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{contract.document_filename}</p>
              <p className="text-sm text-gray-600">Document uploaded</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => downloadFile(parseInt(id!), contract.document_filename)}
                className="whitespace-nowrap"
              >
                <Download size={16} className="inline mr-2" />
                Download
              </Button>
              <Button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this document?')) {
                    try {
                      await deleteFile(parseInt(id!));
                      // Reload contract to update UI
                      const data = await fetchContract(parseInt(id!));
                      setContract(data);
                    } catch (err: any) {
                      setFileError(err.message || 'Failed to delete file');
                    }
                  }
                }}
                variant="secondary"
                className="whitespace-nowrap text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} className="inline mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 mb-4">No document uploaded yet</p>
            <input
              id="file-upload-initial"
              type="file"
              onChange={handleFileUpload}
              disabled={fileLoading}
              className="hidden"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
            />
            <Button 
              type="button" 
              onClick={() => document.getElementById('file-upload-initial')?.click()}
              disabled={fileLoading}
            >
              <Upload size={16} className="inline mr-2" />
              {fileLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        )}

        {contract.document_path && (
          <div className="mt-4">
            <input
              id="file-upload-replace"
              type="file"
              onChange={handleFileUpload}
              disabled={fileLoading}
              className="hidden"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
            />
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => document.getElementById('file-upload-replace')?.click()}
              disabled={fileLoading}
            >
              <Upload size={16} className="inline mr-2" />
              {fileLoading ? 'Uploading...' : 'Replace Document'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
