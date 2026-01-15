import { useState, useCallback } from 'react';
import { Meeting, CreateMeetingInput, UpdateMeetingInput } from '../types';
import { meetingService } from '../api/meetingService';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async (siteId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingService.list(0, 100, siteId);
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeeting = useCallback(async (meeting: CreateMeetingInput) => {
    setLoading(true);
    setError(null);
    try {
      const newMeeting = await meetingService.create(meeting);
      setMeetings((prev) => [...prev, newMeeting]);
      return newMeeting;
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMeeting = useCallback(async (id: number, meeting: UpdateMeetingInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await meetingService.update(id, meeting);
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update meeting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMeeting = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await meetingService.delete(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete meeting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
};
