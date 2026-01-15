import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useStaff } from '../hooks/useStaff';
import { Card, Button, ErrorMessage, LoadingSpinner } from '../components/Common';
import { formatFullName } from '../utils/formatters';
import { VehicleDetail } from '../types';
import { Upload, Download, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

export const FleetDetail: React.FC = () => {
  const { registrationPlate } = useParams();
  const navigate = useNavigate();
  const { fetchVehicle, deleteVehicle } = useVehicles();
  const { staff, fetchStaff } = useStaff();

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const getRegistrationStatus = (vehicle: VehicleDetail): { status: string; label: string; color: string } => {
    if (!vehicle.license_renewal_date) {
      return { status: 'unknown', label: 'Unknown', color: 'text-gray-600' };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const renewalDate = new Date(vehicle.license_renewal_date);
    renewalDate.setHours(0, 0, 0, 0);

    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    if (renewalDate < today) {
      return { status: 'expired', label: 'Expired', color: 'text-red-600' };
    } else if (renewalDate <= thirtyDaysLater) {
      return { status: 'expiring', label: 'Expiring in 30 Days', color: 'text-yellow-600' };
    } else {
      return { status: 'active', label: 'Active', color: 'text-green-600' };
    }
  };

  const getDepreciation = (vehicle: VehicleDetail): { percentage: number; label: string; color: string; bgColor: string } => {
    if (!vehicle.purchase_date) {
      return { percentage: 0, label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }

    const today = new Date();
    const purchaseDate = new Date(vehicle.purchase_date);
    const deprecationPeriodYears = 5;
    const deprecationPeriodMs = deprecationPeriodYears * 365.25 * 24 * 60 * 60 * 1000;
    
    const ageMs = today.getTime() - purchaseDate.getTime();
    const percentage = Math.min((ageMs / deprecationPeriodMs) * 100, 100);

    if (percentage >= 100) {
      return { 
        percentage: 100, 
        label: 'Fully Depreciated', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100' 
      };
    } else if (percentage >= 75) {
      return { 
        percentage: Math.round(percentage), 
        label: `${Math.round(percentage)}% Depreciated`, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100' 
      };
    } else if (percentage >= 50) {
      return { 
        percentage: Math.round(percentage), 
        label: `${Math.round(percentage)}% Depreciated`, 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100' 
      };
    } else if (percentage >= 25) {
      return { 
        percentage: Math.round(percentage), 
        label: `${Math.round(percentage)}% Depreciated`, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100' 
      };
    } else {
      return { 
        percentage: Math.round(percentage), 
        label: `${Math.round(percentage)}% Depreciated`, 
        color: 'text-green-600', 
        bgColor: 'bg-green-100' 
      };
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !registrationPlate) return;

    setFileLoading(true);
    setFileError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    const uploadUrl = `${API_BASE_URL}/api/vehicles/${registrationPlate}/upload`;
    console.log('Uploading to:', uploadUrl, 'File:', file.name);

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Upload failed with status ${response.status}`;
        console.error('Upload error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Upload successful, reloading vehicle data');
      // Reload vehicle to show updated file
      const updatedVehicle = await fetchVehicle(registrationPlate);
      setVehicle(updatedVehicle);
    } catch (err: any) {
      console.error('Upload exception:', err);
      setFileError(err.message || 'Failed to upload file');
    } finally {
      setFileLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async () => {
    if (!registrationPlate || !window.confirm('Are you sure you want to delete this document?')) return;

    setFileLoading(true);
    setFileError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${registrationPlate}/delete-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Reload vehicle to show updated state
      const updatedVehicle = await fetchVehicle(registrationPlate);
      setVehicle(updatedVehicle);
    } catch (err: any) {
      setFileError(err.message || 'Failed to delete file');
    } finally {
      setFileLoading(false);
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
              variant="destructive"
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
                <p className="text-sm text-gray-600">Engine Displacement</p>
                <p className="text-lg font-medium text-gray-800">{vehicle.engine_displacement || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-lg font-medium text-gray-800">{vehicle.description || '-'}</p>
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
              <div>
                <p className="text-sm text-gray-600">Depreciation Status</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getDepreciation(vehicle).bgColor}`}>
                  <span className={getDepreciation(vehicle).color}>{getDepreciation(vehicle).label}</span>
                </div>
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
                  {vehicle.assigned_staff_id ? (
                    (() => {
                      const staffMember = staff.find(s => s.id === vehicle.assigned_staff_id);
                      return staffMember 
                        ? formatFullName(staffMember.name, staffMember.surname)
                        : 'Staff Member Not Found';
                    })()
                  ) : (
                    'Unassigned'
                  )}
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
              <div>
                <p className="text-sm text-gray-600">Registration Status</p>
                <p className={`text-lg font-medium ${getRegistrationStatus(vehicle).color}`}>
                  {getRegistrationStatus(vehicle).label}
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
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">NATIS Document</h2>
        {fileError && <ErrorMessage message={fileError} />}
        
        {vehicle.natis_document ? (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Download size={24} className="text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{vehicle.natis_document.split('/').pop()}</p>
              <p className="text-sm text-gray-600">Document uploaded</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`${API_BASE_URL}/api/vehicles/${registrationPlate}/download`}
                download
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={16} className="mr-2" />
                Download
              </a>
              <Button
                onClick={() => document.getElementById('file-upload-detail-replace')?.click()}
                disabled={fileLoading}
                variant="secondary"
              >
                <Upload size={16} className="inline mr-2" />
                {fileLoading ? 'Uploading...' : 'Replace'}
              </Button>
              <Button
                onClick={handleDeleteFile}
                disabled={fileLoading}
                variant="secondary"
                className="text-red-600 hover:text-red-700"
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
              id="file-upload-detail-initial"
              type="file"
              onChange={handleFileUpload}
              disabled={fileLoading}
              className="hidden"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
            />
            <Button 
              type="button" 
              onClick={() => document.getElementById('file-upload-detail-initial')?.click()}
              disabled={fileLoading}
            >
              <Upload size={16} className="inline mr-2" />
              {fileLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        )}

        {vehicle.natis_document && (
          <div className="mt-4">
            <input
              id="file-upload-detail-replace"
              type="file"
              onChange={handleFileUpload}
              disabled={fileLoading}
              className="hidden"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
            />
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
