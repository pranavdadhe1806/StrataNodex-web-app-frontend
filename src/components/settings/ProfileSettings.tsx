import { useState, useEffect } from 'react';
import { Check, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import CustomTimePicker from '../ui/CustomTimePicker';

const field: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  background: '#25282E',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 13,
  fontFamily: 'var(--font-main)',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const readOnly: React.CSSProperties = {
  ...field,
  background: '#1F2227',
  color: '#6B7280',
  cursor: 'default',
};

const lbl: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: 12,
  fontWeight: 500,
  display: 'block',
  marginBottom: 6,
  fontFamily: 'var(--font-main)',
};

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [dayStart, setDayStart] = useState('00:00');
  const [dayEnd, setDayEnd] = useState('23:59');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
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
        username: username || null,
        phone: phone || null,
        dayStartTime: dayStart,
        dayEndTime: dayEnd,
      });
      setUser(updated);
      flash('Profile saved', true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to save';
      flash(msg, false);
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    username !== (user?.username ?? '') ||
    phone !== (user?.phone ?? '') ||
    dayStart !== (user?.dayStartTime ?? '00:00') ||
    dayEnd !== (user?.dayEndTime ?? '23:59');

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'rgba(36,119,198,0.35)');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'var(--border)');

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '10px 18px', borderRadius: 8,
          background: toast.ok ? 'rgba(48,209,88,0.12)' : 'rgba(248,81,73,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(48,209,88,0.25)' : 'rgba(248,81,73,0.25)'}`,
          color: toast.ok ? 'var(--accent-teal)' : '#f85149', fontSize: 13, fontWeight: 500,
        }}>{toast.msg}</div>
      )}

      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, #0070cc 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 600, fontSize: 18, flexShrink: 0,
        }}>
          {(user?.name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>
            {user?.name || user?.email}
          </div>
          <div style={{ color: '#6B7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mail size={11} /> {user?.email}
            {user?.isEmailVerified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 6,
                fontSize: 11, color: 'var(--accent-teal)',
              }}>
                <Check size={10} /> verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px', maxWidth: 480 }}>
        {/* Name — read-only */}
        <div>
          <label style={lbl}>Display name</label>
          <input value={user?.name ?? ''} readOnly style={readOnly} tabIndex={-1} />
        </div>

        {/* Username */}
        <div>
          <label style={lbl}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            style={field} onFocus={focusBorder} onBlur={blurBorder}
            placeholder="lowercase_only"
          />
        </div>

        {/* Email — read-only */}
        <div>
          <label style={lbl}>Email</label>
          <input value={user?.email ?? ''} readOnly style={readOnly} tabIndex={-1} />
        </div>

        {/* Phone */}
        <div>
          <label style={lbl}>Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} style={field}
            onFocus={focusBorder} onBlur={blurBorder} placeholder="+91..." />
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--divider)', margin: '28px 0' }} />

      {/* Day bounds */}
      <span style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 500, display: 'block', marginBottom: 4 }}>
        Day boundaries
      </span>
      <p style={{ color: '#6B7280', fontSize: 13, margin: '0 0 14px' }}>
        Controls when your daily task list resets.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 480 }}>
        <div>
          <label style={lbl}>Start of day</label>
          <CustomTimePicker value={dayStart} onChange={setDayStart} />
        </div>
        <div>
          <label style={lbl}>End of day</label>
          <CustomTimePicker value={dayEnd} onChange={setDayEnd} />
        </div>
      </div>

      {/* save */}
      <div style={{ marginTop: 28 }}>
        <button onClick={handleSave} disabled={saving || !dirty}
          style={{
            background: dirty ? 'var(--accent)' : '#3A3F47',
            border: 'none', borderRadius: 8,
            color: dirty ? '#fff' : '#6B7280',
            fontSize: 13, fontWeight: 500,
            padding: '9px 24px', cursor: dirty ? 'pointer' : 'default',
            opacity: saving ? 0.5 : 1,
            transition: 'background 0.15s, color 0.15s',
          }}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
