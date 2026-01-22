import client from './client';
import { Vehicle, VehicleDetail, CreateVehicleInput, UpdateVehicleInput } from '../types';

export const vehicleService = {
  async getAll(skip: number = 0, limit: number = 100): Promise<Vehicle[]> {
    const response = await client.get<Vehicle[]>('/api/vehicles', {
      params: { skip, limit }
    });
    return response.data;
  },

  async get(registrationPlate: string): Promise<VehicleDetail> {
    const response = await client.get<VehicleDetail>(`/api/vehicles/${registrationPlate}`);
    return response.data;
  },

  async create(vehicle: CreateVehicleInput): Promise<Vehicle> {
    const response = await client.post<Vehicle>('/api/vehicles', vehicle);
    return response.data;
  },

  async update(registrationPlate: string, vehicle: UpdateVehicleInput): Promise<Vehicle> {
    const response = await client.put<Vehicle>(`/api/vehicles/${registrationPlate}`, vehicle);
    return response.data;
  },

  async delete(registrationPlate: string): Promise<void> {
    await client.delete(`/api/vehicles/${registrationPlate}`);
  },

  async getByStaff(staffId: number): Promise<Vehicle[]> {
    const response = await client.get<Vehicle[]>(`/api/vehicles/staff/${staffId}`);
    return response.data;
  },

  async getByType(vehicleType: string): Promise<Vehicle[]> {
    const response = await client.get<Vehicle[]>(`/api/vehicles/type/${vehicleType}`);
    return response.data;
  }
};
