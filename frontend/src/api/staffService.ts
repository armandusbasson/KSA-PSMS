import client from './client';
import { CreateStaffInput, UpdateStaffInput } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

export const staffService = {
  list: async (skip = 0, limit = 100) => {
    const response = await client.get(API_ENDPOINTS.STAFF_LIST, {
      params: { skip, limit },
    });
    return response.data;
  },

  get: async (id: number) => {
    const response = await client.get(API_ENDPOINTS.STAFF_GET(id));
    return response.data;
  },

  create: async (data: CreateStaffInput) => {
    const response = await client.post(API_ENDPOINTS.STAFF_CREATE, data);
    return response.data;
  },

  update: async (id: number, data: UpdateStaffInput) => {
    const response = await client.put(API_ENDPOINTS.STAFF_UPDATE(id), data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await client.delete(API_ENDPOINTS.STAFF_DELETE(id));
    return response.data;
  },
};
