import { useState } from 'react';
import { Shield, Eye, EyeOff, ChevronDown, ChevronUp, Monitor, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

const DS = {
  bg: 'var(--bg-base)',
  surface: 'var(--bg-card)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  accent: 'var(--accent)',
  teal: 'var(--accent-teal)',
  danger: '#ff4d4d',
  border: 'var(--border)',
  divider: 'var(--divider)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: DS.textMuted,
  fontFamily: 'var(--font-main)', marginBottom: 20,
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px', background: DS.bg,
  border: `1px solid ${DS.border}`, borderRadius: 8,
  color: DS.textPrimary, fontSize: 13, fontFamily: 'var(--font-main)',
  outline: 'none', transition: 'border-color 0.15s',
};

const lblStyle: React.CSSProperties = {
  color: DS.textMuted, fontSize: 12, fontWeight: 500,
  display: 'block', marginBottom: 6, fontFamily: 'var(--font-main)',
};

function Toggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      role="switch"
      aria-checked={enabled}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: enabled ? DS.accent : 'var(--border-bright)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        position: 'relative', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
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

type PwStep = 'idle' | 'otp';

// Mock session data for UI demonstration
const MOCK_SESSIONS = [
  { id: '1', device: 'Chrome on Windows', location: 'Mumbai, IN', lastSeen: 'Now', current: true },
  { id: '2', device: 'Safari on iPhone', location: 'Mumbai, IN', lastSeen: '2h ago', current: false },
  { id: '3', device: 'Firefox on Linux', location: 'Bangalore, IN', lastSeen: '3d ago', current: false },
];

export default function SecuritySection() {
  const { user, setUser } = useAuthStore();

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const flash = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2800); };

  // ── 2FA ──
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const toggle2FA = async () => {
    if (!user) return;
    setTwoFaLoading(true);
    try {
      const updated = user.twoFactorEnabled
        ? await authApi.disable2FA()
        : await authApi.enable2FA('EMAIL');
      setUser(updated);
      flash(user.twoFactorEnabled ? '2FA disabled' : '2FA enabled — email OTP active', true);
    } catch {
      flash('Could not update 2FA', false);
    } finally {
      setTwoFaLoading(false);
    }
  };

  // ── Change password ──
  const [pwStep, setPwStep] = useState<PwStep>('idle');
  const [pwBusy, setPwBusy] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwErr, setPwErr] = useState('');

  const sendCode = async () => {
    if (!user?.email) return;
    setPwBusy(true); setPwErr('');
    try {
      await authApi.forgotPassword(user.email);
      setPwStep('otp');
      setOtp(['', '', '', '', '', '']);
    } catch { setPwErr('Failed to send code'); }
    finally { setPwBusy(false); }
  };

  const submitReset = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setPwErr('Enter the full 6-digit code'); return; }
    if (newPw.length < 6) { setPwErr('Min 6 characters'); return; }
    if (newPw !== confirmPw) { setPwErr("Passwords don't match"); return; }
    if (!user?.email) return;
    setPwBusy(true); setPwErr('');
    try {
      await authApi.resetPassword(user.email, code, newPw);
      flash('Password updated', true);
      resetPwForm();
    } catch { setPwErr('Invalid or expired code'); }
    finally { setPwBusy(false); }
  };

  const resetPwForm = () => {
    setPwStep('idle'); setOtp(['', '', '', '', '', '']); setNewPw(''); setConfirmPw(''); setPwErr('');
  };

  const handleOtp = (i: number, v: string) => {
    const next = [...otp]; next[i] = v; setOtp(next);
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!digits.length) return;
    const next = ['', '', '', '', '', ''];
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
  };

  // ── Sessions ──
  const [sessionsExpanded, setSessionsExpanded] = useState(false);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    flash('Session revoked', true);
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'rgba(36,119,198,0.35)');
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = DS.border);

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '10px 18px', borderRadius: 8,
          background: toast.ok ? 'rgba(48,209,88,0.12)' : 'rgba(255,77,77,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(48,209,88,0.25)' : 'rgba(255,77,77,0.25)'}`,
          color: toast.ok ? DS.teal : DS.danger, fontSize: 13, fontWeight: 500,
        }}>{toast.msg}</div>
      )}

      <div style={sectionLabel}>Authentication</div>

      {/* ── 2FA row ── */}
      <div style={{ padding: '14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Two-factor authentication</div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5 }}>
              {user?.twoFactorEnabled
                ? 'A one-time code is sent to your email on every sign-in.'
                : 'Require an email code each time you log in.'}
            </div>
            {user?.twoFactorEnabled && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
                padding: '4px 10px', borderRadius: 6,
                background: 'rgba(36,119,198,0.06)', color: DS.accent, fontSize: 11, fontWeight: 500,
              }}>
                <Shield size={11} /> Email OTP active
              </div>
            )}
          </div>
          <Toggle enabled={!!user?.twoFactorEnabled} onToggle={toggle2FA} disabled={twoFaLoading} />
        </div>
      </div>

      <div style={{ height: 1, background: DS.divider }} />

      {/* ── Change password row ── */}
      <div style={{ padding: '14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Change password</div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5 }}>
              We'll send a verification code to {user?.email}
            </div>
          </div>
          {pwStep === 'idle' && (
            <button
              onClick={sendCode} disabled={pwBusy}
              style={{
                background: 'none', border: `1px solid ${DS.border}`,
                borderRadius: 8, color: DS.textSecondary, fontSize: 12, fontWeight: 500,
                padding: '7px 14px', cursor: 'pointer', opacity: pwBusy ? 0.5 : 1,
                fontFamily: 'var(--font-main)', flexShrink: 0,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = DS.border)}
            >
              {pwBusy ? 'Sending...' : 'Send verification code'}
            </button>
          )}
        </div>

        {/* Inline OTP + new password form */}
        {pwStep === 'otp' && (
          <div style={{ marginTop: 16, maxWidth: 340 }}>
            <label style={lblStyle}>Verification code</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {otp.map((d, i) => (
                <input
                  key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '');
                    handleOtp(i, v);
                    if (v && i < 5) (e.target.nextSibling as HTMLInputElement)?.focus();
                  }}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) (e.currentTarget.previousSibling as HTMLInputElement)?.focus(); }}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  style={{
                    width: 40, height: 44, textAlign: 'center', fontSize: 16, fontWeight: 600,
                    fontFamily: 'var(--font-main)', boxSizing: 'border-box',
                    background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 8,
                    color: DS.textPrimary, outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={focusBorder} onBlur={blurBorder}
                />
              ))}
            </div>

            <label style={lblStyle}>New password</label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type={showPw ? 'text' : 'password'} value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters"
                style={{ ...inputStyle, paddingRight: 38 }}
                onFocus={focusBorder} onBlur={blurBorder}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: DS.textMuted, cursor: 'pointer', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <label style={lblStyle}>Confirm password</label>
            <input
              type="password" value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password"
              style={{ ...inputStyle, marginBottom: 16 }}
              onFocus={focusBorder} onBlur={blurBorder}
            />

            {pwErr && <p style={{ color: DS.danger, fontSize: 12, margin: '0 0 12px', fontFamily: 'var(--font-main)' }}>{pwErr}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitReset} disabled={pwBusy}
                style={{
                  background: DS.accent, border: 'none', borderRadius: 8,
                  color: 'var(--bg-base)', fontSize: 13, fontWeight: 600,
                  padding: '8px 18px', cursor: 'pointer', opacity: pwBusy ? 0.5 : 1,
                  fontFamily: 'var(--font-main)',
                }}>
                {pwBusy ? 'Updating...' : 'Update password'}
              </button>
              <button onClick={resetPwForm}
                style={{
                  background: 'none', border: `1px solid ${DS.border}`, borderRadius: 8,
                  color: DS.textMuted, fontSize: 13, padding: '8px 14px', cursor: 'pointer',
                  fontFamily: 'var(--font-main)',
                }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: DS.divider }} />

      {/* ── Active sessions ── */}
      <div style={{ padding: '14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setSessionsExpanded(v => !v)}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Monitor size={14} style={{ color: DS.textMuted }} />
              <span style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Active sessions</span>
            </div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5, paddingLeft: 22 }}>
              {sessions.length} device{sessions.length !== 1 ? 's' : ''} currently logged in
            </div>
          </div>
          {sessionsExpanded ? <ChevronUp size={16} color={DS.textMuted} /> : <ChevronDown size={16} color={DS.textMuted} />}
        </div>

        {sessionsExpanded && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {sessions.map(session => (
              <div key={session.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${DS.divider}`,
                marginBottom: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {session.current
                    ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: DS.teal, flexShrink: 0 }} />
                    : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                  }
                  <div>
                    <div style={{ fontSize: 12, color: DS.textPrimary, fontWeight: 500, fontFamily: 'var(--font-main)' }}>
                      {session.device}
                      {session.current && <span style={{ marginLeft: 8, fontSize: 10, color: DS.teal, background: 'rgba(48,209,88,0.12)', padding: '1px 6px', borderRadius: 3 }}>Current</span>}
                    </div>
                    <div style={{ fontSize: 11, color: DS.textMuted, fontFamily: 'var(--font-main)', marginTop: 1 }}>
                      {session.location} · {session.lastSeen}
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    style={{
                      background: 'none', border: `1px solid rgba(255,77,77,0.25)`,
                      borderRadius: 6, color: DS.danger, fontSize: 11, fontWeight: 500,
                      padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-main)',
                    }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Danger zone ── */}
      <div style={{ height: 1, background: DS.divider, margin: '8px 0 20px' }} />
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: DS.danger,
        fontFamily: 'var(--font-main)', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <AlertTriangle size={12} /> Danger zone
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <div>
          <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Delete account</div>
          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5 }}>
            Permanently remove your account and all associated data. This cannot be undone.
          </div>
        </div>
        <button
          onClick={() => flash('Account deletion coming soon', false)}
          style={{
            background: 'rgba(255,77,77,0.08)', border: `1px solid rgba(255,77,77,0.25)`,
            borderRadius: 8, color: DS.danger, fontSize: 12, fontWeight: 500,
            padding: '7px 16px', cursor: 'pointer', fontFamily: 'var(--font-main)',
            flexShrink: 0, marginLeft: 16,
          }}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
