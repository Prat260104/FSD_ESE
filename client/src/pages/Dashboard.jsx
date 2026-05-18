import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService } from '../services/dataService';
import { Users, BookmarkCheck, Brain, TrendingUp, UserPlus, FileSearch, ArrowRight, Building, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } })
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#4f46e5', '#7c3aed', '#5b21b6', '#4338ca'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getStats();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card loading-pulse" style={{ height: i === 1 ? 100 : 200, padding: 24 }} />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Employees', value: stats?.stats?.totalEmployees || 0, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Avg Performance', value: `${stats?.stats?.avgPerformance || 0}/100`, icon: Award, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Departments', value: stats?.stats?.totalDepartments || 0, icon: Building, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Saved Evaluations', value: stats?.stats?.totalEvaluations || 0, icon: BookmarkCheck, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="glass-card"
            style={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{card.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{card.value}</p>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <card.icon size={24} color={card.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="glass-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/employees/new" className="btn btn-primary">
            <UserPlus size={18} /> Add Employee
          </Link>
          <Link to="/analytics" className="btn btn-secondary">
            <FileSearch size={18} /> Run Analytics
          </Link>
          <Link to="/employees" className="btn btn-secondary">
            <Users size={18} /> View All Employees
          </Link>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="glass-card"
          style={{ padding: '24px' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Department Headcount</h3>
          {stats?.departmentDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.departmentDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis type="category" dataKey="department" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={100} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p>No department data yet.</p>
            </div>
          )}
        </motion.div>

        {/* Experience Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="glass-card"
          style={{ padding: '24px' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Experience Breakdown</h3>
          {stats?.experienceDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.experienceDistribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {stats.experienceDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p>No experience data yet.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="glass-card"
        style={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Top Performers</h3>
          <Link to="/employees" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary-400)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {stats?.topPerformers?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Performance Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPerformers.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-info">{c.department}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                    <td>{c.experience} yrs</td>
                    <td>
                      <span className={`badge ${c.performanceScore >= 80 ? 'badge-high' : c.performanceScore >= 60 ? 'badge-medium' : 'badge-low'}`}>
                        {c.performanceScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No employees yet. Start by adding your first employee!</p>
            <Link to="/employees/new" className="btn btn-primary" style={{ marginTop: 16 }}>
              <UserPlus size={18} /> Add First Employee
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
