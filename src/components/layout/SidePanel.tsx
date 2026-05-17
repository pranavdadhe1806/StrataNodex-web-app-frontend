import { useNavigate, useLocation } from 'react-router-dom';
import { X } from '../ui/icons';
import { HouseDuotone, FolderDuotone, CalendarDuotone, ChartLineUpDuotone } from '../ui/icons';
import { useUIStore } from '../../store/ui.store';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: HouseDuotone },
  { path: '/folders',   label: 'Your Folders', Icon: FolderDuotone },
  { path: '/today',     label: 'Today', Icon: CalendarDuotone },
  { path: '/stats',     label: 'Stats', Icon: ChartLineUpDuotone },
] as const;

const separatorStyle: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.07)',
  margin: '8px 0',
};

export default function SidePanel() {
  const { sidebarOpen, closeSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!sidebarOpen) return null;

  function handleNav(path: string) {
    navigate(path);
    closeSidebar();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeSidebar}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: '280px',
          background: '#32363C',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
          zIndex: 201,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px' }}>
          <span style={{ color: '#00bfff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px' }}>
            StrataNodex
          </span>
          <button
            onClick={closeSidebar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8F98', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <X size={18} color="#8A8F98" />
          </button>
        </div>

        <div style={separatorStyle} />

        {/* Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              <div
                key={path}
                onClick={() => handleNav(path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(0, 191, 255, 0.08)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isActive ? 'rgba(0, 191, 255, 0.08)' : 'transparent';
                }}
              >
                <Icon size={22} weight="duotone" color="#00bfff" />
                <span
                  style={{
                    color: isActive ? '#EDEFF3' : '#D5D8DE',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
