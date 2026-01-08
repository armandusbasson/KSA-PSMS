import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaff } from '../hooks/useStaff';
import { useSiteStaff } from '../hooks/useSiteStaff';
import { useMeetings } from '../hooks/useMeetings';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { ArrowLeft, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { siteService } from '../api/siteService';
import { formatDate, formatFullName } from '../utils/formatters';
import { Contract } from '../types';

export const SiteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { staff: allStaff, fetchStaff } = useStaff();
  const { staff: siteStaff, fetchSiteStaff, addStaff, removeStaff } = useSiteStaff();
  const { meetings, fetchMeetings } = useMeetings();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const siteData = await siteService.get(parseInt(id));
        setSite(siteData);
        await fetchSiteStaff(parseInt(id));
        await fetchMeetings(parseInt(id));
        await fetchStaff();
        // Fetch contracts for this site
        const siteContracts = await contractService.getAll(0, 100, parseInt(id));
        setContracts(siteContracts);
      } catch (err: any) {
        setError(err.message || 'Failed to load site');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAddStaff = async () => {
    if (!selectedStaffId || !id) return;
    try {
      await addStaff(parseInt(id), parseInt(selectedStaffId));
      setSelectedStaffId('');
    } catch (err) {
      // Error is handled
    }
  };

  const handleRemoveStaff = async (staffId: number) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to remove this staff member from the site?')) {
      try {
        await removeStaff(parseInt(id), staffId);
      } catch (err) {
        // Error is handled
      }
    }
  };

  const siteMeetings = meetings.filter(m => m.site_id === parseInt(id || '0'));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!site) return <ErrorMessage message="Site not found" />;

  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => navigate('/sites')}
        className="mb-6"
      >
        <ArrowLeft size={16} className="inline mr-2" />
        Back to Sites
      </Button>

      <Card className="mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{site.name}</h1>
            <p className="text-gray-600">Created on {formatDate(site.created_at)}</p>
          </div>
          <Button onClick={() => navigate(`/sites/${site.id}/edit`)}>Edit</Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Contact Person</p>
            <p className="text-gray-900">{site.contact_person || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Contact Number</p>
            <p className="text-gray-900">{site.contact_number ? <a href={`tel:${site.contact_number}`} className="text-blue-600 hover:underline">{site.contact_number}</a> : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Contact Email</p>
            <p className="text-gray-900">{site.contact_email ? <a href={`mailto:${site.contact_email}`} className="text-blue-600 hover:underline">{site.contact_email}</a> : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Google Maps Coordinates</p>
            <p className="text-gray-900">{site.coordinates ? <a href={`https://maps.google.com/?q=${site.coordinates}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{site.coordinates}</a> : 'Not specified'}</p>
          </div>
        </div>
      </Card>

      {/* Assigned Staff */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Assigned Staff</h2>
        
        <div className="mb-4 flex gap-2">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Select staff member to add...</option>
            {allStaff.map(s => (
              <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
            ))}
          </select>
          <Button onClick={handleAddStaff} className="px-6">
            <Plus size={16} className="inline mr-2" />
            Add
          </Button>
        </div>

        {siteStaff.length === 0 ? (
          <p className="text-gray-500">No staff assigned to this site</p>
        ) : (
          <div className="space-y-2">
            {siteStaff.map(staff => (
              <div key={staff.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{formatFullName(staff.name, staff.surname)}</p>
                  <p className="text-sm text-gray-600">{staff.role || 'No role'}</p>
                </div>
                <button
                  onClick={() => handleRemoveStaff(staff.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove staff member"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Linked Meetings */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Linked Meetings ({siteMeetings.length})</h2>
          <Button onClick={() => navigate(`/meetings/new?site_id=${site.id}`)}>
            <Plus size={16} className="inline mr-2" />
            Add Meeting
          </Button>
        </div>
        
        {siteMeetings.length === 0 ? (
          <p className="text-gray-500">No meetings for this site</p>
        ) : (
          <div className="space-y-3">
            {siteMeetings.map(meeting => (
              <div key={meeting.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{meeting.agenda || `Meeting #${meeting.id}`}</p>
                    <p className="text-sm text-gray-600">{formatDate(meeting.created_at)}</p>
                    <p className="text-sm text-gray-600 mt-2">Items: {meeting.items?.length || 0}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => navigate(`/meetings/${meeting.id}/edit`)}
                      className="flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Linked Contracts */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Linked Contracts ({contracts.length})</h2>
          <Button onClick={() => navigate('/contracts/create')}>
            <Plus size={16} className="inline mr-2" />
            Add Contract
          </Button>
        </div>

        {contracts.length === 0 ? (
          <p className="text-gray-500">No contracts linked to this site yet</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/contracts/${contract.id}/view`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {contract.eskom_reference || contract.internal_quotation_number || `Contract #${contract.id}`}
                    </h3>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-700">Type</p>
                        <p>{contract.contract_type}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Period</p>
                        <p>{formatDate(contract.start_date)} to {formatDate(contract.end_date)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Contact</p>
                        <p>{contract.contact_person_name || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      contract.status === 'Active' ? 'bg-green-100 text-green-800' :
                      contract.status === 'Expired' ? 'bg-yellow-100 text-yellow-800' :
                      contract.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {contract.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

import { contractService } from '../api/contractService';
