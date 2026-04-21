import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState({ status: '', category: '', priority: '' });
  const [tab, setTab] = useState('dashboard');
  const [updating, setUpdating] = useState(null);

  const fetchStats = () => api.get('/admin/stats').then(({ data }) => setStats(data));
  const fetchIncidents = () => {
    const params = new URLSearchParams(filter).toString();
    api.get(`/admin/incidents?${params}`).then(({ data }) => setIncidents(data));
  };

  useEffect(() => { fetchStats(); fetchIncidents(); }, []);
  useEffect(() => { fetchIncidents(); }, [filter]);

  const updateStatus = async (id, status, note) => {
    setUpdating(id);
    try {
      await api.put(`/admin/incidents/${id}`, { status, note: note || `Status changed to ${status}` });
      toast.success('Incident updated');
      fetchStats();
      fetchIncidents();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center font-bold">A</div>
          <div>
            <h1 className="font-bold text-lg leading-none">AAMUSTED IRS — Admin</h1>
            <p className="text-blue-300 text-xs">Incident Management Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-300 hidden sm:block">{user?.name}</span>
          <button onClick={logout} className="text-blue-300 text-sm hover:text-white transition">Logout</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-2 mb-6">
          {['dashboard', 'incidents'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total', value: stats.total, color: 'text-blue-700 bg-blue-50' },
                { label: 'Pending', value: stats.pending, color: 'text-yellow-700 bg-yellow-50' },
                { label: 'Investigating', value: stats.investigating, color: 'text-orange-700 bg-orange-50' },
                { label: 'Resolved', value: stats.resolved, color: 'text-green-700 bg-green-50' },
                { label: 'Users', value: stats.totalUsers, color: 'text-purple-700 bg-purple-50' },
              ].map((s) => (
                <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Incidents by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.byCategory}>
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Recent Incidents</h3>
              <div className="space-y-2">
                {stats.recent.map((inc) => (
                  <div key={inc.id}
                    className="flex justify-between items-center py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 px-2 rounded-lg"
                    onClick={() => navigate(`/incidents/${inc.id}`)}>
                    <div>
                      <span className="font-medium text-sm text-gray-800">{inc.title}</span>
                      <span className="text-gray-400 text-xs ml-2">by {inc.reporter_name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[inc.status]}`}>
                      {inc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'incidents' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 flex-wrap">
              {['status', 'category', 'priority'].map((field) => (
                <select key={field}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter[field]} onChange={(e) => setFilter({ ...filter, [field]: e.target.value })}>
                  <option value="">All {field}s</option>
                  {field === 'status' && ['pending', 'investigating', 'resolved', 'closed'].map(v => <option key={v} value={v}>{v}</option>)}
                  {field === 'category' && ['theft', 'assault', 'vandalism', 'harassment', 'cybercrime', 'fire', 'medical', 'other'].map(v => <option key={v} value={v}>{v}</option>)}
                  {field === 'priority' && ['low', 'medium', 'high', 'critical'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ))}
            </div>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-mono">{inc.reference}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[inc.status]}`}>{inc.status}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_STYLES[inc.priority]}`}>{inc.priority}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">{inc.title}</h3>
                      <p className="text-sm text-gray-500">By {inc.reporter_name} ({inc.reporter_email}) · {inc.location}</p>
                    </div>
                    <button onClick={() => navigate(`/incidents/${inc.id}`)} className="text-blue-600 text-sm hover:underline">View</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['pending', 'investigating', 'resolved', 'closed']
                      .filter(s => s !== inc.status)
                      .map(s => (
                        <button key={s} disabled={updating === inc.id}
                          onClick={() => updateStatus(inc.id, s, null)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition capitalize disabled:opacity-50">
                          → {s}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
