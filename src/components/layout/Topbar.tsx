import { Menu, User } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';

interface TopbarProps {
  title: string;
  onTitleDoubleClick?: () => void;
}

export default function Topbar({ title, onTitleDoubleClick }: TopbarProps) {
  const { toggleSidebar } = useUIStore();

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#1B1D21',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      zIndex: 100,
    }}>
      <button
        onClick={toggleSidebar}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EDEFF3', display: 'flex', alignItems: 'center', padding: '6px' }}
      >
        <Menu size={20} />
      </button>

      <span
        onDoubleClick={onTitleDoubleClick}
        style={{
          color: '#EDEFF3',
          fontSize: '16px',
          fontWeight: 500,
          cursor: onTitleDoubleClick ? 'text' : 'default',
          userSelect: 'none',
        }}
      >
        {title}
      </span>

      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EDEFF3', display: 'flex', alignItems: 'center', padding: '6px' }}
      >
        <User size={20} />
      </button>
    </div>
  );
}
