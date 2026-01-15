import client from './client';
import { CreateMeetingInput, UpdateMeetingInput } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

export const meetingService = {
  list: async (skip = 0, limit = 100, siteId?: number) => {
    const response = await client.get(API_ENDPOINTS.MEETINGS_LIST, {
      params: { skip, limit, site_id: siteId },
    });
    return response.data;
  },

  get: async (id: number) => {
    const response = await client.get(API_ENDPOINTS.MEETINGS_GET(id));
    return response.data;
  },

  create: async (data: CreateMeetingInput) => {
    const response = await client.post(API_ENDPOINTS.MEETINGS_CREATE, data);
    return response.data;
  },

  update: async (id: number, data: UpdateMeetingInput) => {
    const response = await client.put(API_ENDPOINTS.MEETINGS_UPDATE(id), data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await client.delete(API_ENDPOINTS.MEETINGS_DELETE(id));
    return response.data;
  },

  getBySite: async (siteId: number) => {
    const response = await client.get(API_ENDPOINTS.MEETINGS_BY_SITE(siteId));
    return response.data;
  },
};
