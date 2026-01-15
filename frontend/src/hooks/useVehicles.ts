import { useState, useCallback } from 'react';
import { vehicleService } from '../api/vehicleService';
import { Vehicle, VehicleDetail, CreateVehicleInput, UpdateVehicleInput } from '../types';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async (skip: number = 0, limit: number = 100) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getAll(skip, limit);
      setVehicles(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehicle = useCallback(async (registrationPlate: string): Promise<VehicleDetail | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.get(registrationPlate);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicle = useCallback(async (vehicle: CreateVehicleInput): Promise<Vehicle | null> => {
    setLoading(true);
    setError(null);
    try {
      const newVehicle = await vehicleService.create(vehicle);
      setVehicles([...vehicles, newVehicle]);
      return newVehicle;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  }, [vehicles]);

  const updateVehicle = useCallback(async (registrationPlate: string, vehicle: UpdateVehicleInput): Promise<Vehicle | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedVehicle = await vehicleService.update(registrationPlate, vehicle);
      setVehicles(vehicles.map(v => v.vehicle_registration_plate === registrationPlate ? updatedVehicle : v));
      return updatedVehicle;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  }, [vehicles]);

  const deleteVehicle = useCallback(async (registrationPlate: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await vehicleService.delete(registrationPlate);
      setVehicles(vehicles.filter(v => v.vehicle_registration_plate !== registrationPlate));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete vehicle');
      return false;
    } finally {
      setLoading(false);
    }
  }, [vehicles]);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    fetchVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
};
