import client from './client';
import {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  ContractSummary,
  ContractSection,
  ContractLineItem,
} from '../types';

export const contractService = {
  async getAll(skip?: number, limit?: number, siteId?: number, status?: string): Promise<Contract[]> {
    const params = new URLSearchParams();
    if (skip !== undefined) params.append('skip', skip.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (siteId) params.append('site_id', siteId.toString());
    if (status) params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await client.get(`/api/contracts${query}`);
    return response.data;
  },

  async get(id: number): Promise<Contract> {
    const response = await client.get(`/api/contracts/${id}`);
    return response.data;
  },

  async getBySite(siteId: number): Promise<Contract[]> {
    return this.getAll(undefined, undefined, siteId);
  },

  async getByStatus(status: string): Promise<Contract[]> {
    return this.getAll(undefined, undefined, undefined, status);
  },

  async getSummary(): Promise<ContractSummary> {
    const response = await client.get('/api/contracts/summary');
    return response.data;
  },

  async getSummaryByType(type: 'Supply' | 'Service'): Promise<any> {
    const response = await client.get(`/api/contracts/summary/by-type/${type}`);
    return response.data;
  },

  async getOverdue(): Promise<Contract[]> {
    const response = await client.get('/api/contracts/overdue');
    return response.data;
  },

  async create(contract: CreateContractInput): Promise<Contract> {
    // Convert date strings to ISO datetime format for backend
    const data = {
      ...contract,
      start_date: `${contract.start_date}T00:00:00`,
      end_date: `${contract.end_date}T00:00:00`,
    };
    const response = await client.post('/api/contracts', data);
    return response.data;
  },

  async update(id: number, contract: UpdateContractInput): Promise<Contract> {
    // Convert date strings to ISO datetime format for backend if provided
    const data = {
      ...contract,
      start_date: contract.start_date ? `${contract.start_date}T00:00:00` : undefined,
      end_date: contract.end_date ? `${contract.end_date}T00:00:00` : undefined,
    };
    const response = await client.put(`/api/contracts/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await client.delete(`/api/contracts/${id}`);
  },

  async uploadFile(contractId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post(
      `/api/contracts/${contractId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async downloadFile(contractId: number, filename?: string): Promise<void> {
    try {
      const response = await client.get(
        `/api/contracts/${contractId}/download`,
        { responseType: 'blob' }
      );
      
      // response.data is already a Blob
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      // Use provided filename or construct a default one
      const downloadName = filename || `contract_${contractId}`;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download file');
    }
  },

  async deleteFile(contractId: number): Promise<void> {
    await client.delete(`/api/contracts/${contractId}/file`);
  },

  // Section methods
  async getSections(contractId: number): Promise<ContractSection[]> {
    const response = await client.get(`/api/contracts/${contractId}/sections`);
    return response.data;
  },

  async createSection(contractId: number, section: Omit<ContractSection, 'id' | 'contract_id' | 'created_at' | 'updated_at'>): Promise<ContractSection> {
    const response = await client.post(`/api/contracts/${contractId}/sections`, section);
    return response.data;
  },

  async updateSection(sectionId: number, section: Partial<ContractSection>): Promise<ContractSection> {
    const response = await client.put(`/api/contracts/sections/${sectionId}`, section);
    return response.data;
  },

  async deleteSection(sectionId: number): Promise<void> {
    await client.delete(`/api/contracts/sections/${sectionId}`);
  },

  // Line item methods
  async getLineItems(sectionId: number): Promise<ContractLineItem[]> {
    const response = await client.get(`/api/contracts/sections/${sectionId}/items`);
    return response.data;
  },

  async createLineItem(sectionId: number, item: Omit<ContractLineItem, 'id' | 'section_id' | 'created_at' | 'updated_at'>): Promise<ContractLineItem> {
    const response = await client.post(`/api/contracts/sections/${sectionId}/items`, item);
    return response.data;
  },

  async updateLineItem(itemId: number, item: Partial<ContractLineItem>): Promise<ContractLineItem> {
    const response = await client.put(`/api/contracts/items/${itemId}`, item);
    return response.data;
  },

  async deleteLineItem(itemId: number): Promise<void> {
    await client.delete(`/api/contracts/items/${itemId}`);
  },
};
