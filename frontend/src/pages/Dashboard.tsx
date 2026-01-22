import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSites } from '../hooks/useSites';
import { useStaff } from '../hooks/useStaff';
import { useMeetings } from '../hooks/useMeetings';
import { useContracts } from '../hooks/useContracts';
import { useVehicles } from '../hooks/useVehicles';
import { Card, LoadingSpinner } from '../components/Common';
import { BarChart3, Users, CalendarDays, Truck, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { ContractSummary } from '../types';
import { currencyService, ExchangeRate } from '../api/currencyService';

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
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);

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

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      const rates = await currencyService.getMultipleRates([
        ['EUR', 'ZAR'],
        ['USD', 'ZAR'],
      ]);
      setExchangeRates(rates);
      setRatesLoading(false);
    };
    fetchRates();

    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

          {/* Currency Exchange Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {ratesLoading ? (
              <>
                <Card className="flex items-center justify-center h-32">
                  <p className="text-gray-500">Loading rates...</p>
                </Card>
                <Card className="flex items-center justify-center h-32">
                  <p className="text-gray-500">Loading rates...</p>
                </Card>
              </>
            ) : (
              <>
                {exchangeRates.map((rate) => (
                  <Card key={`${rate.from}-${rate.to}`} className="hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl font-bold text-blue-600">1</div>
                          <div className="text-sm font-semibold text-gray-700">{rate.from}</div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Exchange Rate</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">{rate.rate.toFixed(2)}</span>
                          <span className="text-sm font-semibold text-gray-700">{rate.to}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Last updated: {new Date(rate.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-blue-400">
                        <TrendingUp size={48} strokeWidth={1.5} />
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>


        </>
      )}
    </div>
  );
};
