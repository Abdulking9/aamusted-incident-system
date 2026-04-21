import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  investigating: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const PRIORITY_STYLES = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/incidents').then(({ data }) => { setIncidents(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load incidents'); setLoading(false); });
  }, []);

  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === 'pending').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center font-bold">A</div>
          <div>
            <h1 className="font-bold text-lg leading-none">AAMUSTED IRS</h1>
            <p className="text-blue-200 text-xs">Incident Reporting System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-200 hidden sm:block">{user?.name}</span>
          <Link to="/report"
            className="bg-white text-blue-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
            + Report Incident
          </Link>
          <button onClick={logout}
            className="text-blue-200 text-sm hover:text-white transition">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Reports</h2>
          <p className="text-gray-500 text-sm">Track the status of your submitted incidents</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Investigating', value: stats.investigating, color: 'bg-orange-50 text-orange-700' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-50 text-green-700' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No incidents reported yet</p>
            <Link to="/report" className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition">
              Report Your First Incident
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/incidents/${inc.id}`)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{inc.reference}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[inc.status]}`}>
                        {inc.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_STYLES[inc.priority]}`}>
                        {inc.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 truncate">{inc.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">{inc.category} · {inc.location}</p>
                  </div>
                  <p className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                    {new Date(inc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
