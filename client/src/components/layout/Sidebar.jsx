import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, UserPlus, Users, FileSearch, Brain,
  BookmarkCheck, LogOut, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/candidates/new', icon: UserPlus, label: 'Add Candidate' },
  { path: '/candidates', icon: Users, label: 'Candidates' },
  { path: '/match', icon: FileSearch, label: 'Job Matching' },
  { path: '/ai-recommendations', icon: Brain, label: 'AI Insights' },
  { path: '/shortlists', icon: BookmarkCheck, label: 'Shortlists' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        background: 'var(--sidebar-bg)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(148,163,184,0.08)'
      }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 12px' : '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                HireAI
              </h1>
              <p style={{ fontSize: '0.65rem', color: 'var(--sidebar-text)', opacity: 0.6 }}>Smart Recruiting</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px' : '10px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10,
              textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--sidebar-text)',
              background: isActive ? 'var(--sidebar-active)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary-400)' : '3px solid transparent',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s ease',
            })}
          >
            <item.icon size={20} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(148,163,184,0.08)' }}>
        {!collapsed && user && (
          <div style={{ padding: '0 8px', marginBottom: 12 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>{user.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)', opacity: 0.6 }}>{user.email}</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              flex: collapsed ? 'unset' : 1,
              color: 'var(--sidebar-text)',
              padding: collapsed ? '10px' : '8px 14px',
              justifyContent: 'center',
              fontSize: '0.8rem'
            }}
            title="Logout"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(148,163,184,0.1)',
              border: 'none',
              borderRadius: 8,
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--sidebar-text)',
              display: 'flex',
              alignItems: 'center'
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
