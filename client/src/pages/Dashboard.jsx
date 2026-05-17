import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService } from '../services/dataService';
import { Users, BookmarkCheck, Brain, TrendingUp, UserPlus, FileSearch, ArrowRight } from 'lucide-react';
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
    { label: 'Total Candidates', value: stats?.stats?.totalCandidates || 0, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Saved Shortlists', value: stats?.stats?.totalShortlists || 0, icon: BookmarkCheck, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Avg Experience', value: `${stats?.stats?.avgExperience || 0} yrs`, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Unique Skills', value: stats?.stats?.totalSkills || 0, icon: Brain, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
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
          <Link to="/candidates/new" className="btn btn-primary" id="quick-add-candidate">
            <UserPlus size={18} /> Add Candidate
          </Link>
          <Link to="/match" className="btn btn-secondary" id="quick-match">
            <FileSearch size={18} /> Start Matching
          </Link>
          <Link to="/candidates" className="btn btn-secondary" id="quick-view-all">
            <Users size={18} /> View All Candidates
          </Link>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Skills Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="glass-card"
          style={{ padding: '24px' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Top Skills</h3>
          {stats?.skillDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.skillDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis type="category" dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={90} />
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
              <p>No skill data yet. Add candidates to see distribution.</p>
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

      {/* Recent Candidates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="glass-card"
        style={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Candidates</h3>
          <Link to="/candidates" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary-400)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {stats?.recentCandidates?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentCandidates.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {c.skills.slice(0, 3).map(s => (
                          <span key={s} className="badge badge-skill">{s}</span>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="badge badge-info">+{c.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>{c.experience} yrs</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No candidates yet. Start by adding your first candidate!</p>
            <Link to="/candidates/new" className="btn btn-primary" style={{ marginTop: 16 }}>
              <UserPlus size={18} /> Add First Candidate
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
