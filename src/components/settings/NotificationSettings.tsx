import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/auth.store';
import CustomTimePicker from '../ui/CustomTimePicker';
import {
  useNotificationPreferences,
  useUpdatePreferences,
  useGenerateTelegramCode,
  useUnlinkTelegram,
} from '../../hooks/useNotifications';

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
];

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--divider)',
  borderRadius: '14px',
  padding: '28px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
};

const labelStyle: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: 'var(--font-main)',
  marginBottom: '8px',
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  padding: '12px 14px',
  fontSize: '14px',
  fontFamily: 'var(--font-main)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
};

const sectionTitleStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'var(--font-main)',
  marginBottom: '0',
};

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: enabled ? 'var(--accent)' : '#4A4F57',
        cursor: 'pointer',
        transition: 'background 0.2s',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '3px',
          left: enabled ? '23px' : '3px',
          transition: 'left 0.2s',
        }}
      />
    </div>
  );
}

export default function NotificationSettings() {
  const { user } = useAuthStore();
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdatePreferences();
  const generateCodeMutation = useGenerateTelegramCode();
  const unlinkMutation = useUnlinkTelegram();

  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderTimezone, setReminderTimezone] = useState('Asia/Kolkata');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramCode, setTelegramCode] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [pollInterval, setPollInterval] = useState<number | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  // Re-fetch with polling when Telegram linking is in progress
  const { data: polledPrefs } = useNotificationPreferences(pollInterval);
  const activePrefs = polledPrefs || prefs;

  // Sync local state from server (only on initial load)
  useEffect(() => {
    if (activePrefs && !initialized) {
      setReminderTime(activePrefs.reminderTime);
      setReminderTimezone(activePrefs.reminderTimezone);
      setEmailEnabled(activePrefs.emailNotifEnabled);
      setEmailAddress(activePrefs.emailNotifAddress || user?.email || '');
      setTelegramEnabled(activePrefs.telegramEnabled);
      setInitialized(true);
    }
  }, [activePrefs, user?.email, initialized]);

  // Stop polling once Telegram is linked
  useEffect(() => {
    if (activePrefs?.telegramLinked && pollInterval) {
      setPollInterval(undefined);
      setTelegramCode(null);
    }
  }, [activePrefs?.telegramLinked, pollInterval]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        emailNotifEnabled: emailEnabled,
        emailNotifAddress: emailAddress,
        telegramEnabled,
        reminderTime,
        reminderTimezone,
      });
      showToast('✅ Preferences saved', 'success');
    } catch {
      showToast('❌ Failed to save preferences', 'error');
    }
  };

  const handleGenerateCode = async () => {
    try {
      const result = await generateCodeMutation.mutateAsync();
      setTelegramCode(result.code);
      setPollInterval(5000);
    } catch {
      showToast('❌ Failed to generate code', 'error');
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink Telegram?')) return;
    try {
      await unlinkMutation.mutateAsync();
      setTelegramCode(null);
      setTelegramEnabled(false);
      showToast('✅ Telegram unlinked', 'success');
    } catch {
      showToast('❌ Failed to unlink Telegram', 'error');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTop: '2px solid var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 1000,
            padding: '12px 20px',
            borderRadius: '10px',
            background:
              toast.type === 'success'
                ? 'rgba(48, 209, 88, 0.15)'
                : 'rgba(248, 81, 73, 0.15)',
            border: `1px solid ${
              toast.type === 'success'
                ? 'rgba(48, 209, 88, 0.3)'
                : 'rgba(248, 81, 73, 0.3)'
            }`,
            color: toast.type === 'success' ? 'var(--accent-teal)' : '#f85149',
            fontFamily: 'var(--font-main)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Reminder Time */}
      <div style={cardStyle}>
        <div style={{ ...sectionTitleStyle, marginBottom: '16px' }}>⏰ Daily Reminder Time</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Time</label>
            <CustomTimePicker value={reminderTime} onChange={setReminderTime} />
          </div>
          <div>
            <label style={labelStyle}>Timezone</label>
            <select
              value={reminderTimezone}
              onChange={(e) => setReminderTimezone(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: emailEnabled ? '16px' : '0',
          }}
        >
          <div style={sectionTitleStyle}>📧 Email Notifications</div>
          <Toggle enabled={emailEnabled} onToggle={() => setEmailEnabled(!emailEnabled)} />
        </div>
        {emailEnabled && (
          <div>
            <label style={labelStyle}>Send to</label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="your@email.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(36, 119, 198, 0.4)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        )}
      </div>

      {/* Telegram Notifications */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: telegramEnabled ? '16px' : '0',
          }}
        >
          <div style={sectionTitleStyle}>✈️ Telegram Notifications</div>
          <Toggle
            enabled={telegramEnabled}
            onToggle={() => setTelegramEnabled(!telegramEnabled)}
          />
        </div>

        {/* Linked state */}
        {telegramEnabled && activePrefs?.telegramLinked && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: 'var(--accent-teal)',
                fontFamily: 'var(--font-main)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              ✅ Telegram linked
            </span>
            <button
              onClick={handleUnlink}
              style={{
                background: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid rgba(248, 81, 73, 0.25)',
                borderRadius: '8px',
                color: '#f85149',
                fontFamily: 'var(--font-main)',
                fontSize: '13px',
                padding: '8px 14px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(248, 81, 73, 0.2)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'rgba(248, 81, 73, 0.1)')
              }
            >
              Unlink
            </button>
          </div>
        )}

        {/* Linking flow */}
        {telegramEnabled && !activePrefs?.telegramLinked && (
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid var(--divider)',
            }}
          >
            <div
              style={{
                color: '#9CA3AF',
                fontFamily: 'var(--font-main)',
                fontSize: '13px',
                lineHeight: '1.8',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Step 1:</strong> Open{' '}
                <a
                  href="https://t.me/StrataNodexBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}
                >
                  @StrataNodexBot
                </a>{' '}
                on Telegram
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Step 2:</strong> Send{' '}
                <code
                  style={{
                    background: 'rgba(36,119,198,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: 'var(--accent)',
                  }}
                >
                  /start
                </code>{' '}
                to the bot
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Step 3:</strong> Send{' '}
                <code
                  style={{
                    background: 'rgba(36,119,198,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: 'var(--accent)',
                  }}
                >
                  /link
                </code>{' '}
                followed by this code:
              </div>
            </div>

            {telegramCode && (
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid rgba(36, 119, 198, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    letterSpacing: '4px',
                  }}
                >
                  {telegramCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(telegramCode);
                    showToast('📋 Copied!', 'success');
                  }}
                  style={{
                    background: 'rgba(36, 119, 198, 0.1)',
                    border: '1px solid rgba(36, 119, 198, 0.25)',
                    borderRadius: '8px',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-main)',
                    fontSize: '13px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Copy
                </button>
              </div>
            )}

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <button
                onClick={handleGenerateCode}
                disabled={generateCodeMutation.isPending}
                style={{
                  background: 'rgba(36, 119, 198, 0.1)',
                  border: '1px solid rgba(36, 119, 198, 0.25)',
                  borderRadius: '8px',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  padding: '8px 14px',
                  cursor: generateCodeMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: generateCodeMutation.isPending ? 0.6 : 1,
                }}
              >
                {telegramCode ? 'Generate New Code' : 'Generate Code'}
              </button>
              {telegramCode && (
                <span
                  style={{
                    color: 'var(--text-placeholder)',
                    fontFamily: 'var(--font-main)',
                    fontSize: '12px',
                  }}
                >
                  Code expires in 15 minutes
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        style={{
          background: 'var(--accent)',
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          fontFamily: 'var(--font-main)',
          fontSize: '14px',
          fontWeight: 600,
          padding: '12px 24px',
          cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
          opacity: updateMutation.isPending ? 0.6 : 1,
          transition: 'opacity 0.15s',
          alignSelf: 'flex-start',
        }}
      >
        {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
