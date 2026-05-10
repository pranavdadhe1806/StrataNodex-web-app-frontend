import { X } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';

export default function SidePanel() {
  const { sidebarOpen, closeSidebar } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <>
      <div
        onClick={closeSidebar}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
      />
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: '280px',
        background: '#32363C',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        zIndex: 201,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#00bfff', fontWeight: 600, fontSize: '18px' }}>StrataNodex</span>
          <button onClick={closeSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8F98' }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ color: '#7D828B', fontSize: '13px' }}>Navigation — Phase 2</p>
      </div>
    </>
  );
}
