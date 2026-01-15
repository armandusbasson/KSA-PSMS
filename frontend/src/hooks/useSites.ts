import { useState, useCallback } from 'react';
import { Site, CreateSiteInput, UpdateSiteInput } from '../types';
import { siteService } from '../api/siteService';

export const useSites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await siteService.list();
      setSites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSite = useCallback(async (site: CreateSiteInput) => {
    setLoading(true);
    setError(null);
    try {
      const newSite = await siteService.create(site);
      setSites((prev) => [...prev, newSite]);
      return newSite;
    } catch (err: any) {
      setError(err.message || 'Failed to create site');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSite = useCallback(async (id: number, site: UpdateSiteInput) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSite = await siteService.update(id, site);
      setSites((prev) =>
        prev.map((s) => (s.id === id ? updatedSite : s))
      );
      return updatedSite;
    } catch (err: any) {
      setError(err.message || 'Failed to update site');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSite = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await siteService.delete(id);
      setSites((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete site');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sites,
    loading,
    error,
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
  };
};
