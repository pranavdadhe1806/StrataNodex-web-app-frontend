import { useState, useRef, useEffect } from 'react';
import { Menu, User, Trash2 } from '../ui/icons';
import { HouseDuotone, FolderDuotone, CalendarDuotone, ChartLineUpDuotone, GearDuotone } from '../ui/icons';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { getToken } from '../../utils/token';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

// In dev, redirect to local landing page; in prod, to deployed Vercel app
const LANDING_AUTH_URL =
  import.meta.env.VITE_LANDING_URL
    ? `${import.meta.env.VITE_LANDING_URL}/#auth`
    : 'https://stratanodex-landing-page.vercel.app/#auth';

interface TopbarProps {
  title: string;
  onTitleDoubleClick?: () => void;
  titleSlot?: React.ReactNode;
}

const glassMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '48px',
  left: '12px',
  background: '#32363C',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  padding: '8px',
  minWidth: '200px',
  zIndex: 100,
};


const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  color: '#D5D8DE',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
};

const separatorStyle: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.08)',
  margin: '6px 8px',
};

export default function Topbar({ title, onTitleDoubleClick, titleSlot }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeFolderName, activeFolderId } = useUIStore();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if on list screen
  const isListScreen = location.pathname.startsWith('/list/');

  function handleNavigate(path: string) {
    navigate(path);
    setMenuOpen(false);
  }

  function handleOpenFolder() {
    if (activeFolderId) {
      navigate(`/folders/${activeFolderId}`);
      setMenuOpen(false);
    }
  }

  function handleLogout() {
    logout();
    setProfileOpen(false);
  }

  function handleProfileClick() {
    // If not authenticated, send to landing page login
    if (!getToken()) {
      window.location.href = LANDING_AUTH_URL;
      return;
    }
    setProfileOpen((v) => !v);
  }

  return (
    <header className="relative flex items-center justify-between h-[56px] w-full px-5 bg-[#1B1D21] shrink-0 z-50">
      {/* Left — Hamburger Menu */}
      <div className="relative">
        <button
          ref={menuBtnRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[#EDEFF3] hover:opacity-80 transition-opacity flex items-center justify-center p-1.5"
          aria-label="Menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* Menu Dropdown */}
        {menuOpen && (
          <div ref={menuRef} style={glassMenuStyle}>
            {/* Dashboard */}
            <div
              onClick={() => handleNavigate('/dashboard')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              style={menuItemStyle}
            >
              <HouseDuotone size={18} weight="duotone" color="#00bfff" />
              <span>Dashboard</span>
            </div>

            {/* Your Folders */}
            <div
              onClick={() => handleNavigate('/folders')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              style={menuItemStyle}
            >
              <FolderDuotone size={18} weight="duotone" color="#00bfff" />
              <span>Your Folders</span>
            </div>

            {/* Today */}
            <div
              onClick={() => handleNavigate('/today')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              style={menuItemStyle}
            >
              <CalendarDuotone size={18} weight="duotone" color="#00bfff" />
              <span>Today</span>
            </div>

            {/* Stats */}
            <div
              onClick={() => handleNavigate('/stats')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              style={menuItemStyle}
            >
              <ChartLineUpDuotone size={18} weight="duotone" color="#00bfff" />
              <span>Stats</span>
            </div>

            {/* Separator */}
            <div style={separatorStyle} />

            {/* Context-aware: Open Folder (only on list screen) */}
            {isListScreen && activeFolderId && (
              <>
                <div
                  onClick={handleOpenFolder}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  style={menuItemStyle}
                >
                  <FolderDuotone size={18} weight="duotone" color="#8A8F98" />
                  <span style={{ fontSize: '13px' }}>Open {activeFolderName || 'Folder'}</span>
                </div>

                <div
                  onClick={() => {
                    // TODO: Delete list functionality
                    setMenuOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 53, 0.15)';
                    e.currentTarget.style.color = '#FF6B35';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#D5D8DE';
                  }}
                  style={menuItemStyle}
                >
                  <Trash2 size={18} style={{ color: '#FF6B35' }} />
                  <span>Delete List</span>
                </div>

                <div style={separatorStyle} />
              </>
            )}

            {/* Settings */}
            <div
              onClick={() => handleNavigate('/settings')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              style={menuItemStyle}
            >
              <GearDuotone size={18} weight="duotone" color="#8A8F98" />
              <span>Settings</span>
            </div>
          </div>
        )}
      </div>

      {/* Center — List Name */}
      <div
        onDoubleClick={onTitleDoubleClick}
        className={`absolute left-1/2 -translate-x-1/2 text-[#EDEFF3] text-[17px] font-normal font-['Poppins'] ${onTitleDoubleClick ? 'cursor-text select-none' : ''}`}
        title={onTitleDoubleClick ? "Double-click to rename" : undefined}
      >
        {titleSlot ?? title}
      </div>

      {/* Right — Profile */}
      <div className="relative">
        <button
          ref={profileBtnRef}
          onClick={handleProfileClick}
          className="text-[#EDEFF3] hover:opacity-80 transition-opacity flex items-center justify-center p-1.5"
          aria-label="Profile"
        >
          <User size={20} strokeWidth={2} />
        </button>

        {/* Profile Dropdown */}
        {profileOpen && (
          <ProfileMenu
            ref={profileRef}
            user={user}
            onNavigate={(path) => { navigate(path); setProfileOpen(false); }}
            onLogout={handleLogout}
          />
        )}
      </div>
    </header>
  );
}
