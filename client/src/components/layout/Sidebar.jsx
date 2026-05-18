import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, TrendingUp, Brain, BookmarkCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees Database' },
    { to: '/employees/new', icon: UserPlus, label: 'Register Employee' },
    { to: '/analytics', icon: TrendingUp, label: 'Run Analytics' },
    { to: '/ai-performance', icon: Brain, label: 'AI Insights' },
    { to: '/saved-evaluations', icon: BookmarkCheck, label: 'Saved Reports' }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div style={{ padding: '32px 24px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 'bold', fontSize: '1.4rem',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
          }}>
            E
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            EmpAI
          </span>
        </div>

        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Main Menu</p>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: '12px',
                fontSize: '0.95rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-50)' : 'transparent',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              })}
              onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
            >
              <link.icon size={20} style={{ strokeWidth: 2.5 }} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '24px 16px' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '20px 16px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="#fff" />
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>EmpAI Pro</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Using OpenRouter Models</p>
          </div>

          <button
            onClick={logout}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px', borderRadius: '12px',
              border: 'none', background: 'transparent',
              color: 'var(--error)', fontSize: '0.95rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--error-light)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
