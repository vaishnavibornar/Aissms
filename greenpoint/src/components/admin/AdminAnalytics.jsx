import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import './AdminAnalytics.css';

const STATUS_COLORS = {
  resolved: '#22c55e',
  pending: '#f59e0b',
  approved: '#3b82f6',
  assigned: '#8b5cf6',
  rejected: '#ef4444'
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({
      date: d.toISOString().slice(0, 10),
      day: DAY_LABELS[d.getDay()],
      complaints: 0
    });
  }
  return days;
}

export default function AdminAnalytics() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setComplaints(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const statusData = useMemo(() => {
    const counts = { pending: 0, approved: 0, assigned: 0, resolved: 0, rejected: 0 };
    complaints.forEach((c) => {
      const s = (c.status || 'pending').toLowerCase();
      if (counts.hasOwnProperty(s)) counts[s]++;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      return [{ name: 'No complaints yet', value: 1, color: '#64748b' }];
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: STATUS_COLORS[name] || '#94a3b8'
      }));
  }, [complaints]);

  const categoryData = useMemo(() => {
    const byRegion = {};
    complaints.forEach((c) => {
      const key = c.region || 'Uncategorized';
      byRegion[key] = (byRegion[key] || 0) + 1;
    });
    const entries = Object.entries(byRegion).map(([category, count]) => ({ category, count }));
    entries.sort((a, b) => b.count - a.count);
    if (entries.length === 0) {
      return [{ category: 'No data', count: 0 }];
    }
    return entries;
  }, [complaints]);

  const weeklyActivity = useMemo(() => {
    const last7 = getLast7Days();
    complaints.forEach((c) => {
      const raw = c.createdAt;
      const date = raw?.toDate ? raw.toDate() : new Date(raw);
      const key = date.toISOString().slice(0, 10);
      const row = last7.find((d) => d.date === key);
      if (row) row.complaints++;
    });
    return last7;
  }, [complaints]);

  const totalComplaints = complaints.length;
  const hasData = totalComplaints > 0;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const isNoData = percent >= 0.99;
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={isNoData ? 12 : 14}
        fontWeight="600"
      >
        {isNoData ? 'No data' : `${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <nav className="dashboard-nav admin-nav">
          <div className="nav-brand"><h2>🌱 GreenPoints Admin</h2></div>
          <div className="nav-links">
            <button onClick={() => navigate('/admin/dashboard')} className="nav-link">Dashboard</button>
            <button onClick={() => navigate('/admin/complaints')} className="nav-link">Manage Complaints</button>
            <button onClick={() => navigate('/admin/analytics')} className="nav-link active">Analytics</button>
            <button onClick={handleLogout} className="nav-link logout">Logout</button>
          </div>
        </nav>
        <div className="analytics-content">
          <div className="analytics-header">
            <h1>Analytics Dashboard</h1>
            <p>Loading complaint data…</p>
          </div>
          <div className="analytics-loading">Loading charts…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <nav className="dashboard-nav admin-nav">
        <div className="nav-brand">
          <h2>🌱 GreenPoints Admin</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/admin/dashboard')} className="nav-link">Dashboard</button>
          <button onClick={() => navigate('/admin/complaints')} className="nav-link">Manage Complaints</button>
          <button onClick={() => navigate('/admin/analytics')} className="nav-link active">Analytics</button>
          <button onClick={handleLogout} className="nav-link logout">Logout</button>
        </div>
      </nav>

      <div className="analytics-content">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <p>
            {hasData
              ? `Insights from ${totalComplaints} complaint${totalComplaints === 1 ? '' : 's'}`
              : 'No complaints yet. Charts will update when complaints are raised.'}
          </p>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-header">
              <h3>Complaint Status</h3>
              <p className="card-subtitle">Distribution by status</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ color: '#cbd5e1', fontSize: '14px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card-footer">
              <div className="stat-summary">
                <span>Total: {hasData ? totalComplaints : 0}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3>By Region</h3>
              <p className="card-subtitle">Complaint volume by region</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis
                    dataKey="category"
                    stroke="#94a3b8"
                    fontSize={12}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.count === 0 ? '#475569' : index % 2 === 0 ? '#22c55e' : '#16a34a'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card-footer">
              <div className="stat-summary">
                <span>
                  {hasData && categoryData.some((d) => d.count > 0)
                    ? `Peak: ${Math.max(...categoryData.map((d) => d.count))} complaints`
                    : 'No data yet'}
                </span>
              </div>
            </div>
          </div>

          <div className="analytics-card full-width">
            <div className="card-header">
              <h3>Last 7 Days</h3>
              <p className="card-subtitle">Complaints raised per day</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="complaints"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorComplaints)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card-footer">
              <div className="stat-summary">
                <span>
                  {hasData
                    ? `Average: ${Math.round(
                        weeklyActivity.reduce((s, d) => s + d.complaints, 0) / 7
                      )} per day`
                    : '0 complaints in the last 7 days'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
