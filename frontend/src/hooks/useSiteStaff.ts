import { useState, useCallback } from 'react';
import { Staff } from '../types';
import { siteService } from '../api/siteService';

export const useSiteStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteStaff = useCallback(async (siteId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await siteService.getStaff(siteId);
      setStaff(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch site staff');
    } finally {
      setLoading(false);
    }
  }, []);

  const addStaff = useCallback(async (siteId: number, staffId: number) => {
    setLoading(true);
    setError(null);
    try {
      await siteService.addStaff(siteId, staffId);
      // Refetch the staff list
      await fetchSiteStaff(siteId);
    } catch (err: any) {
      setError(err.message || 'Failed to add staff to site');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSiteStaff]);

  const removeStaff = useCallback(async (siteId: number, staffId: number) => {
    setLoading(true);
    setError(null);
    try {
      await siteService.removeStaff(siteId, staffId);
      // Refetch the staff list
      await fetchSiteStaff(siteId);
    } catch (err: any) {
      setError(err.message || 'Failed to remove staff from site');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSiteStaff]);

  return {
    staff,
    loading,
    error,
    fetchSiteStaff,
    addStaff,
    removeStaff,
  };
};
