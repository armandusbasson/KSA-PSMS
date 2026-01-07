import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/Common';
import { meetingService } from '../api/meetingService';
import { siteService } from '../api/siteService';
import { staffService } from '../api/staffService';
import { formatDate, formatFullName, formatDateTime } from '../utils/formatters';

export const MeetingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any | null>(null);
  const [site, setSite] = useState<any | null>(null);
  const [chair, setChair] = useState<any | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await meetingService.get(parseInt(id, 10));
        setMeeting(m);
        const s = await siteService.get(m.site_id);
        setSite(s);
        // load staff list to map responsible persons
        const allStaff = await staffService.list();
        setStaff(allStaff);
        if (m.chairperson_staff_id) {
          const c = await staffService.get(m.chairperson_staff_id);
          setChair(c);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load meeting');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!meeting) return <p className="text-gray-500">Meeting not found</p>;

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">Meeting #{meeting.id}</h1>
          <p className="text-gray-600 mt-1">Created: {new Date(meeting.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/meetings/${meeting.id}/edit`)}>Edit</Button>
          <Link to="/meetings"><Button variant="secondary">Back</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Site</h3>
          {site ? (
            <Link to={`/sites/${site.id}`} className="text-blue-600 hover:underline">{site.name}</Link>
          ) : (
            <p className="text-gray-600">Unknown</p>
          )}

          <h3 className="text-sm font-semibold text-gray-700 mt-4">Chairperson</h3>
          {chair ? <p className="text-gray-600">{formatFullName(chair.name, chair.surname)}</p> : <p className="text-gray-600">Not set</p>}

          <h3 className="text-sm font-semibold text-gray-700 mt-4">Agenda</h3>
          <p className="text-gray-700">{meeting.agenda || '—'}</p>

          <h3 className="text-sm font-semibold text-gray-700 mt-4">Scheduled</h3>
          <p className="text-gray-700">{meeting.scheduled_at ? formatDateTime(meeting.scheduled_at) : '—'}</p>

          <h3 className="text-sm font-semibold text-gray-700 mt-4">Attendees</h3>
          <p className="text-gray-700">{meeting.attendees || '—'}</p>

          <h3 className="text-sm font-semibold text-gray-700 mt-4">Apologies</h3>
          <p className="text-gray-700">{meeting.apologies || '—'}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700">Items</h3>
          {meeting.items && meeting.items.length > 0 ? (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Issue</th>
                    <th className="px-3 py-2 text-left">Person Responsible</th>
                    <th className="px-3 py-2 text-left">Target Date</th>
                    <th className="px-3 py-2 text-left">Invoice Date</th>
                    <th className="px-3 py-2 text-left">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {meeting.items.map((it: any) => {
                    const resp = staff.find((s: any) => s.id === it.person_responsible_staff_id);
                    return (
                      <tr key={it.id || Math.random()}>
                        <td className="px-3 py-2 align-top">{it.issue_discussed}</td>
                        <td className="px-3 py-2 align-top">{resp ? formatFullName(resp.name, resp.surname) : '—'}</td>
                        <td className="px-3 py-2 align-top">{it.target_date ? formatDate(it.target_date) : '—'}</td>
                        <td className="px-3 py-2 align-top">{it.invoice_date ? formatDate(it.invoice_date) : '—'}</td>
                        <td className="px-3 py-2 align-top">{it.payment_date ? formatDate(it.payment_date) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No items</p>
          )}
        </div>
      </div>
    </Card>
  );
};