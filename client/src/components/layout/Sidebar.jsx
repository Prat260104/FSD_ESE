import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, TrendingUp, Brain, BookmarkCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/employees/new', icon: UserPlus, label: 'Add Employee' },
    { to: '/analytics', icon: TrendingUp, label: 'Run Analytics' },
    { to: '/ai-performance', icon: Brain, label: 'AI Insights' },
    { to: '/saved-evaluations', icon: BookmarkCheck, label: 'Saved Evaluations' }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'
          }}>
            E
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            EmpAI
          </span>
        </div>

        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '20px' }}>
          <button
            onClick={logout}
            className="sidebar-link"
            style={{ width: '100%', color: 'var(--error)' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
