import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useStaff } from '../hooks/useStaff';
import { Card, Button, ErrorMessage, LoadingSpinner } from '../components/Common';
import { formatFullName } from '../utils/formatters';
import { CreateVehicleInput, VehicleType, PrimaryUse } from '../types';
import { Upload, Download, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

export const FleetForm: React.FC = () => {
  const { registrationPlate } = useParams();
  const isEdit = Boolean(registrationPlate);
  const navigate = useNavigate();
  const { createVehicle, updateVehicle, fetchVehicle } = useVehicles();
  const { staff, fetchStaff } = useStaff();

  const [formData, setFormData] = useState<CreateVehicleInput>({
    vehicle_registration_plate: '',
    make: '',
    model: '',
    engine_displacement: '',
    description: '',
    year: new Date().getFullYear(),
    vin_chassis_number: '',
    vehicle_type: 'Bakkie / LDV',
    colour: '',
    purchase_date: '',
    active_tracking: true,
    assigned_staff_id: undefined,
    primary_use: 'Delivery',
    license_renewal_date: '',
    general_notes: '',
    natis_document: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (!isEdit || !registrationPlate) return;
    const load = async () => {
      setFetching(true);
      setError(null);
      try {
        const data = await fetchVehicle(registrationPlate);
        if (data) {
          setFormData({
            vehicle_registration_plate: data.vehicle_registration_plate,
            make: data.make,
            model: data.model,
            engine_displacement: data.engine_displacement || '',
            description: data.description || '',
            year: data.year,
            vin_chassis_number: data.vin_chassis_number || '',
            vehicle_type: data.vehicle_type,
            colour: data.colour || '',
            purchase_date: data.purchase_date || '',
            active_tracking: data.active_tracking,
            assigned_staff_id: data.assigned_staff_id,
            primary_use: data.primary_use,
            license_renewal_date: data.license_renewal_date || '',
            general_notes: data.general_notes || '',
            natis_document: data.natis_document || '',
          });
          if (data.natis_document) {
            setUploadedFile({ 
              name: data.natis_document.split('/').pop() || 'Document',
              path: data.natis_document 
            });
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicle');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [registrationPlate, isEdit]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.vehicle_registration_plate) return;

    setFileLoading(true);
    setFileError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    const uploadUrl = `${API_BASE_URL}/api/vehicles/${formData.vehicle_registration_plate}/upload`;
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

      const data = await response.json();
      setUploadedFile({ name: file.name, path: data.file_path });
      setFormData(prev => ({ ...prev, natis_document: data.file_path }));
      console.log('Upload successful');
    } catch (err: any) {
      console.error('Upload exception:', err);
      setFileError(err.message || 'Failed to upload file');
    } finally {
      setFileLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async () => {
    if (!uploadedFile || !formData.vehicle_registration_plate || !window.confirm('Are you sure you want to delete this document?')) return;

    setFileLoading(true);
    setFileError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${formData.vehicle_registration_plate}/delete-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setUploadedFile(null);
      setFormData(prev => ({ ...prev, natis_document: '' }));
    } catch (err: any) {
      setFileError(err.message || 'Failed to delete file');
    } finally {
      setFileLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate required fields
    if (!formData.vehicle_registration_plate || !formData.make || !formData.model || !formData.year) {
      setError('Registration plate, make, model, and year are required');
      setLoading(false);
      return;
    }

    try {
      if (isEdit && registrationPlate) {
        const { vehicle_registration_plate, ...updateData } = formData;
        await updateVehicle(registrationPlate, updateData);
      } else {
        await createVehicle(formData);
      }
      navigate('/fleet');
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner />;

  const vehicleTypes: VehicleType[] = ['Bakkie / LDV', 'SUV / XUV', 'Sedan', 'Hatchback', 'Minibus / Stationwagon', 'Trailer'];
  const primaryUses: PrimaryUse[] = ['Delivery', 'Sales', 'Executive', 'Pool Vehicle', 'Service'];

  return (
    <Card>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h1>
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Plate *
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              value={formData.vehicle_registration_plate}
              onChange={(e) => setFormData({ ...formData, vehicle_registration_plate: e.target.value })}
              placeholder="e.g., KZN 123 GP"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type *
            </label>
            <select
              required
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as VehicleType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make *
            </label>
            <input
              type="text"
              required
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              placeholder="e.g., Toyota"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g., Hiace"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine Displacement
            </label>
            <input
              type="text"
              value={formData.engine_displacement || ''}
              onChange={(e) => setFormData({ ...formData, engine_displacement: e.target.value })}
              placeholder="e.g., 2.4L"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Manual transmission, 4WD"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colour
            </label>
            <input
              type="text"
              value={formData.colour}
              onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
              placeholder="e.g., White"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN / Chassis Number
            </label>
            <input
              type="text"
              value={formData.vin_chassis_number}
              onChange={(e) => setFormData({ ...formData, vin_chassis_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Use *
            </label>
            <select
              required
              value={formData.primary_use}
              onChange={(e) => setFormData({ ...formData, primary_use: e.target.value as PrimaryUse })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {primaryUses.map(use => (
                <option key={use} value={use}>{use}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Renewal Date
            </label>
            <input
              type="date"
              value={formData.license_renewal_date}
              onChange={(e) => setFormData({ ...formData, license_renewal_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Staff Member
            </label>
            <select
              value={formData.assigned_staff_id || ''}
              onChange={(e) => setFormData({ ...formData, assigned_staff_id: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Unassigned</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {formatFullName(s.name, s.surname)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active_tracking}
                onChange={(e) => setFormData({ ...formData, active_tracking: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Active Tracking</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            General Notes
          </label>
          <textarea
            value={formData.general_notes}
            onChange={(e) => setFormData({ ...formData, general_notes: e.target.value })}
            placeholder="Add any notes about this vehicle..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows={4}
          />
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">NATIS Document</label>
            {fileError && <ErrorMessage message={fileError} />}
            
            {uploadedFile || formData.natis_document ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Download size={24} className="text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{uploadedFile?.name || formData.natis_document?.split('/').pop()}</p>
                  <p className="text-sm text-gray-600">Document uploaded</p>
                </div>
                <div className="flex gap-2">
                  {isEdit && formData.vehicle_registration_plate && (
                    <a
                      href={`${API_BASE_URL}/api/vehicles/${formData.vehicle_registration_plate}/download`}
                      download
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download size={16} className="mr-2" />
                      Download
                    </a>
                  )}
                  <Button
                    type="button"
                    onClick={() => document.getElementById('file-upload-replace')?.click()}
                    disabled={fileLoading}
                    variant="secondary"
                  >
                    <Upload size={16} className="inline mr-2" />
                    {fileLoading ? 'Uploading...' : 'Replace'}
                  </Button>
                  <Button
                    type="button"
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

            {formData.natis_document && (
              <div className="mt-4">
                <input
                  id="file-upload-replace"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={fileLoading}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Add Vehicle')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(isEdit ? `/fleet/${registrationPlate}` : '/fleet')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
