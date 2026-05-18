import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('aside');
      if (sidebar && window.innerWidth > 768) {
        setSidebarWidth(sidebar.offsetWidth);
      } else {
        setSidebarWidth(0); // On mobile, sidebar overlays
      }
    });

    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
      setSidebarWidth(window.innerWidth > 768 ? sidebar.offsetWidth : 0);
    }

    const handleResize = () => {
      setSidebarWidth(window.innerWidth > 768 && sidebar ? sidebar.offsetWidth : 0);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <div className="bg-gradient-blobs" />
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: `calc(100% - ${sidebarWidth}px)`
      }}>
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ flex: 1, padding: '32px', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
