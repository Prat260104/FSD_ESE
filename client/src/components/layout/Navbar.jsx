import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/candidates/new': 'Add Candidate',
  '/candidates': 'Candidates',
  '/match': 'Job Matching',
  '/match/results': 'Match Results',
  '/ai-recommendations': 'AI Recommendations',
  '/shortlists': 'Saved Shortlists',
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/candidates/') && location.pathname !== '/candidates/new') {
      return 'Edit Candidate';
    }
    return pageTitles[location.pathname] || 'HireAI';
  };

  return (
    <header style={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em'
      }}>
        {getTitle()}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{ padding: 10, borderRadius: '50%' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          className="btn btn-ghost"
          style={{ padding: 10, borderRadius: '50%', position: 'relative' }}
          title="Notifications"
        >
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--error)',
          }} />
        </button>
      </div>
    </header>
  );
}
