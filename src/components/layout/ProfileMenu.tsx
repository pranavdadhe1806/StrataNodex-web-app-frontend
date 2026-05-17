import { forwardRef } from 'react';
import { LogOut } from '../ui/icons';
import { UserDuotone, GearDuotone } from '../ui/icons';

interface ProfileMenuProps {
  user: { name?: string | null; username?: string | null; email?: string | null } | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const separatorStyle: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.06)',
  margin: '8px 0',
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 10px',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#D5D8DE',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '13px',
  fontWeight: 400,
  transition: 'background 0.15s ease',
};

const ProfileMenu = forwardRef<HTMLDivElement, ProfileMenuProps>(
  ({ user, onNavigate, onLogout }, ref) => {
    const displayName = user?.name || 'User';
    const displayUsername = user?.username || user?.email?.split('@')[0] || 'username';

    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: '48px',
          right: '12px',
          background: '#32363C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          minWidth: '220px',
          padding: '16px 8px 8px',
          zIndex: 100,
        }}
      >
        {/* User info */}
        <div style={{ padding: '0 10px 4px' }}>
          <div
            style={{
              color: '#EDEFF3',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              color: '#7D828B',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              marginTop: '2px',
            }}
          >
            @{displayUsername}
          </div>
        </div>

        <div style={separatorStyle} />

        {/* Profile Settings */}
        <div
          onClick={() => onNavigate('/profile')}
          style={menuItemStyle}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <UserDuotone size={18} weight="duotone" color="#8A8F98" />
          <span>Profile Settings</span>
        </div>

        {/* Settings */}
        <div
          onClick={() => onNavigate('/settings')}
          style={menuItemStyle}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <GearDuotone size={18} weight="duotone" color="#8A8F98" />
          <span>Settings</span>
        </div>

        <div style={separatorStyle} />

        {/* Logout */}
        <div
          onClick={onLogout}
          style={menuItemStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248, 81, 73, 0.08)';
            e.currentTarget.style.color = '#f85149';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#D5D8DE';
          }}
        >
          <LogOut size={18} color="#f85149" />
          <span style={{ color: '#f85149' }}>Logout</span>
        </div>
      </div>
    );
  }
);

ProfileMenu.displayName = 'ProfileMenu';

export default ProfileMenu;
