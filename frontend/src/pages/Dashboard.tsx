import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSites } from '../hooks/useSites';
import { useStaff } from '../hooks/useStaff';
import { useMeetings } from '../hooks/useMeetings';
import { useContracts } from '../hooks/useContracts';
import { useVehicles } from '../hooks/useVehicles';
import { Card, LoadingSpinner } from '../components/Common';
import { formatDate } from '../utils/formatters';
import { BarChart3, Users, CalendarDays, Eye, Truck, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ContractSummary } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sites, loading: sitesLoading, fetchSites } = useSites();
  const { staff, loading: staffLoading, fetchStaff } = useStaff();
  const { meetings, loading: meetingsLoading, fetchMeetings } = useMeetings();
  const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();
  const { summary: contractSummary, supplySummary, serviceSummary, loading: contractsLoading, fetchSummary: fetchContractSummary, fetchSummaryByType } = useContracts();
  const [contractStats, setContractStats] = useState<ContractSummary | null>(null);
  const [supplyStats, setSupplyStats] = useState<any>(null);
  const [serviceStats, setServiceStats] = useState<any>(null);
  const [fleetRegistrationStats, setFleetRegistrationStats] = useState<any>(null);

  useEffect(() => {
    fetchSites();
    fetchStaff();
    fetchMeetings();
    fetchVehicles();
    fetchContractSummary();
    fetchSummaryByType();
  }, []);

  useEffect(() => {
    if (contractSummary) {
      setContractStats(contractSummary);
    }
  }, [contractSummary]);

  useEffect(() => {
    if (supplySummary) {
      setSupplyStats(supplySummary);
    }
  }, [supplySummary]);

  useEffect(() => {
    if (serviceSummary) {
      setServiceStats(serviceSummary);
    }
  }, [serviceSummary]);

  // Calculate fleet registration status
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      let activeCount = 0;
      let expiringCount = 0;
      let expiredCount = 0;

      vehicles.forEach((vehicle: any) => {
        if (!vehicle.license_renewal_date) return;
        
        const renewalDate = new Date(vehicle.license_renewal_date);
        renewalDate.setHours(0, 0, 0, 0);

        if (renewalDate < today) {
          expiredCount++;
        } else if (renewalDate <= thirtyDaysLater) {
          expiringCount++;
        } else {
          activeCount++;
        }
      });

      setFleetRegistrationStats({
        active: activeCount,
        expiring: expiringCount,
        expired: expiredCount
      });
    }
  }, [vehicles]);

  const loading = sitesLoading || staffLoading || meetingsLoading || vehiclesLoading || contractsLoading;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/sites')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Sites</p>
                  <p className="text-4xl font-bold text-gray-900">{sites.length}</p>
                </div>
                <BarChart3 className="text-blue-600" size={32} />
              </div>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/staff')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Staff</p>
                  <p className="text-4xl font-bold text-gray-900">{staff.length}</p>
                </div>
                <Users className="text-green-600" size={32} />
              </div>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/meetings')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Meetings</p>
                  <p className="text-4xl font-bold text-gray-900">{meetings.length}</p>
                </div>
                <CalendarDays className="text-orange-600" size={32} />
              </div>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => navigate('/fleet')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Vehicles</p>
                  <p className="text-4xl font-bold text-gray-900">{vehicles.length}</p>
                </div>
                <Truck className="text-red-600" size={32} />
              </div>
            </Card>
          </div>

          {/* Supply Contracts Status Summary */}
          {supplyStats && supplyStats.total_contracts > 0 && (
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Supply Contracts</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{supplyStats.active_count}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-yellow-600">{supplyStats.expired_count}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{supplyStats.completed_count}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{supplyStats.cancelled_count}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Service Contracts Status Summary */}
          {serviceStats && serviceStats.total_contracts > 0 && (
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Service Contracts</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{serviceStats.active_count}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-yellow-600">{serviceStats.expired_count}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{serviceStats.completed_count}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{serviceStats.cancelled_count}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Fallback if no contract type summaries are available */}
          {contractStats && contractStats.total_contracts > 0 && !supplyStats && !serviceStats && (
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contract Status Summary</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{contractStats.active_count}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-yellow-600">{contractStats.expired_count}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{contractStats.completed_count}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{contractStats.cancelled_count}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Fleet Registration Status */}
          {fleetRegistrationStats && (
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Fleet Registration Status</h2>
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className="p-4 bg-green-50 rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200" 
                  onClick={() => navigate('/fleet', { state: { registrationStatusFilter: 'active' } })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{fleetRegistrationStats.active}</p>
                </div>
                <div 
                  className="p-4 bg-yellow-50 rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200" 
                  onClick={() => navigate('/fleet', { state: { registrationStatusFilter: 'expiring' } })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-yellow-600" size={20} />
                    <p className="text-sm text-gray-600">Expiring in 30 Days</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{fleetRegistrationStats.expiring}</p>
                </div>
                <div 
                  className="p-4 bg-red-50 rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200" 
                  onClick={() => navigate('/fleet', { state: { registrationStatusFilter: 'expired' } })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-sm text-gray-600">Expired</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{fleetRegistrationStats.expired}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Meetings */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
            {meetings.length === 0 ? (
              <p className="text-gray-500">No meetings scheduled</p>
            ) : (
              <div className="space-y-3">
                {meetings.slice(0, 5).map((meeting) => {
                  const siteName = sites.find((s: any) => s.id === meeting.site_id)?.name || 'Unknown Site';
                  return (
                    <div key={meeting.id} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors" onClick={() => navigate(`/meetings/${meeting.id}`)}>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{meeting.agenda || `Meeting #${meeting.id}`}</p>
                        <p className="text-sm text-gray-600">{siteName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{formatDate(meeting.created_at)}</span>
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            navigate(`/meetings/${meeting.id}`);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View meeting"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Sites with Active Meetings</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(meetings.map((m: any) => m.site_id)).size}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Staff per Site</p>
                <p className="text-2xl font-bold text-green-600">
                  {sites.length > 0 ? (staff.length / sites.length).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
