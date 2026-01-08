import React, { useEffect, useState } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import { useStaff } from '../hooks/useStaff';
import { useSites } from '../hooks/useSites';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { MeetingItem, CreateMeetingInput, Staff, Site } from '../types';
import { formatDate, formatFullName } from '../utils/formatters';
import { Plus, Trash2, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MeetingList: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, loading, error, fetchMeetings, createMeeting, deleteMeeting } = useMeetings();
  const { staff, fetchStaff } = useStaff();
  const { sites, fetchSites } = useSites();
  const [showForm, setShowForm] = useState(false);
  const [siteId, setSiteId] = useState<string | undefined>(undefined);
  const [agenda, setAgenda] = useState('');
  const [chairpersonId, setChairpersonId] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<MeetingItem[]>([]);
  const [meetingDate, setMeetingDate] = useState<string | undefined>(undefined);
  const [meetingTime, setMeetingTime] = useState<string | undefined>(undefined);
  const [selectedAttendees, setSelectedAttendees] = useState<{ id: number; name: string }[]>([]);
  const [attendeeSelect, setAttendeeSelect] = useState<string | undefined>(undefined);
  const [selectedAbsentees, setSelectedAbsentees] = useState<{ id: number; name: string }[]>([]);
  const [absentSelect, setAbsentSelect] = useState<string | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchStaff();
    fetchSites();
  }, []);

  useEffect(() => {
    if (showForm) {
      fetchStaff();
      fetchSites();
    }
  }, [showForm]);

  const addItem = () => {
    setItems([
      ...items,
      {
        issue_discussed: '',
        responsible_staff_ids: [],
        target_date: undefined,
        invoice_date: undefined,
        payment_date: undefined,
      } as any,
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: MeetingItem, i: number) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) {
      setFormLoading(false);
      throw new Error('Site ID is required');
    }

    setFormLoading(true);
    try {
      const attendeeNames = selectedAttendees.map((a: { id: number; name: string }) => a.name);
      const absentNames = selectedAbsentees.map((a: { id: number; name: string }) => a.name);
      const scheduledAt = meetingDate ? `${meetingDate}${meetingTime ? 'T' + meetingTime + ':00' : ''}` : undefined;

      console.log('DEBUG - selectedAttendees:', selectedAttendees);
      console.log('DEBUG - attendeeNames array:', attendeeNames);
      console.log('DEBUG - absentNames array:', absentNames);

      // Clean up items to only include fields expected by backend
      const cleanedItems = items.map((item: any) => ({
        issue_discussed: item.issue_discussed,
        responsible_staff_ids: item.responsible_staff_ids || [],
        target_date: item.target_date || undefined,
        invoice_date: item.invoice_date || undefined,
        payment_date: item.payment_date || undefined,
      }));

      const payload: CreateMeetingInput = {
        site_id: parseInt(siteId, 10),
        agenda,
        chairperson_staff_id: chairpersonId ? parseInt(chairpersonId, 10) : undefined,
        scheduled_at: scheduledAt,
        attendees: attendeeNames.length ? attendeeNames.join(', ') : '',
        apologies: absentNames.length ? absentNames.join(', ') : '',
        items: cleanedItems as any,
      };
      console.log('Creating meeting with payload:', payload);
      await createMeeting(payload);
      setSiteId(undefined);
      setAgenda('');
      setChairpersonId('');
      setItems([]);
      setMeetingDate(undefined);
      setMeetingTime(undefined);
      setSelectedAttendees([]);
      setSelectedAbsentees([]);
      setShowForm(false);
      await fetchMeetings();
    } catch {
      // Error is handled
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      await deleteMeeting(id);
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="inline mr-2" />
          New Meeting
        </Button>
      </div>

      <ErrorMessage message={error} />

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Meeting</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
              <select
                value={siteId ?? ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSiteId(e.target.value || undefined)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select a site</option>
                {sites.length === 0 ? (
                  <option disabled>No sites found</option>
                ) : (
                  sites.map((s: Site) => (
                    <option key={s.id} value={s.id.toString()}>{s.name}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson</label>
              <select value={chairpersonId ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChairpersonId(e.target.value || undefined)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option value="">Select a staff member</option>
                {staff.map((s: any) => (
                  <option key={s.id} value={s.id.toString()}>{formatFullName(s.name, s.surname)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date & Time</label>
              <div className="flex gap-2">
                <input type="date" value={meetingDate ?? ''} onChange={(e) => setMeetingDate(e.target.value || undefined)} className="px-3 py-2 border rounded" />
                <input type="time" value={meetingTime ?? ''} onChange={(e) => setMeetingTime(e.target.value || undefined)} className="px-3 py-2 border rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendees <span className="text-xs text-gray-500">(optional)</span></label>
              <div className="mb-2 flex gap-2">
                <select value={attendeeSelect ?? ''} onChange={(e) => setAttendeeSelect(e.target.value || undefined)} className="flex-1 px-3 py-2 border rounded">
                  <option value="">Select staff member to add...</option>
                  {staff.length === 0 ? (
                    <option disabled>No staff available</option>
                  ) : (
                    staff.map((s: Staff) => (
                      <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
                    ))
                  )}
                </select>
                <Button type="button" onClick={() => {
                  if (attendeeSelect) {
                    const id = parseInt(attendeeSelect, 10);
                    const s = staff.find((x: Staff) => x.id === id);
                    if (s && !selectedAttendees.some(a => a.id === id)) {
                      const fullName = formatFullName(s.name, s.surname);
                      setSelectedAttendees([...selectedAttendees, { id, name: fullName }]);
                    }
                    setAttendeeSelect(undefined);
                  }
                }}>Add</Button>
              </div>
              {selectedAttendees.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedAttendees.map((attendee: { id: number; name: string }) => (
                    <div key={attendee.id} className="px-2 py-1 bg-blue-100 rounded text-sm flex items-center gap-2">
                      <span>{attendee.name}</span>
                      <button type="button" onClick={() => setSelectedAttendees(selectedAttendees.filter((a: { id: number; name: string }) => a.id !== attendee.id))} className="text-red-600">✕</button>
                    </div>
                  ))}
                </div>
              )}
              {selectedAttendees.length === 0 && (
                <p className="text-xs text-gray-500">No attendees added yet</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Absent Staff <span className="text-xs text-gray-500">(optional)</span></label>
              <div className="mb-2 flex gap-2">
                <select value={absentSelect ?? ''} onChange={(e) => setAbsentSelect(e.target.value || undefined)} className="flex-1 px-3 py-2 border rounded">
                  <option value="">Select staff member to add...</option>
                  {staff.length === 0 ? (
                    <option disabled>No staff available</option>
                  ) : (
                    staff.map((s: Staff) => (
                      <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
                    ))
                  )}
                </select>
                <Button type="button" onClick={() => {
                  if (absentSelect) {
                    const id = parseInt(absentSelect, 10);
                    const s = staff.find((x: Staff) => x.id === id);
                    if (s && !selectedAbsentees.some((a: { id: number; name: string }) => a.id === id)) {
                      const fullName = formatFullName(s.name, s.surname);
                      setSelectedAbsentees([...selectedAbsentees, { id, name: fullName }]);
                    }
                    setAbsentSelect(undefined);
                  }
                }}>Add</Button>
              </div>
              {selectedAbsentees.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedAbsentees.map((absentee: { id: number; name: string }) => (
                    <div key={absentee.id} className="px-2 py-1 bg-red-100 rounded text-sm flex items-center gap-2">
                      <span>{absentee.name}</span>
                      <button type="button" onClick={() => setSelectedAbsentees(selectedAbsentees.filter((a: { id: number; name: string }) => a.id !== absentee.id))} className="text-red-600">✕</button>
                    </div>
                  ))}
                </div>
              )}
              {selectedAbsentees.length === 0 && (
                <p className="text-xs text-gray-500">No absent staff added yet</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Meeting Items</h3>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Issue Discussed</label>
                      <input
                        type="text"
                        placeholder="Describe the issue..."
                        value={item.issue_discussed}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'issue_discussed', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Staff Responsible</label>
                      <div className="mb-2 flex gap-2">
                        <select 
                          onChange={(e) => {
                            const staffId = e.target.value ? parseInt(e.target.value, 10) : undefined;
                            if (staffId && !item.responsible_staff_ids?.includes(staffId)) {
                              const newIds = [...(item.responsible_staff_ids || []), staffId];
                              updateItem(idx, 'responsible_staff_ids', newIds);
                              e.target.value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 border rounded text-sm"
                        >
                          <option value="">Select staff member...</option>
                          {staff.filter((s: Staff) => !item.responsible_staff_ids?.includes(s.id)).map(s => (
                            <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(item.responsible_staff_ids || []).map((staffId: number) => {
                          const staffMember = staff.find((s: Staff) => s.id === staffId);
                          return staffMember ? (
                            <div key={staffId} className="px-2 py-1 bg-blue-100 rounded text-xs flex items-center gap-2">
                              <span>{formatFullName(staffMember.name, staffMember.surname)}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newIds = (item.responsible_staff_ids || []).filter((id: number) => id !== staffId);
                                  updateItem(idx, 'responsible_staff_ids', newIds);
                                }}
                                className="text-red-600 font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Target Date</label>
                        <input
                          type="date"
                          value={item.target_date ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'target_date', e.target.value || undefined)}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Invoice Date</label>
                        <input
                          type="date"
                          value={item.invoice_date ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'invoice_date', e.target.value || undefined)}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Payment Date</label>
                        <input
                          type="date"
                          value={item.payment_date ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'payment_date', e.target.value || undefined)}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                    </div>

                    <Button type="button" variant="destructive" className="w-full" onClick={() => removeItem(idx)}>Remove Item</Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="secondary" className="mt-2" onClick={addItem}>
                Add Item
              </Button>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Creating...' : 'Create Meeting'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : meetings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No meetings found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Site</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Agenda</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr 
                    key={meeting.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">#{meeting.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sites.find((s: Site) => s.id === meeting.site_id)?.name ?? meeting.site_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{meeting.agenda?.substring(0, 30)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{meeting.items?.length || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(meeting.created_at)}</td>
                    <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button className="px-3 py-1" onClick={() => navigate(`/meetings/${meeting.id}`)}>
                          <Eye size={16} />
                        </Button>
                        <Button className="px-3 py-1" onClick={() => navigate(`/meetings/${meeting.id}/edit`)}>
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          className="px-3 py-1"
                          onClick={() => handleDelete(meeting.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
