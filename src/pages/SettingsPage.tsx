import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import NotificationSettings from '../components/settings/NotificationSettings';

const tabs = [
  { id: 'general' as const, label: 'General', icon: User },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
];

type TabId = (typeof tabs)[number]['id'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('notifications');

  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh' }}>
      <Topbar title="Settings" />
      <SidePanel />
      <div
        style={{
          paddingTop: '24px',
          paddingLeft: '48px',
          paddingRight: '48px',
          paddingBottom: '48px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', gap: '32px', marginTop: '56px' }}>
          {/* Sidebar Navigation */}
          <div style={{ width: '200px', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? 'rgba(0, 191, 255, 0.08)' : 'transparent',
                      color: isActive ? '#00bfff' : '#9CA3AF',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: isActive ? 500 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left' as const,
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {activeTab === 'general' && (
              <div
                style={{
                  background: '#2A2D33',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  padding: '28px',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
                  color: '#7D828B',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                }}
              >
                General settings — coming soon
              </div>
            )}
            {activeTab === 'notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
