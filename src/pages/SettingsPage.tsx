import { useState } from 'react';
import { Bell, User, ShieldCheck } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';

const tabs = [
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'security' as const, label: 'Security', icon: ShieldCheck },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
];

type TabId = (typeof tabs)[number]['id'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh' }}>
      <Topbar title="Settings" />
      <SidePanel />
      <div style={{ padding: '24px 48px 48px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>

          {/* nav */}
          <div style={{ width: 180, flexShrink: 0 }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 14px', borderRadius: 8, border: 'none', width: '100%',
                    background: active ? 'rgba(0,191,255,0.08)' : 'transparent',
                    color: active ? '#00bfff' : '#9CA3AF',
                    fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: active ? 500 : 400,
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                    marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* content */}
          <div style={{
            flex: 1, minWidth: 0,
            background: '#24272C',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '28px 32px',
          }}>
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
