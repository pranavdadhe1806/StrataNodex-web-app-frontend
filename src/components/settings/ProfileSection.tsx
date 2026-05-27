import { useState, useEffect } from 'react';
import { Lock, Trash2, Check } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

/* ─── Design tokens ────────────────────────────────────────── */
const DS = {
  bg: '#1B1D21',
  surface: '#32363C',
  textPrimary: '#EDEFF3',
  textSecondary: '#D5D8DE',
  textMuted: '#8A8F98',
  accent: '#00bfff',
  teal: '#00c896',
  danger: '#ff4d4d',
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  background: DS.bg,
  border: `1px solid ${DS.border}`,
  borderRadius: 8,
  color: DS.textPrimary,
  fontSize: 13,
  fontFamily: 'Poppins, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const readonlyStyle: React.CSSProperties = {
  ...inputStyle,
  color: DS.textMuted,
  cursor: 'default',
};

const lblStyle: React.CSSProperties = {
  color: DS.textMuted,
  fontSize: 12,
  fontWeight: 500,
  display: 'block',
  marginBottom: 6,
  fontFamily: 'Poppins, sans-serif',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: DS.textMuted,
  fontFamily: 'Poppins, sans-serif',
  marginBottom: 16,
};

export default function ProfileSection() {
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [dayStart, setDayStart] = useState('00:00');
  const [dayEnd, setDayEnd] = useState('23:59');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setUsername(user.username ?? '');
    setPhone(user.phone ?? '');
    setDayStart(user.dayStartTime ?? '00:00');
    setDayEnd(user.dayEndTime ?? '23:59');
  }, [user]);

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        name: name || undefined,
        username: username || null,
        phone: phone || null,
        dayStartTime: dayStart,
        dayEndTime: dayEnd,
      });
      setUser(updated);
      flash('Profile saved', true);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string; error?: string } } };
      const msg = anyErr?.response?.data?.message || anyErr?.response?.data?.error || 'Failed to save';
      flash(msg, false);
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    name !== (user?.name ?? '') ||
    username !== (user?.username ?? '') ||
    phone !== (user?.phone ?? '') ||
    dayStart !== (user?.dayStartTime ?? '00:00') ||
    dayEnd !== (user?.dayEndTime ?? '23:59');

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'rgba(0,191,255,0.35)');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = DS.border);

  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '10px 18px', borderRadius: 8,
          background: toast.ok ? 'rgba(0,200,150,0.12)' : 'rgba(255,77,77,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(0,200,150,0.25)' : 'rgba(255,77,77,0.25)'}`,
          color: toast.ok ? DS.teal : DS.danger, fontSize: 13, fontWeight: 500,
        }}>{toast.msg}</div>
      )}

      {/* ── Avatar row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        {/* Avatar circle */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(0,191,255,0.1)',
          border: '2px solid rgba(0,191,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: DS.accent, fontSize: 18, fontWeight: 600,
        }}>
          {initials}
        </div>

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: DS.textPrimary, fontSize: 15, fontWeight: 600 }}>
              {user?.name || user?.email}
            </span>
            {user?.isEmailVerified && (
              <span style={{
                background: 'rgba(0,200,150,0.12)', color: DS.teal,
                fontSize: 11, borderRadius: 4, padding: '2px 8px', fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>
                <Check size={10} strokeWidth={3} /> verified
              </span>
            )}
          </div>
          <div style={{ color: DS.textMuted, fontSize: 12, marginTop: 2 }}>
            {user?.username ? `@${user.username}  ·  ` : ''}{user?.email}
          </div>
        </div>

        {/* Change avatar stub */}
        <button style={{
          background: 'none',
          border: '1px solid rgba(0,191,255,0.25)',
          borderRadius: 7,
          color: DS.accent,
          fontSize: 12,
          padding: '6px 14px',
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          flexShrink: 0,
        }}
          onClick={() => flash('Avatar upload coming soon', false)}
        >
          Change avatar
        </button>
      </div>

      {/* ── Section: Account info ── */}
      <div style={sectionLabel}>Account info</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 28 }}>
        {/* Display name */}
        <div>
          <label style={lblStyle}>Display name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle}
            onFocus={focusBorder} onBlur={blurBorder} placeholder="Your name" />
        </div>

        {/* Username */}
        <div>
          <label style={lblStyle}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}
            placeholder="lowercase_only"
          />
        </div>

        {/* Email — read-only */}
        <div>
          <label style={lblStyle}>
            Email&ensp;<Lock size={11} style={{ verticalAlign: 'middle', color: DS.textMuted }} />
          </label>
          <input value={user?.email ?? ''} readOnly style={readonlyStyle} tabIndex={-1} />
        </div>

        {/* Phone */}
        <div>
          <label style={lblStyle}>Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle}
            onFocus={focusBorder} onBlur={blurBorder} placeholder="+91 ..." />
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: DS.divider, marginBottom: 24 }} />

      {/* ── Section: Day boundaries ── */}
      <div style={sectionLabel}>Day boundaries</div>
      <p style={{ color: DS.textMuted, fontSize: 12, margin: '0 0 14px', lineHeight: 1.6 }}>
        Controls when your daily task list resets.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 32 }}>
        <div>
          <label style={lblStyle}>Start of day</label>
          <input type="time" value={dayStart} onChange={e => setDayStart(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
            onFocus={focusBorder} onBlur={blurBorder} />
        </div>
        <div>
          <label style={lblStyle}>End of day</label>
          <input type="time" value={dayEnd} onChange={e => setDayEnd(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
            onFocus={focusBorder} onBlur={blurBorder} />
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: DS.divider, marginBottom: 20 }} />

      {/* ── Footer: delete + save ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => flash('Account deletion coming soon', false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none',
            border: `1px solid rgba(255,77,77,0.3)`,
            borderRadius: 8,
            color: DS.danger,
            fontSize: 12, fontWeight: 500,
            padding: '7px 14px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Trash2 size={13} /> Delete account
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          style={{
            background: dirty ? DS.accent : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: 8,
            color: dirty ? '#1B1D21' : DS.textMuted,
            fontSize: 13, fontWeight: 600,
            padding: '9px 24px',
            cursor: dirty && !saving ? 'pointer' : 'default',
            opacity: saving ? 0.6 : 1,
            transition: 'background 0.15s, color 0.15s',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
