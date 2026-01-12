import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useStaff } from '../hooks/useStaff';
import { Card, Button, ErrorMessage, LoadingSpinner } from '../components/Common';
import { formatFullName } from '../utils/formatters';
import { VehicleDetail } from '../types';

export const FleetDetail: React.FC = () => {
  const { registrationPlate } = useParams();
  const navigate = useNavigate();
  const { fetchVehicle, deleteVehicle } = useVehicles();
  const { staff } = useStaff();

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registrationPlate) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVehicle(registrationPlate);
        setVehicle(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [registrationPlate]);

  const handleDelete = async () => {
    if (!registrationPlate || !window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(registrationPlate);
      navigate('/fleet');
    } catch (err: any) {
      setError(err.message || 'Failed to delete vehicle');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!vehicle) return <div className="text-red-600">Vehicle not found</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/fleet/${registrationPlate}/edit`)}
              variant="primary"
            >
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Vehicle Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Registration Plate</p>
                <p className="text-lg font-medium text-gray-800">{vehicle.vehicle_registration_plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle Type</p>
                <p className="text-lg font-medium text-gray-800">{vehicle.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Colour</p>
                <p className="text-lg font-medium text-gray-800">{vehicle.colour || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">VIN / Chassis Number</p>
                <p className="text-lg font-medium text-gray-800">{vehicle.vin_chassis_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Purchase Date</p>
                <p className="text-lg font-medium text-gray-800">
                  {vehicle.purchase_date ? new Date(vehicle.purchase_date).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Assignment & Usage</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Primary Use</p>
                <p className="text-lg font-medium text-gray-800">{vehicle.primary_use}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned Staff Member</p>
                <p className="text-lg font-medium text-gray-800">
                  {vehicle.assigned_staff_id ? formatFullName(
                    staff.find(s => s.id === vehicle.assigned_staff_id)?.name || '',
                    staff.find(s => s.id === vehicle.assigned_staff_id)?.surname || ''
                  ) : 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tracking</p>
                <p className={`text-lg font-medium ${vehicle.active_tracking ? 'text-green-600' : 'text-gray-500'}`}>
                  {vehicle.active_tracking ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Renewal Date</p>
                <p className="text-lg font-medium text-gray-800">
                  {vehicle.license_renewal_date ? new Date(vehicle.license_renewal_date).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {vehicle.general_notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{vehicle.general_notes}</p>
          </div>
        )}

        {vehicle.natis_document && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">NATIS Document</h2>
            <a
              href={vehicle.natis_document}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {vehicle.natis_document}
            </a>
          </div>
        )}
      </Card>

      <Card>
        <Button
          variant="secondary"
          onClick={() => navigate('/fleet')}
        >
          Back to Fleet
        </Button>
      </Card>
    </div>
  );
};
