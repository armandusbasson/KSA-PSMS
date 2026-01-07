import { useState, useCallback } from 'react';
import { Contract, CreateContractInput, UpdateContractInput, ContractSummary } from '../types';
import { contractService } from '../api/contractService';

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [overdue, setOverdue] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async (siteId?: number, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await contractService.getAll(0, 100, siteId, status);
      setContracts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts');
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await contractService.getSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Error fetching contract summary:', err);
    }
  }, []);

  const fetchOverdue = useCallback(async () => {
    try {
      const data = await contractService.getOverdue();
      setOverdue(data);
    } catch (err: any) {
      console.error('Error fetching overdue contracts:', err);
    }
  }, []);

  const fetchContract = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await contractService.get(id);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contract');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createContract = useCallback(async (contract: CreateContractInput) => {
    setLoading(true);
    setError(null);
    try {
      const newContract = await contractService.create(contract);
      setContracts(prev => [...prev, newContract]);
      await fetchSummary();
      return newContract;
    } catch (err: any) {
      setError(err.message || 'Failed to create contract');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSummary]);

  const updateContract = useCallback(async (id: number, contract: UpdateContractInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await contractService.update(id, contract);
      setContracts(prev =>
        prev.map(c => (c.id === id ? updated : c))
      );
      await fetchSummary();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update contract');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSummary]);

  const deleteContract = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await contractService.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      await fetchSummary();
    } catch (err: any) {
      setError(err.message || 'Failed to delete contract');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSummary]);

  const uploadFile = useCallback(async (contractId: number, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await contractService.uploadFile(contractId, file);
      // Update the contract in local state
      setContracts(prev =>
        prev.map(c =>
          c.id === contractId
            ? {
                ...c,
                document_filename: result.filename,
                document_path: result.contract.document_path,
              }
            : c
        )
      );
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (contractId: number, filename?: string) => {
    try {
      await contractService.downloadFile(contractId, filename);
    } catch (err: any) {
      setError(err.message || 'Failed to download file');
      throw err;
    }
  }, []);

  const deleteFile = useCallback(async (contractId: number) => {
    setError(null);
    try {
      await contractService.deleteFile(contractId);
      // Update the contract in local state to remove file info
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                document_filename: undefined,
                document_path: undefined,
              }
            : c
        )
      );
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
      throw err;
    }
  }, []);

  return {
    contracts,
    summary,
    overdue,
    loading,
    error,
    fetchContracts,
    fetchSummary,
    fetchOverdue,
    fetchContract,
    createContract,
    updateContract,
    deleteContract,
    uploadFile,
    downloadFile,
    deleteFile,
  };
};
