import { useState, useCallback } from 'react';
import { Staff, CreateStaffInput, UpdateStaffInput } from '../types';
import { staffService } from '../api/staffService';

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffService.list();
      setStaff(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaffMember = useCallback(async (staffMember: CreateStaffInput) => {
    setLoading(true);
    setError(null);
    try {
      const newStaff = await staffService.create(staffMember);
      setStaff((prev) => [...prev, newStaff]);
      return newStaff;
    } catch (err: any) {
      setError(err.message || 'Failed to create staff');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStaffMember = useCallback(async (id: number, staffMember: UpdateStaffInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await staffService.update(id, staffMember);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update staff');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStaffMember = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await staffService.delete(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
  };
};
