import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts } from '../hooks/useContracts';
import { useStaff } from '../hooks/useStaff';
import { useSites } from '../hooks/useSites';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { ArrowLeft, Edit, Download, Upload, Trash2, Plus, X } from 'lucide-react';
import { formatDate, formatFullName, formatCurrency } from '../utils/formatters';
import { contractService } from '../api/contractService';
import { ContractSection, ContractLineItem } from '../types';

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

  // Section management state
  const [sectionLoading, setSectionLoading] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [showAddItem, setShowAddItem] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({ description: '', value: 0 });

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

  // Section management functions
  const handleAddSection = async () => {
    if (!id || !newSection.name.trim()) return;
    setSectionLoading(true);
    try {
      const sections = contract.sections || [];
      await contractService.createSection(parseInt(id), {
        name: newSection.name,
        description: newSection.description,
        order: sections.length,
        line_items: [],
      });
      // Reload contract
      const data = await fetchContract(parseInt(id));
      setContract(data);
      setNewSection({ name: '', description: '' });
      setShowAddSection(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add section');
    } finally {
      setSectionLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Are you sure you want to delete this section and all its line items?')) return;
    setSectionLoading(true);
    try {
      await contractService.deleteSection(sectionId);
      // Reload contract
      const data = await fetchContract(parseInt(id!));
      setContract(data);
    } catch (err: any) {
      setError(err.message || 'Failed to delete section');
    } finally {
      setSectionLoading(false);
    }
  };

  const handleAddLineItem = async (sectionId: number) => {
    if (!newItem.description.trim()) return;
    setSectionLoading(true);
    try {
      const section = contract.sections?.find((s: ContractSection) => s.id === sectionId);
      const items = section?.line_items || [];
      await contractService.createLineItem(sectionId, {
        description: newItem.description,
        value: newItem.value,
        order: items.length,
      });
      // Reload contract
      const data = await fetchContract(parseInt(id!));
      setContract(data);
      setNewItem({ description: '', value: 0 });
      setShowAddItem(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add line item');
    } finally {
      setSectionLoading(false);
    }
  };

  const handleDeleteLineItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this line item?')) return;
    setSectionLoading(true);
    try {
      await contractService.deleteLineItem(itemId);
      // Reload contract
      const data = await fetchContract(parseInt(id!));
      setContract(data);
    } catch (err: any) {
      setError(err.message || 'Failed to delete line item');
    } finally {
      setSectionLoading(false);
    }
  };

  // Calculate section subtotal
  const getSectionSubtotal = (section: ContractSection): number => {
    return section.line_items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
  };

  // Calculate total contract value from sections
  const getCalculatedTotal = (): number => {
    return contract.sections?.reduce((sum: number, section: ContractSection) => 
      sum + getSectionSubtotal(section), 0) || 0;
  };

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
          {contract.contract_type === 'Service' ? (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Contract Value</p>
              <p className="text-gray-900 font-semibold">{formatCurrency(getCalculatedTotal())}</p>
              <p className="text-xs text-gray-500 mt-1">Calculated from sections</p>
            </div>
          ) : contract.contract_value !== null && contract.contract_value !== undefined ? (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Contract Value</p>
              <p className="text-gray-900 font-semibold">{formatCurrency(contract.contract_value)}</p>
            </div>
          ) : null}
        </div>
      </Card>

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

      {contract.notes && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
        </Card>
      )}

      {/* Contract Sections - Only for Service Contracts */}
      {contract.contract_type === 'Service' && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contract Breakdown</h2>
            <Button
              onClick={() => setShowAddSection(true)}
              disabled={sectionLoading}
              variant="secondary"
            >
              <Plus size={16} className="inline mr-2" />
              Add Section
            </Button>
          </div>

          {/* Add Section Form */}
          {showAddSection && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-3">Add New Section</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Section Name</label>
                  <input
                    type="text"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    placeholder="e.g., Section A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={newSection.description}
                    onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                    placeholder="e.g., Preliminary and General"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSection} disabled={sectionLoading || !newSection.name.trim()}>
                  {sectionLoading ? 'Adding...' : 'Add Section'}
                </Button>
                <Button variant="secondary" onClick={() => { setShowAddSection(false); setNewSection({ name: '', description: '' }); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Display Sections */}
          {contract.sections && contract.sections.length > 0 ? (
            <div className="space-y-6">
              {contract.sections.map((section: ContractSection) => (
                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{section.name}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                        onClick={() => setShowAddItem(section.id!)}
                      >
                        <Plus size={14} className="inline mr-1" />
                        Add Item
                      </Button>
                      <Button
                        variant="destructive"
                        className="px-3 py-1 text-sm"
                        onClick={() => handleDeleteSection(section.id!)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Add Line Item Form */}
                  {showAddItem === section.id && (
                    <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Description</label>
                          <input
                            type="text"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="e.g., Site Establishment"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <div className="w-40">
                          <label className="block text-sm text-gray-600 mb-1">Value (R)</label>
                          <input
                            type="number"
                            value={newItem.value}
                            onChange={(e) => setNewItem({ ...newItem, value: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <Button onClick={() => handleAddLineItem(section.id!)} disabled={sectionLoading || !newItem.description.trim()}>
                          Add
                        </Button>
                        <Button variant="secondary" onClick={() => { setShowAddItem(null); setNewItem({ description: '', value: 0 }); }}>
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Line Items Table */}
                  {section.line_items && section.line_items.length > 0 ? (
                    <table className="w-full">
                      <tbody>
                        {section.line_items.map((item: ContractLineItem) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 pl-8 text-gray-700">{item.description}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900 w-40">
                              {formatCurrency(item.value)}
                            </td>
                            <td className="px-4 py-3 w-16">
                              <button
                                onClick={() => handleDeleteLineItem(item.id!)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete item"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-4 py-3 text-gray-700">Sub-Total</td>
                          <td className="px-4 py-3 text-right text-gray-900 w-40">
                            {formatCurrency(getSectionSubtotal(section))}
                          </td>
                          <td className="w-16"></td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      No line items yet. Click "Add Item" to add one.
                    </div>
                  )}
                </div>
              ))}

              {/* Total Contract Value */}
              <div className="bg-gray-800 text-white rounded-lg px-6 py-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Total Contract Value</span>
                <span className="text-2xl font-bold">{formatCurrency(getCalculatedTotal())}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-600 mb-2">No contract breakdown defined yet.</p>
              <p className="text-sm text-gray-500">Click "Add Section" to start building your contract breakdown.</p>
            </div>
          )}
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
