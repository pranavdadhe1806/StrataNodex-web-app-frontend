import { useState } from 'react';
import { User, Palette, LayoutGrid, Shield, Bell, HardDrive } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import ProfileSection from '../components/settings/ProfileSection';
import GeneralSection from '../components/settings/GeneralSection';
import ProductivitySection from '../components/settings/ProductivitySection';
import SecuritySection from '../components/settings/SecuritySection';
import NotificationsSection from '../components/settings/NotificationsSection';
import DataSection from '../components/settings/DataSection';

/* ─── Design tokens ────────────────────────────────────────── */
const DS = {
  bg: '#1B1D21',
  textPrimary: '#EDEFF3',
  textMuted: '#8A8F98',
  accent: '#00bfff',
  border: 'rgba(255,255,255,0.06)',
};

/* ─── Sidebar items ─────────────────────────────────────────── */
const NAV = [
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'general',      label: 'General',        icon: Palette },
  { id: 'productivity', label: 'Productivity',   icon: LayoutGrid },
  { id: 'security',     label: 'Security',       icon: Shield },
  { id: 'notifications',label: 'Notifications',  icon: Bell },
  { id: 'data',         label: 'Data',           icon: HardDrive },
] as const;

type SectionId = (typeof NAV)[number]['id'];

/* ─── Section title map ─────────────────────────────────────── */
const SECTION_TITLES: Record<SectionId, string> = {
  profile:       'Profile',
  general:       'General',
  productivity:  'Productivity',
  security:      'Security',
  notifications: 'Notifications',
  data:          'Data',
};

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('profile');

  return (
    <div style={{ background: DS.bg, minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <Topbar title="Settings" />
      <SidePanel />

      {/* Body — sits below 56px Topbar */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
      }}>

        {/* ── Settings sidebar (200px) ── */}
        <aside style={{
          width: 200,
          flexShrink: 0,
          background: DS.bg,
          borderRight: `1px solid ${DS.border}`,
          padding: '24px 0',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* "SETTINGS" label */}
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: DS.textMuted,
            padding: '0 20px', marginBottom: 12, display: 'block',
          }}>
            Settings
          </span>

          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                id={`settings-nav-${item.id}`}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 20px',
                  border: 'none',
                  borderLeft: isActive ? `2px solid ${DS.accent}` : '2px solid transparent',
                  background: isActive ? 'rgba(0,191,255,0.06)' : 'transparent',
                  color: isActive ? DS.accent : DS.textMuted,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#D5D8DE';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = DS.textMuted;
                  }
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* ── Content area ── */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 40px',
          background: DS.bg,
        }}>
          {/* Section heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              color: DS.textPrimary,
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              fontFamily: 'Poppins, sans-serif',
            }}>
              {SECTION_TITLES[active]}
            </h1>
          </div>

          {/* Section content */}
          <div>
            {active === 'profile'       && <ProfileSection />}
            {active === 'general'       && <GeneralSection />}
            {active === 'productivity'  && <ProductivitySection />}
            {active === 'security'      && <SecuritySection />}
            {active === 'notifications' && <NotificationsSection />}
            {active === 'data'          && <DataSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
