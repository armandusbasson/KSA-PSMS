import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useSites } from '../hooks/useSites';
import { useStaff } from '../hooks/useStaff';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { Vehicle } from '../types';

export const FleetList: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, loading, error, fetchVehicles, deleteVehicle } = useVehicles();
  const { staff, fetchStaff } = useStaff();
  
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchStaff();
  }, []);

  useEffect(() => {
    let filtered = vehicles;

    // Filter by search term (registration or make/model)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.vehicle_registration_plate.toLowerCase().includes(term) ||
        `${v.make} ${v.model}`.toLowerCase().includes(term)
      );
    }

    // Filter by active tracking status
    if (activeFilter !== '') {
      filtered = filtered.filter(v => v.active_tracking === activeFilter);
    }

    // Filter by vehicle type
    if (typeFilter) {
      filtered = filtered.filter(v => v.vehicle_type === typeFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, activeFilter, typeFilter]);

  const handleDelete = async (registrationPlate: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      await deleteVehicle(registrationPlate);
    }
  };

  const getStaffName = (staffId: number | undefined): string => {
    if (!staffId) return '-';
    const s = staff.find(st => st.id === staffId);
    return s ? `${s.name} ${s.surname || ''}`.trim() : `Staff #${staffId}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Fleet Management</h1>
        <Button onClick={() => navigate('/fleet/create')}>
          <Plus size={16} className="inline mr-2" />
          Add Vehicle
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-max">
            <input
              type="text"
              placeholder="Search by registration or vehicle name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Types</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
          </select>
          <select
            value={activeFilter === '' ? '' : String(activeFilter)}
            onChange={(e) => setActiveFilter(e.target.value === '' ? '' : e.target.value === 'true')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Status</option>
            <option value="true">Active Tracking</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </Card>

      {filteredVehicles.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            {searchTerm || activeFilter !== '' || typeFilter ? 'No vehicles match your filters.' : 'No vehicles found. Add one to get started.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Registration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Make/Model</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Colour</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Primary Use</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.map(vehicle => (
                <tr 
                  key={vehicle.vehicle_registration_plate}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/fleet/${vehicle.vehicle_registration_plate}`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {vehicle.vehicle_registration_plate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vehicle.make} {vehicle.model}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.vehicle_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.colour || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getStaffName(vehicle.assigned_staff_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.primary_use}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vehicle.active_tracking 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.active_tracking ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="secondary"
                      className="px-3 py-1"
                      title="Edit vehicle"
                      onClick={() => navigate(`/fleet/${vehicle.vehicle_registration_plate}/edit`)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      className="px-3 py-1"
                      title="Delete vehicle"
                      onClick={() => handleDelete(vehicle.vehicle_registration_plate)}
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
