import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, ErrorMessage, LoadingSpinner } from '../components/Common';
import { useSites } from '../hooks/useSites';
import { useMeetings } from '../hooks/useMeetings';
import { useStaff } from '../hooks/useStaff';
import { CreateSiteInput } from '../types';
import { siteService } from '../api/siteService';
import { formatFullName } from '../utils/formatters';

export const SiteForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { createSite, updateSite } = useSites();

  const [formData, setFormData] = useState<CreateSiteInput>({
    name: '',
    contact_person: '',
    contact_number: '',
    contact_email: '',
    coordinates: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      setFetching(true);
      setError(null);
      try {
        const data = await siteService.get(parseInt(id, 10));
        setFormData({
          name: data.name || '',
          contact_person: data.contact_person || '',
          contact_number: data.contact_number || '',
          contact_email: data.contact_email || '',
          coordinates: data.coordinates || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load site');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim() === '') {
      setError('Name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isEdit && id) {
        const updated = await updateSite(parseInt(id, 10), formData);
        navigate(`/sites/${updated.id}`);
      } else {
        const newSite = await createSite(formData);
        navigate(`/sites/${newSite.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save site');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <Card>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit Site' : 'New Site'}</h1>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Power Station Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
          <input
            type="text"
            value={formData.contact_person || ''}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input
            type="tel"
            value={formData.contact_number || ''}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email Address</label>
          <input
            type="email"
            value={formData.contact_email || ''}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Coordinates</label>
          <input
            type="text"
            placeholder="e.g., -26.1234, 28.5678"
            value={formData.coordinates || ''}
            onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Site' : 'Create Site')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(isEdit && id ? `/sites/${id}` : '/sites')}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};

export const MeetingForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { createMeeting, updateMeeting } = useMeetings();
  const { sites, fetchSites } = useSites();
  const { staff, fetchStaff } = useStaff();

  const [siteId, setSiteId] = useState<string | undefined>(undefined);
  const [agenda, setAgenda] = useState('');
  const [chairpersonId, setChairpersonId] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<any[]>([]);
  const [meetingDate, setMeetingDate] = useState<string | undefined>(undefined);
  const [meetingTime, setMeetingTime] = useState<string | undefined>(undefined);
  const [selectedAttendees, setSelectedAttendees] = useState<{ id: number; name: string }[]>([]);
  const [attendeeSelect, setAttendeeSelect] = useState<string | undefined>(undefined);
  const [selectedAbsentees, setSelectedAbsentees] = useState<{ id: number; name: string }[]>([]);
  const [absentSelect, setAbsentSelect] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      setFetching(true);
      setError(null);
      try {
        console.log('DEBUG: Loading meeting with id:', id);
        const data = await import('../api/meetingService').then(m => m.meetingService.get(parseInt(id, 10)));
        console.log('DEBUG: Loaded meeting data:', data);
        setSiteId(data.site_id.toString());
        setAgenda(data.agenda || '');
        setChairpersonId(data.chairperson_staff_id ? data.chairperson_staff_id.toString() : undefined);
        setItems(data.items || []);
        // scheduled_at -> date/time
        if (data.scheduled_at) {
          const [d, t] = data.scheduled_at.split('T');
          setMeetingDate(d);
          setMeetingTime(t ? t.slice(0,5) : undefined);
        }
        // Map attendees and apologies (stored as comma-separated names) back to {id, name} objects
        if (data.attendees) {
          const names = data.attendees.split(',').map((n: string) => n.trim()).filter(Boolean);
          console.log('DEBUG Edit: attendees string:', data.attendees);
          console.log('DEBUG Edit: parsed names:', names);
          const all = await import('../api/staffService').then(s => s.staffService.list());
          console.log('DEBUG Edit: all staff:', all);
          const mapped = all.filter((s: any) => names.includes(formatFullName(s.name, s.surname))).map((s:any) => ({ id: s.id, name: formatFullName(s.name, s.surname) }));
          console.log('DEBUG Edit: mapped attendees:', mapped);
          setSelectedAttendees(mapped);
        }
        if (data.apologies) {
          const names = data.apologies.split(',').map((n: string) => n.trim()).filter(Boolean);
          console.log('DEBUG Edit: apologies string:', data.apologies);
          console.log('DEBUG Edit: parsed absent names:', names);
          const all = await import('../api/staffService').then(s => s.staffService.list());
          const mapped = all.filter((s: any) => names.includes(formatFullName(s.name, s.surname))).map((s:any) => ({ id: s.id, name: formatFullName(s.name, s.surname) }));
          console.log('DEBUG Edit: mapped absentees:', mapped);
          setSelectedAbsentees(mapped);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load meeting');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const addItem = () => setItems([...items, { issue_discussed: '', person_responsible_staff_id: undefined, target_date: undefined, invoice_date: undefined, payment_date: undefined }]);
  const removeItem = (index: number) => setItems(items.filter((_: any, i: number) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) { setError('Site is required'); return; }
    setLoading(true);
    setError(null);
    try {
      const attendeeNames = selectedAttendees.map((a: { id: number; name: string }) => a.name).join(', ');
      const absentNames = selectedAbsentees.map((a: { id: number; name: string }) => a.name).join(', ');

      console.log('DEBUG FormPages - selectedAttendees:', selectedAttendees);
      console.log('DEBUG FormPages - attendeeNames:', attendeeNames);
      console.log('DEBUG FormPages - absentNames:', absentNames);

      const scheduled_at = meetingDate ? (meetingTime ? `${meetingDate}T${meetingTime}:00` : `${meetingDate}T00:00:00`) : undefined;

      const payload = {
        site_id: parseInt(siteId, 10),
        agenda,
        chairperson_staff_id: chairpersonId ? parseInt(chairpersonId, 10) : undefined,
        scheduled_at,
        attendees: attendeeNames || '',
        apologies: absentNames || '',
        items,
      };
      console.log('FormPages payload:', payload);
      if (isEdit && id) {
        const updated = await updateMeeting(parseInt(id, 10), payload);
        navigate(`/meetings/${updated.id}`);
      } else {
        const created = await createMeeting(payload);
        navigate(`/meetings/${created.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <Card>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit Meeting' : 'New Meeting'}</h1>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
          <select
            value={siteId ?? ''}
            onChange={(e) => setSiteId(e.target.value || undefined)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Select a site</option>
            {sites.map((s: any) => (
              <option key={s.id} value={s.id.toString()}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
          <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson</label>
          <select value={chairpersonId ?? ''} onChange={(e) => setChairpersonId(e.target.value || undefined)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Select a staff member</option>
            {staff.map((s: any) => (
              <option key={s.id} value={s.id.toString()}>{formatFullName(s.name, s.surname)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date & Time</label>
          <div className="flex gap-2">
            <input type="date" value={meetingDate ?? ''} onChange={(e) => setMeetingDate(e.target.value || undefined)} className="px-3 py-2 border rounded" />
            <input type="time" value={meetingTime ?? ''} onChange={(e) => setMeetingTime(e.target.value || undefined)} className="px-3 py-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
          <div className="mb-2 flex gap-2">
            <select value={attendeeSelect ?? ''} onChange={(e) => setAttendeeSelect(e.target.value || undefined)} className="flex-1 px-3 py-2 border rounded">
              <option value="">Select staff member...</option>
              {staff.map((s: any) => (
                <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
              ))}
            </select>
            <Button type="button" onClick={() => {
              if (attendeeSelect) {
                const id = parseInt(attendeeSelect, 10);
                const s = staff.find((x: any) => x.id === id);
                if (s && !selectedAttendees.some((a: { id: number; name: string }) => a.id === id)) {
                  const fullName = formatFullName(s.name, s.surname);
                  setSelectedAttendees([...selectedAttendees, { id, name: fullName }]);
                }
                setAttendeeSelect(undefined);
              }
            }}>Add</Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedAttendees.map((a: { id: number; name: string }) => (
              <div key={a.id} className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-2">
                <span>{a.name}</span>
                <button type="button" onClick={() => setSelectedAttendees(selectedAttendees.filter((item: { id: number; name: string }) => item.id !== a.id))} className="text-red-600">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Absent Staff</label>
          <div className="mb-2 flex gap-2">
            <select value={absentSelect ?? ''} onChange={(e) => setAbsentSelect(e.target.value || undefined)} className="flex-1 px-3 py-2 border rounded">
              <option value="">Select staff member...</option>
              {staff.map((s: any) => (
                <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
              ))}
            </select>
            <Button type="button" onClick={() => {
              if (absentSelect) {
                const id = parseInt(absentSelect, 10);
                const s = staff.find((x: any) => x.id === id);
                if (s && !selectedAbsentees.some((a: { id: number; name: string }) => a.id === id)) {
                  const fullName = formatFullName(s.name, s.surname);
                  setSelectedAbsentees([...selectedAbsentees, { id, name: fullName }]);
                }
                setAbsentSelect(undefined);
              }
            }}>Add</Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedAbsentees.map((a: { id: number; name: string }) => (
              <div key={a.id} className="px-2 py-1 bg-yellow-100 rounded text-sm flex items-center gap-2">
                <span>{a.name}</span>
                <button type="button" onClick={() => setSelectedAbsentees(selectedAbsentees.filter((item: { id: number; name: string }) => item.id !== a.id))} className="text-red-600">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting Items</h3>
          <div className="grid grid-cols-12 gap-2 items-center text-sm text-gray-600 mb-2">
            <div className="col-span-5 font-medium">Issue</div>
            <div className="col-span-3 font-medium">Person Responsible</div>
            <div className="col-span-2 font-medium">Target Date</div>
            <div className="col-span-2 font-medium">Invoice / Payment</div>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Issue"
                    value={item.issue_discussed}
                    onChange={(e) => updateItem(idx, 'issue_discussed', e.target.value)}
                    className="col-span-5 px-3 py-2 border rounded"
                  />

                  <select
                    value={item.person_responsible_staff_id ?? ''}
                    onChange={(e) => updateItem(idx, 'person_responsible_staff_id', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="col-span-3 px-3 py-2 border rounded"
                  >
                    <option value="">Person responsible...</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={item.target_date ?? ''}
                    onChange={(e) => updateItem(idx, 'target_date', e.target.value || undefined)}
                    className="col-span-2 px-3 py-2 border rounded"
                  />

                  <div className="col-span-2 flex flex-col gap-2">
                    <input
                      type="date"
                      value={item.invoice_date ?? ''}
                      onChange={(e) => updateItem(idx, 'invoice_date', e.target.value || undefined)}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="date"
                      value={item.payment_date ?? ''}
                      onChange={(e) => updateItem(idx, 'payment_date', e.target.value || undefined)}
                      className="px-3 py-2 border rounded"
                    />
                    <Button type="button" variant="destructive" className="mt-2" onClick={() => removeItem(idx)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" className="mt-2" onClick={addItem}>Add Item</Button>
          </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Meeting' : 'Create Meeting')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(isEdit && id ? `/meetings/${id}` : '/meetings')}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};

export const ContractForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { createContract, updateContract } = useContracts();
  const { sites, fetchSites } = useSites();
  const { staff, fetchStaff } = useStaff();

  const [formData, setFormData] = useState<CreateContractInput>({
    contract_type: 'Supply',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active',
    site_id: 0,
    responsible_staff_id: 0,
    eskom_reference: '',
    contact_person_name: '',
    contact_person_telephone: '',
    contact_person_email: '',
    internal_quotation_number: '',
    internal_invoice_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sites and staff on component mount
  useEffect(() => {
    fetchSites();
    fetchStaff();
  }, [fetchSites, fetchStaff]);

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      setFetching(true);
      setError(null);
      try {
        const data = await contractService.get(parseInt(id, 10));
        setFormData({
          contract_type: data.contract_type,
          start_date: data.start_date.split('T')[0],
          end_date: data.end_date.split('T')[0],
          status: data.status,
          site_id: data.site_id,
          responsible_staff_id: data.responsible_staff_id,
          eskom_reference: data.eskom_reference || '',
          contact_person_name: data.contact_person_name || '',
          contact_person_telephone: data.contact_person_telephone || '',
          contact_person_email: data.contact_person_email || '',
          internal_quotation_number: data.internal_quotation_number || '',
          internal_invoice_number: data.internal_invoice_number || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load contract');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate required fields
    if (!formData.site_id || !formData.responsible_staff_id) {
      setError('Site and Staff Member are required');
      setLoading(false);
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('Start date must be before end date');
      setLoading(false);
      return;
    }

    try {
      if (isEdit && id) {
        await updateContract(parseInt(id, 10), formData);
      } else {
        await createContract(formData);
      }
      navigate('/contracts');
    } catch (err: any) {
      setError(err.message || 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <Card>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">{isEdit ? 'Edit Contract' : 'New Contract'}</h1>
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
            <select
              required
              value={formData.contract_type}
              onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as 'Supply' | 'Service' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Supply">Supply</option>
              <option value="Service">Service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Associated Site *</label>
            <select
              required
              value={formData.site_id}
              onChange={(e) => setFormData({ ...formData, site_id: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value={0}>Select a site...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Staff Member *</label>
            <select
              required
              value={formData.responsible_staff_id}
              onChange={(e) => setFormData({ ...formData, responsible_staff_id: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value={0}>Select staff member...</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{formatFullName(s.name, s.surname)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Reference Numbers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eskom Contract Reference</label>
              <input
                type="text"
                value={formData.eskom_reference}
                onChange={(e) => setFormData({ ...formData, eskom_reference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Quotation Number</label>
              <input
                type="text"
                value={formData.internal_quotation_number}
                onChange={(e) => setFormData({ ...formData, internal_quotation_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Invoice Number</label>
              <input
                type="text"
                value={formData.internal_invoice_number}
                onChange={(e) => setFormData({ ...formData, internal_invoice_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                value={formData.contact_person_name}
                onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Telephone</label>
              <input
                type="tel"
                value={formData.contact_person_telephone}
                onChange={(e) => setFormData({ ...formData, contact_person_telephone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Email</label>
              <input
                type="email"
                value={formData.contact_person_email}
                onChange={(e) => setFormData({ ...formData, contact_person_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Contract' : 'Create Contract')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(isEdit && id ? `/contracts/${id}/view` : '/contracts')}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};

import { useContracts } from '../hooks/useContracts';
import { CreateContractInput } from '../types';
import { contractService } from '../api/contractService';
