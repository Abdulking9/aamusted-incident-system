import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  investigating: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function IncidentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/incidents/${id}`)
      .then(({ data }) => { setIncident(data); setLoading(false); })
      .catch(() => { toast.error('Incident not found'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!incident) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white px-6 py-4 flex items-center gap-4 shadow">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-blue-200 hover:text-white text-sm">← Back</Link>
        <div>
          <h1 className="font-bold">{incident.reference}</h1>
          <p className="text-blue-200 text-xs">Incident Detail</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">{incident.title}</h2>
            <span className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[incident.status]}`}>
              {incident.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><p className="text-gray-400">Category</p><p className="font-medium capitalize">{incident.category}</p></div>
            <div><p className="text-gray-400">Priority</p><p className="font-medium capitalize">{incident.priority}</p></div>
            <div><p className="text-gray-400">Location</p><p className="font-medium">{incident.location}</p></div>
            <div><p className="text-gray-400">Date of Incident</p><p className="font-medium">{incident.incident_date}</p></div>
            <div><p className="text-gray-400">Reported On</p><p className="font-medium">{new Date(incident.created_at).toLocaleDateString()}</p></div>
            {incident.resolved_at && (
              <div><p className="text-gray-400">Resolved On</p><p className="font-medium">{new Date(incident.resolved_at).toLocaleDateString()}</p></div>
            )}
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Description</p>
            <p className="text-gray-700 text-sm leading-relaxed">{incident.description}</p>
          </div>
          {incident.admin_notes && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700 mb-1">Admin Notes</p>
              <p className="text-sm text-blue-800">{incident.admin_notes}</p>
            </div>
          )}
        </div>

        {incident.updates?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Activity Log</h3>
            <div className="space-y-3">
              {incident.updates.map((u) => (
                <div key={u.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{u.note}</p>
                    <p className="text-xs text-gray-400">{u.updated_by_name} · {new Date(u.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
