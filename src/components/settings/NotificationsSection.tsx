import { useState, useEffect, useCallback } from 'react';
import { Bell, Mail, Send, Copy } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import {
  useNotificationPreferences,
  useUpdatePreferences,
  useGenerateTelegramCode,
  useUnlinkTelegram,
} from '../../hooks/useNotifications';

/* ─── Design tokens ────────────────────────────────────────── */
const DS = {
  bg: 'var(--bg-base)',
  textPrimary: 'var(--text-primary)',
  textMuted: 'var(--text-muted)',
  textSecondary: 'var(--text-secondary)',
  accent: 'var(--accent)',
  teal: 'var(--accent-teal)',
  danger: '#ff4d4d',
  border: 'var(--border)',
  divider: 'var(--divider)',
};

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

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: DS.textMuted,
  fontFamily: 'var(--font-main)', marginBottom: 20,
};

const inputStyle: React.CSSProperties = {
  background: DS.bg,
  border: `1px solid ${DS.border}`,
  borderRadius: 8, padding: '9px 12px',
  fontSize: 13, color: DS.textPrimary,
  fontFamily: 'var(--font-main)', outline: 'none',
  width: '100%', boxSizing: 'border-box' as const,
  colorScheme: 'dark' as const,
};

/* ─── Toggle (36×20) — same size as other sections ─────────── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: enabled ? DS.accent : 'var(--border-bright)',
        cursor: 'pointer', transition: 'background 0.2s',
        position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: enabled ? 19 : 3, transition: 'left 0.2s',
      }} />
    </div>
  );
}

/* ─── Main component — all logic from original preserved ─────── */
export default function NotificationsSection() {
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

  const { data: polledPrefs } = useNotificationPreferences(pollInterval);
  const activePrefs = polledPrefs || prefs;

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
      showToast('Preferences saved', 'success');
    } catch {
      showToast('Failed to save preferences', 'error');
    }
  };

  const handleGenerateCode = async () => {
    try {
      const result = await generateCodeMutation.mutateAsync();
      setTelegramCode(result.code);
      setPollInterval(5000);
    } catch {
      showToast('Failed to generate code', 'error');
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink Telegram?')) return;
    try {
      await unlinkMutation.mutateAsync();
      setTelegramCode(null);
      setTelegramEnabled(false);
      showToast('Telegram unlinked', 'success');
    } catch {
      showToast('Failed to unlink Telegram', 'error');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTop: `2px solid ${DS.accent}`,
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          padding: '10px 18px', borderRadius: 8,
          background: toast.type === 'success' ? 'rgba(48,209,88,0.15)' : 'rgba(255,77,77,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(48,209,88,0.3)' : 'rgba(255,77,77,0.3)'}`,
          color: toast.type === 'success' ? DS.teal : DS.danger,
          fontFamily: 'var(--font-main)', fontSize: 13, fontWeight: 500,
        }}>
          {toast.message}
        </div>
      )}

      {/* ── Reminder time section ── */}
      <div style={sectionLabel}>Daily reminder</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 4 }}>
        <div>
          <label style={{ color: DS.textMuted, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>Time</label>
          <input
            type="time"
            value={reminderTime}
            onChange={e => setReminderTime(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: DS.textMuted, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>Timezone</label>
          <select
            value={reminderTimezone}
            onChange={e => setReminderTimezone(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ height: 1, background: DS.divider, margin: '20px 0' }} />

      {/* ── Email notifications ── */}
      <div style={{ padding: '0 0 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: emailEnabled ? 14 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={15} color={DS.textMuted} />
            <div>
              <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Email notifications</div>
              <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>Receive task reminders by email</div>
            </div>
          </div>
          <Toggle enabled={emailEnabled} onToggle={() => setEmailEnabled(!emailEnabled)} />
        </div>

        {emailEnabled && (
          <div style={{ paddingLeft: 25 }}>
            <label style={{ color: DS.textMuted, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Send to
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={e => setEmailAddress(e.target.value)}
              placeholder="your@email.com"
              style={{ ...inputStyle, maxWidth: 320 }}
              onFocus={e => (e.target.style.borderColor = 'rgba(36,119,198,0.4)')}
              onBlur={e => (e.target.style.borderColor = DS.border)}
            />
          </div>
        )}
      </div>

      <div style={{ height: 1, background: DS.divider, margin: '0 0 14px' }} />

      {/* ── Telegram notifications ── */}
      <div style={{ padding: '0 0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: telegramEnabled ? 14 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Send size={15} color={DS.textMuted} />
            <div>
              <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Telegram notifications</div>
              <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>Receive reminders via Telegram bot</div>
            </div>
          </div>
          <Toggle enabled={telegramEnabled} onToggle={() => setTelegramEnabled(!telegramEnabled)} />
        </div>

        {/* Linked state */}
        {telegramEnabled && activePrefs?.telegramLinked && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 25 }}>
            <span style={{ color: DS.teal, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={13} /> Telegram linked
            </span>
            <button
              onClick={handleUnlink}
              style={{
                background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.25)',
                borderRadius: 8, color: DS.danger, fontFamily: 'var(--font-main)',
                fontSize: 12, padding: '6px 12px', cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,77,77,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,77,77,0.08)')}
            >
              Unlink
            </button>
          </div>
        )}

        {/* Linking flow */}
        {telegramEnabled && !activePrefs?.telegramLinked && (
          <div style={{ paddingLeft: 25 }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              padding: '16px 18px', border: `1px solid ${DS.divider}`,
            }}>
              <div style={{ color: DS.textMuted, fontSize: 12, lineHeight: 1.9 }}>
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ color: DS.textSecondary }}>Step 1:</strong> Open{' '}
                  <a href="https://t.me/StrataNodexBot" target="_blank" rel="noopener noreferrer"
                    style={{ color: DS.accent, textDecoration: 'none' }}>
                    @StrataNodexBot
                  </a>{' '}on Telegram
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ color: DS.textSecondary }}>Step 2:</strong> Send{' '}
                  <code style={{ background: 'rgba(36,119,198,0.1)', padding: '1px 6px', borderRadius: 4, color: DS.accent, fontSize: 11 }}>
                    /start
                  </code>{' '}to the bot
                </div>
                <div>
                  <strong style={{ color: DS.textSecondary }}>Step 3:</strong> Send{' '}
                  <code style={{ background: 'rgba(36,119,198,0.1)', padding: '1px 6px', borderRadius: 4, color: DS.accent, fontSize: 11 }}>
                    /link
                  </code>{' '}followed by this code:
                </div>
              </div>

              {telegramCode && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Code box — styled per spec */}
                  <div style={{
                    background: DS.bg,
                    border: '1px solid rgba(36,119,198,0.2)',
                    borderRadius: 8, padding: '12px 16px',
                    fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
                    color: DS.accent, letterSpacing: '0.2em',
                  }}>
                    {telegramCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(telegramCode);
                      showToast('Copied!', 'success');
                    }}
                    style={{
                      background: 'rgba(36,119,198,0.08)', border: '1px solid rgba(36,119,198,0.25)',
                      borderRadius: 8, color: DS.accent, fontFamily: 'var(--font-main)',
                      fontSize: 12, padding: '8px 12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <Copy size={13} /> Copy
                  </button>
                </div>
              )}

              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={handleGenerateCode}
                  disabled={generateCodeMutation.isPending}
                  style={{
                    background: 'rgba(36,119,198,0.08)', border: '1px solid rgba(36,119,198,0.25)',
                    borderRadius: 8, color: DS.accent, fontFamily: 'var(--font-main)',
                    fontSize: 12, padding: '7px 14px',
                    cursor: generateCodeMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: generateCodeMutation.isPending ? 0.6 : 1,
                  }}
                >
                  {telegramCode ? 'Generate new code' : 'Generate code'}
                </button>
                {telegramCode && (
                  <span style={{ color: DS.textMuted, fontSize: 11, fontFamily: 'var(--font-main)' }}>
                    Code expires in 15 minutes
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: DS.divider, margin: '20px 0' }} />

      {/* ── Save button ── */}
      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        style={{
          background: DS.accent, border: 'none', borderRadius: 8,
          color: 'var(--bg-base)', fontFamily: 'var(--font-main)',
          fontSize: 13, fontWeight: 600,
          padding: '9px 24px',
          cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
          opacity: updateMutation.isPending ? 0.6 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {updateMutation.isPending ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  );
}
