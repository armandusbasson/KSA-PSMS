import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaff } from '../hooks/useStaff';
import { useMeetings } from '../hooks/useMeetings';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { ArrowLeft, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { siteService, StaffRole } from '../api/siteService';
import { formatDate, formatFullName, formatCurrency } from '../utils/formatters';
import { Contract, ContractSection } from '../types';

interface SiteStaffMember {
  staff_id: number;
  staff_name: string;
  staff_surname?: string;
  staff_role?: string;
  site_role: StaffRole;
}

// Helper function to calculate contract value from sections for Service contracts
const getContractDisplayValue = (contract: Contract): string => {
  if (contract.contract_type === 'Service' && contract.sections && contract.sections.length > 0) {
    const calculatedTotal = contract.sections.reduce((total: number, section: ContractSection) => {
      const sectionTotal = section.line_items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
      return total + sectionTotal;
    }, 0);
    return formatCurrency(calculatedTotal);
  }
  // For Supply contracts or Service contracts without sections
  return contract.contract_value ? formatCurrency(contract.contract_value) : '-';
};

export const SiteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { staff: allStaff, fetchStaff } = useStaff();
  const { meetings, fetchMeetings } = useMeetings();
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // State for each role
  const [siteManagers, setSiteManagers] = useState<SiteStaffMember[]>([]);
  const [supervisors, setSupervisors] = useState<SiteStaffMember[]>([]);
  const [valveTechnicians, setValveTechnicians] = useState<SiteStaffMember[]>([]);
  const [casualStaff, setCasualStaff] = useState<SiteStaffMember[]>([]);
  
  // State for adding staff by role
  const [selectedStaffIdByRole, setSelectedStaffIdByRole] = useState<{
    [key in StaffRole]?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const siteData = await siteService.get(parseInt(id));
        setSite(siteData);
        
        // Organize staff by role
        setSiteManagers(siteData.site_managers || []);
        setSupervisors(siteData.supervisors || []);
        setValveTechnicians(siteData.valve_technicians || []);
        setCasualStaff(siteData.casual_staff || []);
        
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

  const handleAddStaff = async (role: StaffRole) => {
    const staffId = selectedStaffIdByRole[role];
    if (!staffId || !id) return;
    try {
      await siteService.addStaff(parseInt(id), parseInt(staffId), role);
      setSelectedStaffIdByRole(prev => ({ ...prev, [role]: '' }));
      // Reload site data to get updated staff lists
      const siteData = await siteService.get(parseInt(id));
      setSiteManagers(siteData.site_managers || []);
      setSupervisors(siteData.supervisors || []);
      setValveTechnicians(siteData.valve_technicians || []);
      setCasualStaff(siteData.casual_staff || []);
    } catch (err) {
      // Error is handled by component
    }
  };

  const handleRemoveStaff = async (staffId: number, role: StaffRole) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to remove this staff member from the site?')) {
      try {
        await siteService.removeStaff(parseInt(id), staffId, role);
        // Reload site data to get updated staff lists
        const siteData = await siteService.get(parseInt(id));
        setSiteManagers(siteData.site_managers || []);
        setSupervisors(siteData.supervisors || []);
        setValveTechnicians(siteData.valve_technicians || []);
        setCasualStaff(siteData.casual_staff || []);
      } catch (err) {
        // Error is handled
      }
    }
  };

  const renderStaffSection = (
    title: string,
    staffList: SiteStaffMember[],
    role: StaffRole
  ) => {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        
        <div className="mb-4 flex gap-2">
          <select
            value={selectedStaffIdByRole[role] || ''}
            onChange={(e) => setSelectedStaffIdByRole(prev => ({ ...prev, [role]: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Select staff member to add...</option>
            {allStaff.map(s => (
              <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
            ))}
          </select>
          <Button onClick={() => handleAddStaff(role)} className="px-6">
            <Plus size={16} className="inline mr-2" />
            Add
          </Button>
        </div>

        {staffList.length === 0 ? (
          <p className="text-gray-500">No {title.toLowerCase()} assigned to this site</p>
        ) : (
          <div className="space-y-2">
            {staffList.map(staff => (
              <div key={`${staff.staff_id}-${role}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{formatFullName(staff.staff_name, staff.staff_surname)}</p>
                  <p className="text-sm text-gray-600">{staff.staff_role || 'No role'}</p>
                </div>
                <button
                  onClick={() => handleRemoveStaff(staff.staff_id, role)}
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
    );
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

      {/* Staff Roles - 4 Column Grid Layout */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {renderStaffSection('Site Manager', siteManagers, 'Site Manager')}
        {renderStaffSection('Supervisors', supervisors, 'Supervisor')}
        {renderStaffSection('Valve Technicians', valveTechnicians, 'Valve Technician')}
        {renderStaffSection('Casual Staff', casualStaff, 'Casual Staff')}
      </div>

      {/* Linked Meetings */}
      <Card className="mb-6">
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
          <div className="space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 mb-2 px-4 py-2">
              <div className="col-span-2">Reference</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Period</div>
              <div className="col-span-2">Value (ZAR)</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-1 text-right">Status</div>
            </div>
            
            {/* Contract rows */}
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="grid grid-cols-12 gap-4 items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer text-sm"
                onClick={() => navigate(`/contracts/${contract.id}/view`)}
              >
                <div className="col-span-2">
                  <p className="font-medium text-gray-900">
                    {contract.eskom_reference || contract.internal_quotation_number || `Contract #${contract.id}`}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">{contract.contract_type}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-gray-600">{formatDate(contract.start_date)} to {formatDate(contract.end_date)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 font-medium">{getContractDisplayValue(contract)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">{contract.contact_person_name || '-'}</p>
                </div>
                <div className="col-span-1 text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    contract.status === 'Active' ? 'bg-green-100 text-green-800' :
                    contract.status === 'Expired' ? 'bg-yellow-100 text-yellow-800' :
                    contract.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {contract.status}
                  </span>
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
