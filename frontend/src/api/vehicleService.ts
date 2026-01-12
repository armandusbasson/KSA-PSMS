import axios from 'axios';
import { Vehicle, VehicleDetail, CreateVehicleInput, UpdateVehicleInput } from '../types';

const API_URL = 'http://localhost:8000/api/vehicles';

export const vehicleService = {
  async getAll(skip: number = 0, limit: number = 100): Promise<Vehicle[]> {
    const response = await axios.get<Vehicle[]>(API_URL, {
      params: { skip, limit }
    });
    return response.data;
  },

  async get(registrationPlate: string): Promise<VehicleDetail> {
    const response = await axios.get<VehicleDetail>(`${API_URL}/${registrationPlate}`);
    return response.data;
  },

  async create(vehicle: CreateVehicleInput): Promise<Vehicle> {
    const response = await axios.post<Vehicle>(API_URL, vehicle);
    return response.data;
  },

  async update(registrationPlate: string, vehicle: UpdateVehicleInput): Promise<Vehicle> {
    const response = await axios.put<Vehicle>(`${API_URL}/${registrationPlate}`, vehicle);
    return response.data;
  },

  async delete(registrationPlate: string): Promise<void> {
    await axios.delete(`${API_URL}/${registrationPlate}`);
  },

  async getByStaff(staffId: number): Promise<Vehicle[]> {
    const response = await axios.get<Vehicle[]>(`${API_URL}/staff/${staffId}`);
    return response.data;
  },

  async getByType(vehicleType: string): Promise<Vehicle[]> {
    const response = await axios.get<Vehicle[]>(`${API_URL}/type/${vehicleType}`);
    return response.data;
  }
};
