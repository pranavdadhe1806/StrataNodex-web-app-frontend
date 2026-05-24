import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

type PwStep = 'idle' | 'otp';

export default function SecuritySettings() {
  const { user, setUser } = useAuthStore();

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const flash = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2800); };

  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const toggle2FA = async () => {
    if (!user) return;
    setTwoFaLoading(true);
    try {
      const updated = user.twoFactorEnabled
        ? await authApi.disable2FA()
        : await authApi.enable2FA('EMAIL');
      setUser(updated);
      flash(user.twoFactorEnabled ? '2FA disabled' : '2FA enabled — email OTP', true);
    } catch {
      flash('Could not update 2FA', false);
    } finally {
      setTwoFaLoading(false);
    }
  };

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
    if (newPw !== confirmPw) { setPwErr('Passwords don\'t match'); return; }
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

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '10px 18px', borderRadius: 8,
          background: toast.ok ? 'rgba(0,200,150,0.12)' : 'rgba(248,81,73,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(0,200,150,0.25)' : 'rgba(248,81,73,0.25)'}`,
          color: toast.ok ? '#00c896' : '#f85149', fontSize: 13, fontWeight: 500,
        }}>{toast.msg}</div>
      )}

      {/* ── 2FA ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: '#EDEFF3', fontSize: 15, fontWeight: 500 }}>Two-factor authentication</span>
          <button
            onClick={toggle2FA}
            disabled={twoFaLoading}
            style={{
              width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
              background: user?.twoFactorEnabled ? '#00bfff' : '#3A3F47',
              position: 'relative', transition: 'background 0.2s', opacity: twoFaLoading ? 0.5 : 1,
            }}
          >
            <span style={{
              position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff',
              left: user?.twoFactorEnabled ? 20 : 2, transition: 'left 0.2s',
            }} />
          </button>
        </div>
        <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          {user?.twoFactorEnabled
            ? 'A one-time code is sent to your email on every sign-in.'
            : 'Require an email code each time you log in.'}
        </p>
        {user?.twoFactorEnabled && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
            padding: '5px 12px', borderRadius: 6,
            background: 'rgba(0,191,255,0.06)', color: '#00bfff', fontSize: 12, fontWeight: 500,
          }}>
            <Shield size={13} /> Email OTP active
          </div>
        )}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />

      {/* ── Change password ── */}
      <div>
        <span style={{ color: '#EDEFF3', fontSize: 15, fontWeight: 500, display: 'block', marginBottom: 4 }}>Change password</span>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '0 0 16px' }}>
          We'll send a verification code to {user?.email}
        </p>

        {pwStep === 'idle' && (
          <button
            onClick={sendCode} disabled={pwBusy}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#EDEFF3', fontSize: 13, fontWeight: 500,
              padding: '8px 16px', cursor: 'pointer', opacity: pwBusy ? 0.5 : 1,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            {pwBusy ? 'Sending...' : 'Send verification code'}
          </button>
        )}

        {pwStep === 'otp' && (
          <div style={{ maxWidth: 360 }}>
            <label style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 8 }}>
              Verification code
            </label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {otp.map((d, i) => (
                <input
                  key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '');
                    handleOtp(i, v);
                    if (v && i < 5) (e.target.nextSibling as HTMLInputElement)?.focus();
                  }}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) (e.currentTarget.previousSibling as HTMLInputElement)?.focus(); }}
                  style={{
                    width: 40, height: 44, textAlign: 'center', fontSize: 16, fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    background: '#25282E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                    color: '#EDEFF3', outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,191,255,0.35)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              ))}
            </div>

            <label style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>New password</label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type={showPw ? 'text' : 'password'} value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 40px 10px 12px',
                  background: '#25282E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  color: '#EDEFF3', fontSize: 13, fontFamily: 'Poppins, sans-serif', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(0,191,255,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <label style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>Confirm password</label>
            <input
              type="password" value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                background: '#25282E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                color: '#EDEFF3', fontSize: 13, fontFamily: 'Poppins, sans-serif', outline: 'none',
                marginBottom: 16,
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,191,255,0.35)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />

            {pwErr && <p style={{ color: '#f85149', fontSize: 12, margin: '0 0 12px' }}>{pwErr}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitReset} disabled={pwBusy}
                style={{
                  background: '#00bfff', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 13, fontWeight: 500,
                  padding: '9px 20px', cursor: 'pointer', opacity: pwBusy ? 0.5 : 1,
                }}>
                {pwBusy ? 'Updating...' : 'Update password'}
              </button>
              <button onClick={resetPwForm}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  color: '#9CA3AF', fontSize: 13, padding: '9px 16px', cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
