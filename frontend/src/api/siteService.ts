import client from './client';
import { CreateSiteInput, UpdateSiteInput } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

// Sites CRUD
export const siteService = {
  list: async (skip = 0, limit = 100) => {
    const response = await client.get(API_ENDPOINTS.SITES_LIST, {
      params: { skip, limit },
    });
    return response.data;
  },

  get: async (id: number) => {
    const response = await client.get(API_ENDPOINTS.SITES_GET(id));
    return response.data;
  },

  create: async (data: CreateSiteInput) => {
    const response = await client.post(API_ENDPOINTS.SITES_CREATE, data);
    return response.data;
  },

  update: async (id: number, data: UpdateSiteInput) => {
    const response = await client.put(API_ENDPOINTS.SITES_UPDATE(id), data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await client.delete(API_ENDPOINTS.SITES_DELETE(id));
    return response.data;
  },

  // Site-Staff operations
  getStaff: async (siteId: number) => {
    const response = await client.get(API_ENDPOINTS.SITES_STAFF(siteId));
    return response.data;
  },

  addStaff: async (siteId: number, staffId: number) => {
    const response = await client.post(API_ENDPOINTS.SITES_ADD_STAFF(siteId, staffId));
    return response.data;
  },

  removeStaff: async (siteId: number, staffId: number) => {
    const response = await client.delete(API_ENDPOINTS.SITES_REMOVE_STAFF(siteId, staffId));
    return response.data;
  },
};
