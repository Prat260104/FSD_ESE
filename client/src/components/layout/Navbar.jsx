import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, Sun, Moon, Bell, User } from 'lucide-react';

export default function Navbar({ toggleSidebar }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost" onClick={toggleSidebar} style={{ padding: 8 }}>
          <Menu size={20} />
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'none' }} className="hide-mobile">
          Employee Analytics System
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost" onClick={toggleTheme} style={{ padding: 8 }}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="btn btn-ghost" style={{ padding: 8, position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, background: 'var(--error)', borderRadius: '50%' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8, paddingLeft: 16, borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'right', display: 'none' }} className="hide-mobile">
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HR Admin</p>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-secondary)', border: '2px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <User size={18} color="var(--text-secondary)" />
          </div>
        </div>
      </div>
    </header>
  );
}
